# Appointed Editorial Roles — Design Spec

**Date:** 2026-08-03
**Status:** Approved for planning

---

## 1. The problem

`editorial_roles` has two states: `recruiting` and `pending` ("Appointment pending"). When someone
is actually appointed to a role, there is nowhere to record it. The only way to stop a filled role
advertising itself is to set it to `pending`, which tells visitors the opposite of the truth: the
post is filled, not waiting.

There is also nowhere to put the appointee's name. `editorial_roles` stores a post, never a person,
and `team_members` is a separate table for the three founders.

## 2. What we are building

A third status, `appointed`, and a nullable `holder_name` column. An appointed role shows the
person's name on the team page and disappears from the application form.

### Success criteria

- An editor can appoint someone to a role from the admin panel: pick "Appointed", type a name, save.
- `/team` shows that role as `APPOINTED — Jane Doe`, in ink, distinct from pending and recruiting.
- `/editors/apply` no longer offers the role, and the server rejects an application naming it.
- The three seeded core team members and the seven seeded roles are unchanged in behaviour.

### Out of scope

Decided against, deliberately:

- **No link to `team_members`.** Appointing someone does not create a core team card. If a new
  appointee should also appear in the Core team grid with a photo and a biography, an editor adds
  that record by hand. Two tables, no sync, no hidden coupling.
- **No photo on the role row.** The Editorial roles list is a text list divided by rules. It stays
  one.
- **No dedicated appointment date, term, or history.** A role holds one name or none.

## 3. Data model

### Migration — `supabase/migrations/0006_appointed_roles.sql`

```sql
alter type editorial_role_status add value if not exists 'appointed';
alter table editorial_roles add column holder_name text;
```

Postgres permits `ALTER TYPE ... ADD VALUE` inside a transaction, but the new value cannot be *used*
until that transaction commits. This migration therefore only adds the value and the column. It sets
no row to `appointed`; that happens later, from the admin panel or a subsequent migration.

`holder_name` is nullable with no default. Every existing row gets `null`, which is correct: none of
them is appointed.

### Schema — `src/lib/content/schema.ts`

```ts
export const editorialRoleStatusSchema = z.enum(['pending', 'recruiting', 'appointed'])

export const editorialRoleSchema = z.object({
  title: z.string(),
  status: editorialRoleStatusSchema,
  statusLabel: z.string(),
  holderName: z.string().nullable(),
  duty: z.string(),
  sortOrder: z.number().int(),
})
```

`holderName` is nullable rather than optional, so both data sources must state it and neither can
forget it.

### Sources

- `src/lib/content/sources/supabase.ts` — `getEditorialRoles` maps `holderName: row.holder_name`.
- `src/lib/content/seed/roles.ts` — all seven entries gain `holderName: null`, written out
  explicitly the way `seed/team.ts` writes `portraitPath: null`.
- `scripts/seed.ts` — the `editorial_roles` insert carries `holder_name`.

## 4. Public page — `src/app/(site)/team/page.tsx`

### The decision, extracted — `src/lib/roles.ts` (new)

The current inline ternary

```tsx
style={{ color: role.status === 'pending' ? '#8A7B5C' : '#5D1D21' }}
```

fails open: any status that is not `pending` renders maroon, so `appointed` would silently read as
recruiting. Both the colour and the name visibility are decisions worth testing without a browser,
so they move into one pure function beside the page:

```ts
import type { EditorialRole } from '@/lib/content'

const STATUS_COLOUR: Record<EditorialRole['status'], string> = {
  pending: '#8A7B5C',    // gold-muted — waiting
  recruiting: '#5D1D21', // maroon — open, apply
  appointed: '#241F1E',  // ink — settled
}

/** Colour for the status line, and the name to show beside it, if any. */
export function roleStatusDisplay(role: EditorialRole): {
  colour: string
  holderName: string | null
} {
  const name = role.holderName?.trim()
  return {
    colour: STATUS_COLOUR[role.status],
    holderName: role.status === 'appointed' && name ? name : null,
  }
}
```

**Why the blank check, and not just a null check.** The admin panel's `coerce`
(`src/lib/admin/actions.ts:68-69`) writes `''` for an empty text field — only `image`, `pdf`,
`number`, `date`, `discipline` and `issue` get the `value === '' ? null` treatment. So an editor who
picks "Appointed" and leaves the name empty stores `''`, not `null`, and a plain null check would
render the separator with nothing after it. Normalising here is cheaper and narrower than changing
`coerce`'s default, which every text field on every entity shares.

An exhaustive `Record` keyed by the status union means a fourth status added later is a type error
rather than a wrong colour. `src/lib/layout.ts` with `tests/unit/layout.test.ts` is the existing
precedent for a small pure helper in `src/lib/` covered by a unit test; this follows it.

Ink was chosen over a new green because the journal's palette has no green anywhere else, and over
`--color-gold` because it sits too close to the muted gold already used for pending.

**The status governs the name, not the other way round.** The helper returns `null` for the name
unless the status is `appointed`. A name left behind in the field on a role switched back to
`recruiting` shows nothing, so un-appointing someone is one dropdown change and cannot leak a stale
name.

### Rendering

The page calls the helper per role and renders the label, then the name when the helper returns one:

```
Section Editor, Humanities
APPOINTED · Jane Doe
Oversees history, literature, philosophy, and the arts.
```

The label keeps its uppercase tracking; the name is wrapped in a `normal-case` span so it reads as a
name rather than a shouted constant.

**Separator is a middot, not an em dash.** The journal does not use em dashes: `tests/unit/content.test.ts`
asserts none appear in seeded copy, and there is not one anywhere in `src/`. The middot is the
established separator, used in ten files on both the public site and the admin — `Volume 1 · Issue 1`,
`Open access · ISSN applied for`, `{author.role} · {author.affiliation}`. An em dash here would have
been the first in the codebase.

## 5. Admin — `src/lib/admin/entities.ts`

The `roles` entity gains a third option and one field.

Select "Is it open?" becomes:

```ts
options: [
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'pending', label: 'Appointment pending' },
  { value: 'appointed', label: 'Appointed' },
],
```

The help text "Only roles set to Recruiting can be applied for." stays true and now carries more
weight, since it is what takes a filled role off the form.

`status_label` already tracks the select through `followsStatus` (`RecordForm.tsx:84`), so choosing
"Appointed" fills the label with `Appointed` and leaves it editable — an editor who prefers
"Appointed, from September" can write that.

New field, placed after `duty`:

```ts
{
  name: 'holder_name',
  label: 'Who holds it',
  type: 'text',
  help: 'Shown on the team page beside the role. Leave empty unless the status is Appointed.',
}
```

Not required: six of the seven roles have no holder, and requiring it would block every ordinary
edit to a recruiting role.

`listColumns` stays `['status_label']`. The list already reads "Appointed" for a filled role, which
is the fact an editor scans for.

## 6. Application guards — no change

Two places gate applications, and both filter on `recruiting` specifically rather than excluding
`pending`:

- `src/app/(site)/editors/apply/page.tsx:56` — `roles.filter((role) => role.status === 'recruiting')`
- `src/lib/inbox/actions.ts:153` — `.eq('status', 'recruiting')` before accepting a submission

An appointed role therefore leaves the dropdown and is rejected server-side with the existing
message ("That role is no longer open. Please choose another.") without a line changing. This is
worth stating because it is the part most likely to be "fixed" by someone adding a redundant
`!== 'appointed'` check.

## 7. Tests

The seed ships no appointed role, and this spec does not add one — the journal has appointed nobody
yet, and inventing a name to satisfy a test would put a fake editor on the live site. So the
appointed rendering is proved by unit tests over `roleStatusDisplay`, not end to end.

**Unit — `tests/unit/roles.test.ts` (new)**

- `appointed` returns ink `#241F1E` and the holder's name.
- `recruiting` returns maroon `#5D1D21` and `null`, *even when `holderName` is set* — this is the
  stale-name case from §4 and the main reason the helper exists.
- `pending` returns gold-muted `#8A7B5C` and `null`.
- `appointed` with `holderName: null` returns `null`, so the page renders no dangling separator.
- `appointed` with `holderName: ''` and with `'   '` both return `null` — the value the admin panel
  actually writes for an empty field.
- `appointed` with `holderName: '  Jane Doe  '` returns `'Jane Doe'`, trimmed.

**Unit — `tests/unit/content.test.ts`**

- `getEditorialRoles()` parses every seeded role, each with `holderName: null`.
- `editorialRoleSchema` rejects a role whose `holderName` key is absent.
- `editorialRoleStatusSchema` accepts `appointed`.

**E2E — `tests/e2e/views.spec.ts`: unchanged.**

The test at line 229, "distinguishes pending from recruiting by colour", asserts the two colours the
seed actually produces. It keeps passing and needs no edit. Listed here so that "extend the colour
test" is not attempted during implementation and quietly abandoned.

**Regression watch:** `tests/e2e/forms.spec.ts:38` counts "six recruiting roles plus the disabled
placeholder" in the apply dropdown. The seed is unchanged, so this count must still hold. If it
breaks, a seeded role was flipped to `appointed` by mistake.

## 8. Files touched

| File | Change |
| --- | --- |
| `supabase/migrations/0006_appointed_roles.sql` | New. Enum value, `holder_name` column. |
| `src/lib/content/schema.ts` | `appointed` in the status enum; `holderName` on the role schema. |
| `src/lib/content/sources/supabase.ts` | Map `holder_name` → `holderName`. |
| `src/lib/content/seed/roles.ts` | `holderName: null` on all seven. |
| `scripts/seed.ts` | Insert `holder_name`. |
| `src/lib/roles.ts` | New. `roleStatusDisplay` — colour map and name visibility. |
| `src/app/(site)/team/page.tsx` | Call the helper; render the name. |
| `src/lib/admin/entities.ts` | Third select option; `holder_name` field. |
| `tests/unit/roles.test.ts` | New. Colour and name-visibility coverage. |
| `tests/unit/entities.test.ts` | New. Third select option and `holder_name` field present. |
| `tests/unit/content.test.ts` | Schema and seed coverage. |

`tests/e2e/views.spec.ts` and the two application guards are deliberately absent from this table.
