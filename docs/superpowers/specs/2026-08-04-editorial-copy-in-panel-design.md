# Editorial Copy in the Panel — Design Spec

**Date:** 2026-08-04
**Status:** Approved for planning

---

## 1. The problem

Six blocks of copy live in `src/lib/content/seed/process.ts` and reach the site through
`src/lib/content/index.ts:83`, under a comment that says what they are:

```ts
// Editorial furniture: fixed copy, not editable content. Seed only.
export const getProcessSteps = seed.getProcessSteps
export const getTimeline = seed.getTimeline
export const getTocPreview = seed.getTocPreview
export const getFacts = seed.getFacts
export const getRequirements = seed.getRequirements
export const getChecklist = seed.getChecklist
```

Unlike every other getter in that file, these six bypass `fromDb` and read the seed module
directly. No migration creates a table for any of them.

That was a fair call for copy that never moves. It is the wrong call for the production timeline,
which carries five dated milestones and changes every issue. Correcting a date is currently a code
change and a deploy.

## 2. What we are building

Five of the six blocks become ordinary content entities: a table, a row in `ENTITIES`, a page in
the panel. The sixth, `tocPreview`, stays in code.

### Success criteria

- An editor changes a timeline date in the panel and `/issue/current` shows it without a deploy.
- The four other moved blocks are editable the same way, from their own pages.
- With Supabase unreachable, or absent entirely, the site still renders the seed copy.
- A block whose table is empty renders nothing at all, heading included.
- `npm run build` and the unit suite pass.

### Out of scope

- **`tocPreview` stays in code.** It is placeholder scaffolding for an issue with no articles yet,
  labelled as such on the page ("shown with placeholder entries"). It is not copy anyone maintains;
  it is a shape that disappears the moment real articles publish.
- **No seeding of the new tables.** They ship empty. See §6.
- **No per-issue timelines.** One timeline, rewritten each cycle. Considered and rejected: the
  page only ever shows the current issue's timeline, so per-issue rows would store history nothing
  displays, and would need a child-rows editor no entity has.
- **No new permission area.** The five map to the existing `content.journal`.

## 3. Data model

### Migration — `supabase/migrations/0008_editorial_copy.sql`

Five tables. Every one carries `id`, `sort_order`, `created_at`, `updated_at`, matching
`ticker_lines`.

| Table | Content columns |
| --- | --- |
| `timeline_entries` | `title text not null`, `when_label text not null`, `body text not null`, `is_reached boolean not null default false` |
| `process_steps` | `step_label text not null`, `time_label text not null`, `title text not null`, `body text not null` |
| `journal_facts` | `key text not null`, `value text not null` |
| `submission_requirements` | `key text not null`, `value text not null` |
| `submission_checklist` | `text text not null` |

Two renames from the seed shapes:

- `when` → `when_label`. `when` is reserved in Postgres and would need quoting at every use.
- `filled` → `is_reached`. The column drives a filled or hollow dot on the rail; `filled` describes
  the dot, `is_reached` describes the milestone, and the second is what an editor is deciding when
  they tick the box.

`submission_checklist` gets its own table rather than a `kind` discriminator on
`submission_requirements`. The two render as separate lists, and a shared table would put a "Label"
field on the form that checklist rows never fill in.

### Row level security

Each table: `enable row level security`, plus an unconditional public read policy, the
`disciplines` shape rather than the `ticker_lines` one:

```sql
create policy "public read" on timeline_entries for select to anon, authenticated using (true);
```

`ticker_lines` reads `using (is_active)` because it has a draft state. None of these five do: a row
that exists is copy that is on the site, and an editor who wants it gone deletes it. Writes go
through the service-role client, as every content table does.

### The updated_at trigger

`0001_init.sql:205` runs `set_updated_at` over an array of table names. That loop is closed, so the
five new tables need their own `create trigger` statements in this migration, one per table, or
their `updated_at` never moves.

## 4. The panel

### Entities — `src/lib/admin/entities.ts`

Five entries appended to `ENTITIES`. All take `canCreate: true`, `canDelete: true`, and
`orderBy: { column: 'sort_order', ascending: true }`, and all end their `fields` with the shared
`SORT_ORDER`.

| slug | table | label / plural | titleColumn |
| --- | --- | --- | --- |
| `timeline` | `timeline_entries` | Timeline entry / Production timeline | `title` |
| `process-steps` | `process_steps` | Process step / Publication process | `title` |
| `facts` | `journal_facts` | Fact / Journal at a glance | `key` |
| `requirements` | `submission_requirements` | Requirement / Submission requirements | `key` |
| `checklist` | `submission_checklist` | Checklist item / Submission checklist | `text` |

Field help text should say where each value appears, as the existing entries do. `is_reached` is a
`boolean` labelled "Milestone reached", helped with a note that it fills the dot on the rail.

### Permissions — `src/lib/admin/permissions.ts`

All five added to `AREA_BY_ENTITY` against `content.journal`. An entity absent from that map is
refused rather than waved through, and `tests/unit/permissions.test.ts` fails on the omission, so
this cannot be forgotten silently.

`AREAS` is unchanged. `role_permissions` needs no migration: areas are text, and a cell with no row
falls back to `DEFAULT_MATRIX`.

### Navigation — `src/app/admin/layout.tsx`

Five more links under **Website content** would take it from nine to fourteen. Instead they form a
new group, **Editorial copy**, placed after Website content and before Settings.

The `groups` array currently spreads `ENTITIES.map(...)` into Website content. It gains a partition:
the five slugs above go to the new group, everything else stays. The existing per-link `visible()`
filter and empty-group drop apply unchanged, so a role without `content.journal` sees neither group.

## 5. The content layer

### Reads — `src/lib/content/sources/supabase.ts`

Five read functions, each ordered by `sort_order` ascending.

They deliberately do **not** follow the shape of the readers above them, and the reason is the
whole of §6. Every existing reader destructures `data` alone and ignores `error`, which is
survivable for tables that are never empty: a failed read yields `[]`, and `[]` is visibly wrong.
These five are allowed to be empty, so a failed read and an empty table would be the same value.
`fromDb` would see a clean read of nothing, serve nothing, and the seed fallback would never fire —
the site would quietly drop five blocks and still return 200 on every page.

So each read passes its response through a helper that raises when `error` is set. That is what
lets `fromDb` tell "the table has no rows yet" from "the table is not there", which are the two
states this change creates and the only two it must never confuse.

This was found in implementation, not design: the first cut followed the neighbouring readers, and
the five blocks disappeared from a running site against a database where the migration had not been
applied. `tests/unit/editorial-copy-source.test.ts` covers it.

### Getters — `src/lib/content/index.ts`

The five `seed.X` assignments become `fromDb` calls:

```ts
export const getTimeline = cache(() => fromDb(db.getTimeline, seed.getTimeline))
```

`getTocPreview` stays `seed.getTocPreview`, and the comment above the group is rewritten to say
that only the table-of-contents preview is fixed copy now.

### Schema — `src/lib/content/schema.ts`

`timelineEntrySchema` and `processStepSchema` keep their existing field names, so the readers map
`when_label` → `when` and `is_reached` → `filled` on the way out. The site components are then
untouched by the rename. `checklist` stays `string[]`; its reader maps rows to their `text`.

### The seed files stay

`src/lib/content/seed/process.ts` is not deleted and not edited. `fromDb` falls back to it when
Supabase is absent and when a read throws, which preserves two properties the codebase has on
purpose: the site builds and deploys with no database attached, and the browser suite pins itself
to fixed content with `CONTENT_SOURCE=seed`.

## 6. Empty tables

The tables ship empty. `fromDb` falls back to seed only on absence or failure, never on an empty
result, so with credentials set and nothing entered the five blocks come back as empty arrays.

**This means the five blocks vanish from the live site on deploy, until an editor fills them in.**
That is the intended behaviour and matches how the rest of the site treats empty content.

A heading over nothing reads as broken, so each block hides whole when its list is empty:

| Block | Guard | What is hidden |
| --- | --- | --- |
| `timeline` | `src/app/(site)/issue/current/page.tsx` | `<h2>Production timeline</h2>` and `<ProductionTimeline>` |
| `processSteps` | `src/components/site/home/ProcessSteps.tsx` | The section, which owns its own heading |
| `processSteps` | `src/app/(site)/submit/page.tsx` | The inline steps block |
| `facts` | `src/components/site/about/JournalAtAGlance.tsx` | The whole bordered panel, header bar included |
| `requirements` | `src/app/(site)/submit/page.tsx` | `<h2>Manuscript requirements</h2>` and the list |
| `checklist` | `src/app/(site)/submit/page.tsx` | The checklist heading and list |

Components that own their heading guard themselves; blocks whose heading sits in the page are
guarded in the page. Returning `null` from a component is the pattern already used elsewhere for an
absent record.

## 7. Tests

Covered automatically once the entries exist:

- `tests/unit/entities.test.ts` — shape of every `ENTITIES` entry.
- `tests/unit/permissions.test.ts` — every entity maps to an area.

To add:

- Each new getter returns seed content when the Supabase read throws.
- Each new getter returns the database rows, not seed, when the read succeeds.
- Each guarded block renders nothing for an empty list, and renders for a non-empty one.
- `tests/unit/admin-nav.test.tsx` — the Editorial copy group appears for a role with
  `content.journal`, and drops out for a role without it.

The e2e suite runs under `CONTENT_SOURCE=seed` and so keeps reading the seed files. It needs no
change, and it will not exercise the empty-table path; the unit tests above cover it.

## 8. Build order

1. Migration, applied and verified against the live database.
2. Schema readers in `sources/supabase.ts`, plus the `index.ts` getter switch. Site unchanged at
   this point only if the tables have rows; with empty tables the blocks go blank, so step 3
   lands in the same change.
3. Empty guards at the six render sites.
4. `ENTITIES` entries, `AREA_BY_ENTITY` lines, and the navigation group.
5. Tests.

Steps 2 and 3 ship together. Between them the site has headings over nothing, which is the state
this spec exists to avoid.
