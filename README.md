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

Playwright builds and serves the site itself, so `npm run test:e2e` works from a clean checkout
after `npx playwright install chromium`. It builds rather than only serving because the public
pages are prerendered: `CONTENT_SOURCE=seed` has to be set for the build that writes the HTML, not
just for the server that hands it out.

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
  Each accessor picks Supabase or the seed files at call time, and each is wrapped in React's
  `cache`, so a render that asks for the site config in the layout and again in the page pays for
  one query.
- **Every public page is prerendered.** They show the same thing to everybody, so none of them
  needs to be built per visit. The content reads go through a cookieless anon client
  (`src/lib/supabase/public.ts`) precisely to keep it that way: one `cookies()` call anywhere in a
  render marks the whole route dynamic, and reading content through the request-bound client used
  to do exactly that on every page. Pages refresh on a five-minute timer, and the admin calls
  `revalidatePath('/', 'layout')` on save, so an edit is live immediately.
- **Images render through `<ImageSlot>`.** A null path produces an on-brand labelled placeholder,
  so filling a slot is a data change rather than a code change.

## Policies and discoverability

`/privacy`, `/terms` and `/ethics` are written to match what the site actually does rather than
from a template. The privacy notice names all five forms and the exact fields each one asks for,
the three suppliers that see the data, and the fact that visitors are set no cookies at all,
because they are not. Keep it true: **a change to any public form is a change to that page.**

Two facts nobody but the journal can supply are marked in the pages themselves, in a bordered
maroon box that is impossible to miss. Both are the registered legal name and postal address, one
on `/privacy` and one on `/terms`. Search for `ToFill` to find them.

The three copy rules the tests enforce apply here as anywhere: no em dashes, never "Editorial
Board", and no claim to a review model the journal does not run. The ethics page says a submission
is "reviewed" and never says by how many people or under what blinding.

Articles carry Highwire Press `citation_*` tags, which is what Google Scholar reads. Values are
emitted only when known: no ISSN tag appears while the ISSN is pending, and no page numbers appear
until an article has them. `sitemap.xml` is generated from the content layer, so publishing an
article lists it.

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
   application and contact message tables, which the reviewer and contact forms write to; `0004`
   adds the editor application table behind `/editors/apply`; `0009` adds the unsubscribe token
   and timestamp that `/unsubscribe` and the announcement list page read; `0010` adds the
   confirmation token that makes announcement signups double opt-in, and the `announcement_sends`
   record behind the send page. An existing install needs `0004`, `0009` and `0010` run against
   it, or those pages answer with a database error.

   `0010` marks every address already on the list as confirmed, because those were entered through
   the public form before there was any way to verify a mailbox. Look over the announcement list
   page afterwards and delete anything you do not recognise: from then on, an address is mailable
   only once its owner has opened the link sent to it.

3. **Load the content:** `npm run seed`. Idempotent, so running it twice changes nothing. It does
   overwrite rows it owns, so seed before editing in the admin, not after.

   It does **not** cover the five editorial copy tables `0008` created: the process steps, the
   production timeline, the journal facts, the manuscript requirements, and the pre-submission
   checklist. Those start empty, and an empty table is a successful read rather than a failure, so
   the site does not fall back to the seed files for them: each block simply disappears from the
   page. Paste `supabase/seed/editorial-copy.sql` into the SQL editor to put the copy in. It skips
   any table that already has rows, so it cannot overwrite what an editor has typed.

4. **Create the one admin account** by hand in the Supabase dashboard, under Authentication →
   Users → Add user. There is no signup route by design.

5. **Set `RESEND_API_KEY`, and `RESEND_FROM` once you have a verified sender.** Optional for
   submissions, which still store when it is missing and skip only the notification. Not optional
   for announcements: signing up now requires a confirmation email, so with no key nobody can join
   the list and nothing can be mailed to it. The free plan allows 100 messages a day and 3,000 a
   month, and `src/lib/announcements/send.ts` refuses a send that would cross either.

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
NEXT_PUBLIC_SITE_URL  # optional on Netlify, which sets URL itself
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
ticker, a media library, and four inboxes: submissions, reviewer applications, editor applications,
and messages from the contact form. Inbox items are triaged (new, replied, archived) with editorial
notes, never edited.

It is written for an editor, not a developer. Values the panel can work out are worked out, and the
ones it cannot are asked for in plain words:

- **Web addresses are written from the title**, not typed. Authors and articles are the only records
  with a public page of their own, so they are the only ones that show a URL and warn that changing
  it breaks existing links. Elsewhere the slug is an internal name and stays under "Advanced".
- **Status wording follows the status** while it is still the standard wording, and stops following
  the moment somebody edits it. That is how an issue can sit "In preparation" while reading
  "Scheduled" on the site.
- **Order is set with arrows** on the list pages. The underlying number is still there, under
  "Advanced", for when it needs correcting by hand.
- **A rejected save comes back to the form** with everything still in it and a message that names
  what to change, rather than putting the Postgres text on an error page.

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

- **Photographs.** Team portraits, author portraits, issue cover, and article figures are all
  labelled placeholders. Upload through the admin's media library. The home page no longer has an
  image band: it held a placeholder nobody intended to fill, so it was removed along with its
  uploader. `site_config.hero_image_path` is still there if it ever comes back.
- **Real authors.** The six profiles are the handoff's placeholders and are labelled as such.
  Turn off the design-preview banners in Site settings once they are replaced.
- **Article bodies** render placeholder prose. The `body` column is still there and still holds
  rich-text JSON, but the admin no longer exposes it: it was a monospace box that demanded raw JSON,
  threw a 500 on anything else, and fed a renderer that does not exist yet. A WYSIWYG editor writing
  that column is the remaining piece, and the field comes back with it.
- PDF download, ORCID, cite, and share still toast. Messages live in `src/lib/toasts.ts`.
- **The mobile nav arrives after hydration.** The two nav variants are different DOM switched by
  `matchMedia`, per the prototype, so a phone is served the desktop bar and swaps to the menu
  button once JavaScript runs. Rendering both and hiding one with a media query would remove the
  shift, at the cost of the "replaces the links" behaviour the chrome tests assert.
- **`middleware.ts` should become `proxy.ts`.** Next 16 deprecated the filename; the build says so
  on every run. A rename, no behaviour change, not yet done.

## Documents

- `docs/superpowers/specs/2026-07-26-icrr-journal-website-design.md` — the approved design spec
- `docs/superpowers/plans/2026-07-26-icrr-public-site.md` — the public-site plan
