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
- **Server components by default.** Four client islands carry all the interactivity: the nav
  (matchMedia variant switching and the drawer), the authors browser, the announcement rotator,
  and the toast provider.
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

## What is not built yet

Placeholder actions (PDF downloads, ORCID, cite, share, the submission form, newsletter signup)
show an explanatory toast rather than failing silently. Every message lives in `src/lib/toasts.ts`,
marked `TODO(plan-3)`.

Still to come, each with its own plan under `docs/superpowers/plans/`:

- **Plan 2:** Supabase schema, RLS, storage, and the hidden admin panel.
- **Plan 3:** real submissions with manuscript upload, Resend notifications, and the newsletter.

## Documents

- `docs/superpowers/specs/2026-07-26-icrr-journal-website-design.md` — the approved design spec
- `docs/superpowers/plans/2026-07-26-icrr-public-site.md` — the plan this repo implements
