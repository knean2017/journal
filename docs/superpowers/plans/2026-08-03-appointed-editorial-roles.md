# Appointed Editorial Roles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `editorial_roles` a third status, `appointed`, and a `holder_name` column, so a filled role stops advertising itself and shows who holds it.

**Architecture:** One migration adds an enum value and a nullable column. The Zod schema and both content sources (Supabase and the static seed) carry `holderName` through. A new pure helper, `roleStatusDisplay`, owns the two display decisions — which colour the status line takes, and whether a name shows — so both are unit-testable without a browser. The team page calls it. The admin panel gains a select option and a text field; the generic record editor saves the new column with no new code.

**Tech Stack:** Next.js 15 App Router (server components), TypeScript, Zod, Supabase (Postgres), Tailwind v4, Vitest (unit), Playwright (e2e).

**Spec:** `docs/superpowers/specs/2026-08-03-appointed-editorial-roles-design.md`

## Global Constraints

- **No em dashes anywhere in site copy or `src/`.** `tests/unit/content.test.ts` asserts none appear in seeded copy, and `src/` currently contains zero. The separator between a status label and a holder's name is a middot `·`, matching `Volume 1 · Issue 1` and the nine other files that use it.
- **The migration must not set any row to `appointed`.** Postgres permits `ALTER TYPE ... ADD VALUE` inside a transaction but forbids *using* the new value until that transaction commits. Adding the value and the column is all this migration does.
- **The seed appoints nobody.** The journal has appointed no editors. Do not invent a name in `seed/roles.ts` to make a test greener — that puts a fake editor on the live site. All seven seeded roles keep `holderName: null`.
- **`holderName` is nullable, never optional.** `z.string().nullable()`, not `.optional()`, so both content sources must state it and neither can silently omit it.
- **Colours are the three literal hex values** `#8A7B5C` (pending), `#5D1D21` (recruiting), `#241F1E` (appointed). The existing e2e test asserts the first two as `rgb()` strings; do not swap them for CSS variables.
- **Do not add an `!== 'appointed'` check to the application guards.** Both already filter on `status === 'recruiting'` specifically. See Task 5.
- Run commands from the repo root. Unit tests: `npm test`. Lint: `npm run lint`. Typecheck happens in `npm run build`.

---

### Task 1: Data model — migration, schema, sources, seed

Everything that has to agree about the shape of a role, changed together. Splitting the Zod schema from the two sources that must satisfy it would leave the tree red in between.

**Files:**
- Create: `supabase/migrations/0006_appointed_roles.sql`
- Modify: `src/lib/content/schema.ts:27-35`
- Modify: `src/lib/content/seed/roles.ts` (all seven entries)
- Modify: `src/lib/content/sources/supabase.ts:191-205`
- Modify: `scripts/seed.ts:105-113`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `EditorialRole` gains `holderName: string | null`. `EditorialRole['status']` becomes the union `'pending' | 'recruiting' | 'appointed'`. Tasks 2, 3 and 4 all depend on both.

- [ ] **Step 1: Write the failing tests**

In `tests/unit/content.test.ts`, add a second import statement below the existing `@/lib/content` import block (which ends at line 12). This is a new import, not an addition to the existing one — the accessors come from `@/lib/content`, the schemas from `@/lib/content/schema`:

```ts
import { editorialRoleSchema, editorialRoleStatusSchema } from '@/lib/content/schema'
```

Then add this describe block after the existing `describe('content accessors', ...)` block:

```ts
describe('editorial role status', () => {
  it('accepts appointed alongside pending and recruiting', () => {
    expect(editorialRoleStatusSchema.parse('appointed')).toBe('appointed')
    expect(editorialRoleStatusSchema.parse('pending')).toBe('pending')
    expect(editorialRoleStatusSchema.parse('recruiting')).toBe('recruiting')
  })

  it('rejects a status it does not know', () => {
    expect(editorialRoleStatusSchema.safeParse('filled').success).toBe(false)
  })

  it('appoints nobody in the seed', async () => {
    const roles = await getEditorialRoles()
    expect(roles.every((r) => r.holderName === null)).toBe(true)
    expect(roles.some((r) => r.status === 'appointed')).toBe(false)
  })

  it('requires holderName to be stated rather than omitted', () => {
    const withoutHolder = {
      title: 'Section Editor, Humanities',
      status: 'recruiting',
      statusLabel: 'Recruiting',
      duty: 'Oversees history, literature, philosophy, and the arts.',
      sortOrder: 5,
    }
    expect(editorialRoleSchema.safeParse(withoutHolder).success).toBe(false)
    expect(editorialRoleSchema.safeParse({ ...withoutHolder, holderName: null }).success).toBe(true)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/unit/content.test.ts`

Expected: FAIL. `editorialRoleStatusSchema.parse('appointed')` throws on an unrecognised enum value, and the `holderName` assertions fail because the property does not exist.

- [ ] **Step 3: Write the migration**

Create `supabase/migrations/0006_appointed_roles.sql`. Note the file number: `0005_cover_letter.sql` already exists.

```sql
-- A third state for an editorial role: someone holds it.
--
-- The table had two, `recruiting` and `pending`, and neither describes a filled
-- post. An editor who appointed somebody could only set the role to
-- "Appointment pending", which tells a visitor the opposite of the truth, and
-- there was nowhere to record the name.
--
-- The enum value is added here but used nowhere in this migration. Postgres
-- allows ALTER TYPE ... ADD VALUE inside a transaction, but the value cannot be
-- referenced until that transaction commits, so any statement setting a row to
-- 'appointed' would fail. Appointments are made from the admin panel.
alter type editorial_role_status add value if not exists 'appointed';

-- Nullable, and null for every existing row, which is correct: none of them is
-- appointed. Only read when the status is 'appointed', so a name left behind on
-- a role that goes back to recruiting is never shown.
alter table editorial_roles add column holder_name text;

comment on column editorial_roles.holder_name is
  'Who holds the post. Shown on the team page only when status is appointed. Null while the role is recruiting or pending.';
```

- [ ] **Step 4: Widen the Zod schema**

In `src/lib/content/schema.ts`, replace lines 27-35:

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

- [ ] **Step 5: Add `holderName` to all seven seeded roles**

In `src/lib/content/seed/roles.ts`, add `holderName: null,` to every entry, placed after `statusLabel`. Written out on each rather than defaulted, the way `seed/team.ts` writes `portraitPath: null`. The first entry becomes:

```ts
  {
    title: 'Managing Editor',
    status: 'pending',
    statusLabel: 'Appointment pending',
    holderName: null,
    duty: 'Runs the review cycle, correspondence, and production schedule.',
    sortOrder: 1,
  },
```

Do the same for the remaining six: Section Editor Natural Sciences, Business & Economics, Law & Policy, Humanities, Social Sciences, and Copyeditor. Change nothing else about them — the statuses stay as they are.

- [ ] **Step 6: Read the column in the Supabase source**

In `src/lib/content/sources/supabase.ts`, `getEditorialRoles` at line 191. Add `holder_name` to the select list and map it:

```ts
export const getEditorialRoles = cache(async (): Promise<EditorialRole[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase
    .from('editorial_roles')
    .select('title, status, status_label, holder_name, duty, sort_order')
    .order('sort_order')

  return (data ?? []).map((row) => ({
    title: row.title,
    status: row.status,
    statusLabel: row.status_label,
    holderName: row.holder_name,
    duty: row.duty,
    sortOrder: row.sort_order,
  }))
})
```

The select list is explicit, so forgetting `holder_name` there would return `undefined` and fail the schema's `nullable()` — which is the point of not making it optional.

- [ ] **Step 7: Write the column in the seed script**

In `scripts/seed.ts`, the `editorial_roles` insert at line 105:

```ts
      await supabase.from('editorial_roles').insert(
        editorialRoles.map((r) => ({
          title: r.title,
          status: r.status,
          status_label: r.statusLabel,
          holder_name: r.holderName,
          duty: r.duty,
          sort_order: r.sortOrder,
        })),
      )
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test`

Expected: PASS, all files. The existing `returns seven editorial roles and excludes Editor-in-Chief` test and the `contains no em dashes in any seeded copy` test must both still pass — the second now also covers the `holderName` values, which are all null.

- [ ] **Step 9: Commit**

```bash
git add supabase/migrations/0006_appointed_roles.sql src/lib/content/schema.ts src/lib/content/seed/roles.ts src/lib/content/sources/supabase.ts scripts/seed.ts tests/unit/content.test.ts
git commit -m "feat: record who holds an editorial role"
```

---

### Task 2: The display helper

**Files:**
- Create: `src/lib/roles.ts`
- Test: `tests/unit/roles.test.ts` (create)

**Interfaces:**
- Consumes: `EditorialRole` from Task 1, with `holderName: string | null` and the three-value status union.
- Produces: `roleStatusDisplay(role: EditorialRole): { colour: string; holderName: string | null }`. Task 3 calls it.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/roles.test.ts`. It follows `tests/unit/layout.test.ts` — Vitest, `@/` import alias, one `describe` per exported function.

```ts
import { describe, expect, it } from 'vitest'
import type { EditorialRole } from '@/lib/content'
import { roleStatusDisplay } from '@/lib/roles'

function role(overrides: Partial<EditorialRole> = {}): EditorialRole {
  return {
    title: 'Section Editor, Humanities',
    status: 'recruiting',
    statusLabel: 'Recruiting',
    holderName: null,
    duty: 'Oversees history, literature, philosophy, and the arts.',
    sortOrder: 5,
    ...overrides,
  }
}

describe('roleStatusDisplay', () => {
  it('gives each status its own colour', () => {
    expect(roleStatusDisplay(role({ status: 'pending' })).colour).toBe('#8A7B5C')
    expect(roleStatusDisplay(role({ status: 'recruiting' })).colour).toBe('#5D1D21')
    expect(roleStatusDisplay(role({ status: 'appointed' })).colour).toBe('#241F1E')
  })

  it('shows the name of whoever holds an appointed role', () => {
    const display = roleStatusDisplay(role({ status: 'appointed', holderName: 'Jane Doe' }))
    expect(display.holderName).toBe('Jane Doe')
  })

  it('hides a name left behind on a role that is no longer appointed', () => {
    // Un-appointing someone is one dropdown change in the admin. It must not
    // take a second edit to clear the name, or a stale name leaks to the site.
    expect(roleStatusDisplay(role({ status: 'recruiting', holderName: 'Jane Doe' })).holderName)
      .toBeNull()
    expect(roleStatusDisplay(role({ status: 'pending', holderName: 'Jane Doe' })).holderName)
      .toBeNull()
  })

  it('treats an empty name as no name', () => {
    // The admin panel's coerce() writes '' for an empty text field, not null,
    // so a null check alone would render a separator with nothing after it.
    expect(roleStatusDisplay(role({ status: 'appointed', holderName: null })).holderName).toBeNull()
    expect(roleStatusDisplay(role({ status: 'appointed', holderName: '' })).holderName).toBeNull()
    expect(roleStatusDisplay(role({ status: 'appointed', holderName: '   ' })).holderName).toBeNull()
  })

  it('trims a name that was typed with stray spaces', () => {
    expect(roleStatusDisplay(role({ status: 'appointed', holderName: '  Jane Doe  ' })).holderName)
      .toBe('Jane Doe')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/roles.test.ts`

Expected: FAIL with a resolution error — `Failed to resolve import "@/lib/roles"`.

- [ ] **Step 3: Write the helper**

Create `src/lib/roles.ts`:

```ts
import type { EditorialRole } from '@/lib/content'

/**
 * The colour each status takes on the team page.
 *
 * Keyed by the status union rather than written as a ternary, so a fourth
 * status added later is a type error here instead of a role quietly rendering
 * in the wrong colour. The previous ternary failed open: anything that was not
 * `pending` came out maroon, which would have made an appointed role read as
 * one that is still recruiting.
 *
 * Ink for appointed, over a green the palette has nowhere else and over
 * `--color-gold`, which sits too close to the muted gold pending already uses.
 */
const STATUS_COLOUR: Record<EditorialRole['status'], string> = {
  pending: '#8A7B5C', // gold-muted, waiting
  recruiting: '#5D1D21', // maroon, open to apply for
  appointed: '#241F1E', // ink, settled
}

/**
 * How a role's status line should read: its colour, and the name to show beside
 * it, if there is one to show.
 *
 * The status governs the name, not the other way round. A name is only returned
 * for an appointed role, so putting a role back to recruiting takes one change
 * in the admin and cannot leave a stale name on the site.
 *
 * Blank counts as absent. The admin panel's `coerce` writes '' for an empty text
 * field rather than null, so an editor who picks "Appointed" and saves without
 * typing a name would otherwise get a separator followed by nothing.
 */
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

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/unit/roles.test.ts`

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/roles.ts tests/unit/roles.test.ts
git commit -m "feat: decide role status colour and holder name in one place"
```

---

### Task 3: Render the holder on the team page

**Files:**
- Modify: `src/app/(site)/team/page.tsx:58-72`
- Test: `tests/e2e/views.spec.ts` (run only — no edit, see below)

**Interfaces:**
- Consumes: `roleStatusDisplay` from Task 2.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Import the helper**

In `src/app/(site)/team/page.tsx`, add to the imports at the top (after the `@/lib/content` import on line 5):

```ts
import { roleStatusDisplay } from '@/lib/roles'
```

- [ ] **Step 2: Replace the roles map**

Replace the whole `{roles.map((role) => ( ... ))}` block, lines 58-71, with:

```tsx
          {roles.map((role) => {
            const { colour, holderName } = roleStatusDisplay(role)

            return (
              <div key={role.title} className="py-6 pr-[26px] border-b border-rule">
                <div className="font-serif text-[18px] font-bold text-ink">{role.title}</div>
                <div
                  className="mt-[6px] text-[11.5px] tracking-[0.14em] uppercase font-bold"
                  style={{ color: colour }}
                >
                  {role.statusLabel}
                  {holderName && (
                    <span className="normal-case tracking-[0.04em]"> · {holderName}</span>
                  )}
                </div>
                <p className="mt-[9px] mb-0 text-[13.5px] leading-[1.75] text-body-muted">
                  {role.duty}
                </p>
              </div>
            )
          })}
```

Three things to keep straight:
- The `style={{ color: ... }}` inline attribute stays inline. The e2e test at `tests/e2e/views.spec.ts:229` asserts computed `rgb()` values; a Tailwind class would still pass but the hex literals are what the helper returns.
- The name sits inside the status `div` so it inherits the colour, but takes `normal-case` to undo the parent's `uppercase` and a looser `tracking` so it reads as a name and not a label.
- The separator is a middot, written with its spaces inside the span on one line: `<span ...> · {holderName}</span>`. JSX only strips whitespace around newlines, so a leading space kept on the same line as the text survives and the row renders `APPOINTED · Jane Doe`. **Not an em dash** — see Global Constraints.

- [ ] **Step 3: Verify nothing regressed**

Run: `npm test && npm run lint && npm run build`

Expected: PASS on all three. `npm run build` is what typechecks — it must report no TypeScript errors for `team/page.tsx`.

- [ ] **Step 4: Verify the team page still renders the two seeded colours**

Run: `npm run test:e2e -- tests/e2e/views.spec.ts -g "our team"`

The describe block is named `our team` (`tests/e2e/views.spec.ts:218`), not `team`.

Expected: PASS, including `distinguishes pending from recruiting by colour`. That test is **not edited** — the seed appoints nobody, so there is no third colour on the page to assert. Its passing proves the refactor from ternary to lookup table did not change the two colours that do render.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)/team/page.tsx"
git commit -m "feat: show who holds an appointed role on the team page"
```

---

### Task 4: Appoint someone from the admin panel

**Files:**
- Modify: `src/lib/admin/entities.ts:151-168`
- Test: `tests/unit/entities.test.ts` (create)

**Interfaces:**
- Consumes: nothing from Tasks 1-3 at the type level; the `holder_name` column from Task 1 at runtime.
- Produces: nothing other tasks depend on.

`saveRecord` builds its payload generically from `entity.fields` via `coerce` (`src/lib/admin/actions.ts:35`), so declaring the field is all it takes to make it save. No change to `actions.ts`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/entities.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { findEntity } from '@/lib/admin/entities'

describe('editorial roles entity', () => {
  it('offers appointed as a third status', () => {
    const status = findEntity('roles')?.fields.find((f) => f.name === 'status')
    expect(status?.options?.map((o) => o.value)).toEqual(['recruiting', 'pending', 'appointed'])
    expect(status?.options?.find((o) => o.value === 'appointed')?.label).toBe('Appointed')
  })

  it('has somewhere to put the holder name, not required', () => {
    const holder = findEntity('roles')?.fields.find((f) => f.name === 'holder_name')
    expect(holder).toBeDefined()
    expect(holder?.type).toBe('text')
    // Six of the seven roles have no holder. Requiring it would block every
    // ordinary edit to a role that is still recruiting.
    expect(holder?.required).toBeUndefined()
  })

  it('keeps status_label following the status select', () => {
    const label = findEntity('roles')?.fields.find((f) => f.name === 'status_label')
    expect(label?.followsStatus).toBe('status')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/entities.test.ts`

Expected: FAIL. The options array has two entries, not three, and `holder_name` is `undefined`.

- [ ] **Step 3: Add the option and the field**

In `src/lib/admin/entities.ts`, in the `roles` entity. Add the third option to the `status` field (currently lines 156-159):

```ts
        options: [
          { value: 'recruiting', label: 'Recruiting' },
          { value: 'pending', label: 'Appointment pending' },
          { value: 'appointed', label: 'Appointed' },
        ],
```

Leave the existing help text, `'Only roles set to Recruiting can be applied for.'`, exactly as it is — it is now what explains why appointing somebody takes the role off the application form.

Then add a new field immediately after the `duty` field (which ends at line 168), before `status_label`:

```ts
      {
        name: 'holder_name',
        label: 'Who holds it',
        type: 'text',
        help: 'Shown on the team page beside the role. Leave empty unless the status is Appointed.',
      },
```

Do not mark it `required` and do not mark it `advanced` — an editor appointing somebody should meet it in the main body of the form, right after the role's duties.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`

Expected: PASS, all files.

- [ ] **Step 5: Verify the panel builds**

Run: `npm run lint && npm run build`

Expected: PASS. `Field` already permits an optional `help` and no `required`, so no change to the `Field` type.

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin/entities.ts tests/unit/entities.test.ts
git commit -m "feat: appoint an editor to a role from the admin panel"
```

---

### Task 5: Confirm the application guards, change nothing

A verification task with no production code. It exists because the obvious "completeness" edit here is wrong, and someone reviewing the diff will want to make it.

**Files:**
- Read only: `src/app/(site)/editors/apply/page.tsx:56`, `src/lib/inbox/actions.ts:150-161`
- Test: `tests/e2e/forms.spec.ts` (run only)

- [ ] **Step 1: Confirm both guards filter on `recruiting`, not on "not pending"**

Read `src/app/(site)/editors/apply/page.tsx:56`:

```ts
const openRoles = roles.filter((role) => role.status === 'recruiting')
```

And `src/lib/inbox/actions.ts:150-153`:

```ts
  const { data: openRoles } = await supabase
    .from('editorial_roles')
    .select('title')
    .eq('status', 'recruiting')
```

Both name the one status that is open rather than excluding the ones that are not. An `appointed` role therefore leaves the dropdown and is rejected server-side by the existing message, `'That role is no longer open. Please choose another.'`, with nothing added.

**Do not add `&& role.status !== 'appointed'` or `.neq('status', 'appointed')`.** They are redundant today and become wrong the moment a fourth status is added, because they would let it through.

- [ ] **Step 2: Verify the application form is unaffected**

Run: `npm run test:e2e -- tests/e2e/forms.spec.ts`

Expected: PASS. The test at line 38 counts six recruiting roles plus the disabled placeholder in the dropdown. The seed is unchanged, so this count must still hold — if it has moved, a seeded role was flipped to `appointed` in Task 1, which Global Constraints forbids.

- [ ] **Step 3: Full verification before handing back**

Run: `npm test && npm run lint && npm run build && npm run test:e2e`

Expected: PASS on all four. Record the actual output; do not report the feature complete on any of them failing.

- [ ] **Step 4: Update the knowledge graph**

Run: `graphify update .`

- [ ] **Step 5: Do not commit the graph**

`graphify-out/` already carries uncommitted changes from work that predates this plan. Committing it
here would sweep that unrelated work into this branch's history. Leave it dirty on disk; it is
handled separately once this plan is done.

**Every commit in this plan names its exact files.** Never `git add -A`, `git add .`, or `git commit -a`
— the working tree holds roughly nineteen unrelated modified and untracked files, and a broad add
would take all of them.

---

## Manual verification

Automated tests cannot cover the appointed rendering, because the seed appoints nobody and this plan does not change that. After Task 5, check it by hand once against a real database:

1. Apply the migration: `npx supabase db push` (or run `0006_appointed_roles.sql` against the project).
2. `npm run dev`, sign in at `/${ADMIN_PATH}` — `editorial-office` unless `ADMIN_PATH` is set.
3. Open **Editorial roles** → *Section Editor, Humanities*. Set "Is it open?" to **Appointed**. Confirm "Wording shown on the site", in the Advanced panel, has followed to `Appointed`. Type a name into "Who holds it". Save.
4. Visit `/team`. The row should read `APPOINTED · <name>`, the label in ink `#241F1E`, the name in normal case.
5. Visit `/editors/apply`. That role must be gone from the dropdown.
6. Back in the admin, set the role to **Recruiting** without clearing the name. `/team` must show `RECRUITING` in maroon with no name.
7. Set it back to **Appointed** and clear the name. `/team` must show `APPOINTED` with no trailing middot.

Steps 6 and 7 are the two failure modes the helper exists to prevent. If either shows a name or a dangling separator, `roleStatusDisplay` is being bypassed.

## Out of scope

Named so they are not added opportunistically:

- No link between `editorial_roles` and `team_members`. Appointing somebody does not create a Core team card; an editor adds that record by hand if they want one.
- No photo on the role row.
- No appointment date, term length, or history. A role holds one name or none.
- No change to `tests/e2e/views.spec.ts`.
- No change to either application guard.
