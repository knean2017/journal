# ICRR Journal

The public website for the **International Collegiate Research Review**, an independent,
open-access journal publishing undergraduate and graduate research across five sections.

Ten views: home, about, current issue, archives, contributor directory, author profiles, our team,
submit, announcements, and the article reading page.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build        # production build
npm start            # serve the production build
npm test             # unit tests (Vitest)
npm run test:e2e     # browser tests (Playwright, desktop + mobile)
```

Playwright starts its own server, so `npm run test:e2e` works from a clean checkout after
`npx playwright install chromium`.

## How it is put together

- **Next.js App Router**, TypeScript strict, Tailwind v4 with CSS-first `@theme` tokens.
- **Server components by default.** Three client islands carry all the interactivity: the nav
  (matchMedia variant switching and the drawer), the authors browser, and the toast provider.
  The announcement bar used to be a fourth; it now slides in CSS and holds no state.
- **The public forms keep what was typed.** Every field is React state, driven through
  `useFormFields` in `src/components/ui/FieldError.tsx`, so a rejected submission comes back
  filled in with only the bad fields marked. React empties a form once its action returns, and it
  restores a controlled text input afterwards but not a `<select>` or a checkbox, so that hook
  puts those two back itself.
- **All content is reached through `src/lib/content/`.** No page imports a data source directly.
  Today those accessors read typed seed files; they are `async` already so the Supabase
  implementation can replace their bodies without touching a single view.
- **Images render through `<ImageSlot>`.** A null path produces an on-brand labelled placeholder,
  so filling a slot is a data change rather than a code change.

## Design source of truth

`design-reference/` holds the approved design handoff. `ICRR Journal.dc.html` is the prototype and
is authoritative on every visual question; `design-reference/README.md` documents the tokens and
intent. Where the two disagree, the HTML wins.

Two editorial constraints are enforced by tests and must be preserved:

1. **No em dashes** in site copy. En dashes in numeric ranges are correct.
2. **Never promise reviewer feedback to authors.** The journal cannot guarantee it.

Two visual constraints likewise: no border radius anywhere except the announcement dot and the
timeline rail dots, and exactly one shadow in the whole design, on the toast.

## Branch policy

Rebuild work lives on `rebuild`. `main` still serves the earlier site until this one is ready to
go live.

## Connecting Supabase

The site runs without a database, on its seed content. These steps switch it over.

1. **Create the project**, then copy `.env.example` to `.env.local` and fill in the project URL,
   the anon key, and the service-role key. Pick your own `ADMIN_PATH` while you are there.

2. **Run the migrations**, every file in `supabase/migrations/` in filename order, pasted into the
   Supabase SQL editor or applied with the Supabase CLI. `0001_init.sql` creates every table, the
   RLS policies, and the three storage buckets; `0002` widens the public article read so the first
   issue's table of contents is visible before that issue is published; `0003` adds the reviewer
   application and contact message tables, which the reviewer and contact forms write to.

3. **Load the content:** `npm run seed`. Idempotent, so running it twice changes nothing. It does
   overwrite rows it owns, so seed before editing in the admin, not after.

4. **Create the one admin account** by hand in the Supabase dashboard, under Authentication →
   Users → Add user. There is no signup route by design.

5. **Optional, for submission emails:** set `RESEND_API_KEY`, and `RESEND_FROM` once you have a
   verified sender. Without it submissions still store; only the notification is skipped.

### How a manuscript gets to storage

A manuscript can be 20 MB, and a Server Action cannot carry one. Next caps a Server Action body at
1 MB by default, and raising that only moves the wall: on Netlify these actions run as functions,
whose request payload limit is a few megabytes whatever Next is configured to allow.

So the file never passes through the server. `createManuscriptUpload` checks the form, then signs a
one-time upload URL for a single path in the `manuscripts` bucket; the browser uploads to storage
directly; `submitManuscript` is then handed the path, confirms the object arrived and is within
size, and records the row. Both halves validate the same fields, because the second is reachable on
its own. If the insert fails, the object is removed again.

`next.config.ts` still raises `serverActions.bodySizeLimit` to 10 MB, for the admin media library,
which does upload through an action. That is the one remaining path where the deploy target's own
payload limit applies: an image near the admin's 8 MB ceiling may need the same treatment as
manuscripts.

The admin then answers at `/{ADMIN_PATH}`, for example `/editorial-office`.

## Deploying to Netlify

`.env.local` is local only. Netlify needs the same variables set under Site configuration →
Environment variables, scoped to every context you deploy:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PATH
RESEND_API_KEY        # optional
RESEND_FROM           # optional
EDITORIAL_EMAIL       # optional, defaults to icrrjournal@gmail.com
```

Two things to know:

- **Next inlines every `NEXT_PUBLIC_` variable at build time.** Adding them changes nothing until
  the site is built again, so finish with Deploys → Trigger deploy → **Clear cache and deploy
  site**. Until then the admin answers 503 and the public pages quietly serve seed content.
- **Do not tick "Contains secret values"** on `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or `ADMIN_PATH`. All three are inlined into the build by
  design, so Netlify's secrets scanner fails the deploy on them and keeps serving the previous
  one. `netlify.toml` exempts those three by name, but an explicit secret marking in the UI wins
  over the file. Tick it on `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY`, which appear in the
  output zero times and must keep failing the build if they ever do.

## The admin panel

Site settings, sections, team, editorial roles, authors, issues, articles, announcements, the home
ticker, a media library, and three inboxes: submissions, reviewer applications, and messages from
the contact form. Inbox items are triaged (new, replied, archived) with editorial notes, never
edited.

Security, in short:

- RLS default-denies. Anonymous callers get `SELECT` only, and only on published rows.
  `submissions` and `newsletter_subscribers` have no public policy at all.
- Every write goes through a server action on the service-role key, which is server-only and
  guarded by a `server-only` import so exposing it is a build error.
- `ADMIN_PATH` is a second layer, not the control. The session check is. Middleware gates the
  route tree and every page and action re-checks, because middleware does not protect a direct
  POST. A direct request to the internal `/admin/*` tree 404s.
- Uploads are checked server-side for type and size, and filenames are regenerated. Manuscripts
  live in a private bucket and are reached only through five-minute signed URLs.

## Still open

- **Photographs.** Hero, team portraits, author portraits, issue cover, and article figures are all
  labelled placeholders. Upload through the admin's media library.
- **Real authors.** The six profiles are the handoff's placeholders and are labelled as such.
  Turn off the design-preview banners in Site settings once they are replaced.
- **Article bodies** render placeholder prose. The `body` column stores rich-text JSON and the
  admin exposes it as a raw field for now; a WYSIWYG editor is the remaining piece.
- PDF download, ORCID, cite, and share still toast. Messages live in `src/lib/toasts.ts`.

## Documents

- `docs/superpowers/specs/2026-07-26-icrr-journal-website-design.md` — the approved design spec
- `docs/superpowers/plans/2026-07-26-icrr-public-site.md` — the public-site plan
