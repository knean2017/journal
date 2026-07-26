# ICRR Journal Website — Design Spec

**Date:** 2026-07-26
**Status:** Approved for planning
**Source of truth for design:** `design-reference/ICRR Journal.dc.html`. Where that file and
`design-reference/README.md` disagree, the HTML wins.

---

## 1. What we are building

The public website for the **International Collegiate Research Review**, a student-run, open-access
academic journal, plus the backend and admin panel that let a non-developer run it.

Two halves, built in one project:

1. **Public site** — 10 views reproducing the approved design at high fidelity.
2. **Backend + admin** — Postgres content store, a hidden admin panel, manuscript submissions with
   file upload and email notification, and a newsletter capture.

The journal has published nothing yet. The copy is deliberately honest about that ("Issue 1
publishing 30 September 2026", "Appointment pending", "Recruiting"). Preserve that voice.

### Success criteria

- All 10 views match the prototype at 1440px and 375px: colors, type, spacing, rules, animations.
- An editor with no code access can change the deadline, swap any image, add an announcement, and
  publish an issue with articles.
- A student can submit a manuscript with a file, and the editorial office is emailed.
- Nothing writable is reachable without authentication.

---

## 2. Decisions

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 15, App Router, TypeScript | 10 views map to file routes; server components for static content; the admin needs a server |
| Styling | Tailwind v4, CSS-first `@theme` | Design tokens live as CSS variables; arbitrary values carry the one-off `clamp()` sizes verbatim |
| Hosting | Netlify, Next.js runtime | Already in use. SSR, not static export |
| Data | Supabase Postgres | Already in use. Auth and Storage in the same project |
| DB access | `supabase-js` with generated types | No second ORM to maintain alongside Supabase's own tooling |
| Migrations | SQL files under `supabase/migrations/` | Reviewable, replayable, versioned in git |
| Article body | TipTap, stored as JSON | Editors are non-developers and will paste from Word |
| Email | Resend | Free tier covers volume; clean server-side API |
| Auth | Supabase Auth, one hand-created account | No public users, no signup route, no user-management UI |
| Fonts | `next/font/google`, self-hosted | Removes the render-blocking Google request |

### Explicitly rejected

- **Static export.** The admin and submissions need a server.
- **A headless CMS.** Supabase already provides the store; a second content service is redundant.
- **Porting the prototype runtime.** `support.js` and `image-slot.js` are prototype-only.
- **The prototype's single-file `page` state pattern.** Real routes instead.
- **A public user system.** No registration, no author logins, no reviewer accounts.

---

## 3. Repository layout

The current handoff folder becomes the project root. The handoff files move to
`design-reference/` so the repo root is the application. Git is initialized here.

```
/
  design-reference/          the handoff, read-only, kept for verification
    ICRR Journal.dc.html
    README.md
    support.js  image-slot.js
    assets/
  docs/superpowers/
    specs/                   this file
    plans/                   the implementation plan
  src/
    app/
      (site)/                public routes, shares the journal chrome
      admin/                 admin routes, reached only through the rewritten path
      api/
    components/
      chrome/                TopStrip Masthead Nav Drawer Footer Toast
      ui/                    Eyebrow Rule Button Panel Callout ImageSlot
      site/                  view-specific sections
      admin/
    lib/
      content/               typed accessors, the only module pages import from
      supabase/              browser client, server client, service client
      email/
      utils/
    styles/globals.css
  supabase/
    migrations/
    seed.sql
  public/brand/              logos copied from the handoff assets
```

**Rule:** public pages import content only from `src/lib/content/`. No page touches Supabase
directly. This keeps the data source swappable and the access rules in one place.

---

## 4. Design tokens

Declared once in `globals.css` under Tailwind's `@theme`.

### Colors

Only these, plus black and white, appear anywhere.

| Token | Hex | Use |
|---|---|---|
| `maroon` | `#5D1D21` | Primary. Rules, headings, buttons, footer, top strip, announcement bar |
| `maroon-hover` | `#7C2A2F` | Button and link hover only |
| `maroon-deep` | `#3F1417` | Pull-quote text, text on gold buttons |
| `gold` | `#C0A265` | Active nav underline, rules, eyebrow numbers, section markers |
| `gold-muted` | `#8A7B5C` | Eyebrow labels, metadata, muted uppercase text |
| `cream` | `#F7F4EF` | Panel fill, text on maroon |
| `cream-tint` | `#FBF7EE` | Highlighted callout fill, always with a gold border |
| `page` | `#FDFBF7` | Page background |
| `ink` | `#241F1E` | Body text, headings |
| `ink-soft` | `#3F3733` | Nav links, article body |
| `body` | `#5A524A` | Paragraph text |
| `body-muted` | `#6E655C` | Secondary paragraphs, captions |
| `rule` | `#E2DACB` | All 1px borders and dividers |
| `rule-light` | `#EFE9DF` | Divider inside the mobile drawer |

Inline values: drawer scrim `rgba(36,31,30,.5)`; hero gradient
`linear-gradient(to top, rgba(36,31,30,.72), rgba(36,31,30,0))` at 52% height; cream opacities on
maroon `.82` top strip, `.78` footer, `.75` hero caption, `.18` footer divider, `.5` footer button
border.

### Typography

**Libre Baskerville** (400, 400i, 700; fallback `Georgia, serif`) — all headings, pull quotes,
article body, issue numbers, drawer nav items, author names, hero caption, footer wordmark.

**Lato** (400, 400i, 700, 900; fallback `system-ui, sans-serif`) — body copy, nav, buttons, labels,
form fields, tables.

Body text carries `-webkit-font-smoothing: antialiased`.

Fluid sizes are reproduced as `clamp()` exactly as written in the prototype, not converted to
breakpoints. The full size table is in `design-reference/README.md` §Typography and is authoritative
alongside the HTML.

Measure caps: headline `22ch`, hero lead `64ch`, intro paragraphs `66–70ch`, article body `74ch`,
hero caption `34ch`.

### Layout

- Content column `max-width: 1180px`, centered. Hero image band only, `1400px`.
- Horizontal padding `clamp(18px, 5vw, 40px)`; nav and hero band `clamp(12–14px, 4vw, 40px)`.
- Vertical rhythm `56–70px` between major sections; `clamp(38px, 6vw, 56px)` on page heads.
- **No border radius anywhere.** Enforced by a global reset. This is what makes the site read as a
  print journal rather than a SaaS product.
- **One shadow in the whole design:** the toast, `0 10px 30px rgba(36,31,30,.28)`.

### Rules

Three treatments carry the print-journal character:

1. **Double rule** `border-top: 3px double #5D1D21` — under the masthead as the nav's top border,
   under every page heading, and as the drawer's left border.
2. **Hairline** `1px solid #E2DACB` — card borders, table rows, list dividers.
3. **Gold hairline** `1px solid #C0A265` — highlighted callouts only, always with `#FBF7EE` fill.

The nav bar is `border-top: 3px double #5D1D21` plus `border-bottom: 1px solid #5D1D21`.

### Animations

| Name | Definition | Applied to |
|---|---|---|
| `icrrUp` | opacity 0→1, `translateY(18px)`→none | Hero elements staggered 0/60/140/220ms; toast |
| `icrrIn` | opacity 0→1 | Masthead 600ms; drawer scrim 200ms |
| `icrrDraw` | width 0→96px | Hero gold rule, 900ms, 350ms delay |
| `icrrPlate` | fade + `translateY(10px)` + `scale(.985)` | Hero image band, 900ms, 300ms delay |
| `icrrPulse` | opacity .35→1→.35 | Announcement dot, 2.4s infinite |
| `icrrDrawer` | `translateX(100%)`→none | Mobile drawer, 300ms |

Standard easing outside these: `cubic-bezier(.2,.7,.2,1)`.

### Component classes

Repeated patterns become classes in `globals.css` rather than repeated utility strings:
`.eyebrow`, `.rule-double`, `.btn-maroon`, `.btn-gold`, `.btn-outline`, `.btn-outline-cream`,
`.panel`, `.card`, `.callout-gold`, `.field`.

---

## 5. Data model

All tables in the `public` schema. Every table has `id uuid primary key default gen_random_uuid()`,
`created_at timestamptz default now()`, `updated_at timestamptz default now()` maintained by a
trigger.

### `site_config`

Single row, enforced by a check constraint on a fixed `id`.

| Column | Type | Notes |
|---|---|---|
| `deadline` | text | "31 August 2026" |
| `expected` | text | "30 September 2026" |
| `show_preview_notes` | boolean | Hides both design-preview banners in one move |
| `hero_image_path` | text null | Home hero band |
| `position_image_path` | text null | "Our position" editorial photo |
| `contact_email` | text | icrrjournal@gmail.com |
| `issn_status` | text | "Pending" |

### `disciplines`

The five sections. `name`, `slug`, `blurb`, `sort_order`.
Natural Sciences · Business & Economics · Law & Policy · Humanities · Social Sciences.

### `team_members`

`name`, `role`, `duty`, `portrait_path` null, `sort_order`, `is_published`.
Seeded with Ayla Ahmadova (Founder & Editor), Kanan Hajiyev (Technical Director),
Gunel Ahmadova (Chief Marketing Officer).

### `editorial_roles`

`title`, `status` enum `pending | recruiting`, `duty`, `sort_order`.
Seven rows: Managing Editor, five Section Editors, Copyeditor. Editor-in-Chief is intentionally
absent; Ayla covers it in the core team.

### `authors`

`slug` unique, `name`, `role`, `affiliation`, `location`, `discipline_id` fk, `orcid` null,
`email` null, `bio` text, `interests` text[], `portrait_path` null, `is_published`.

Seeded with the six placeholder profiles (Amara Okonkwo, Daniel Reyes, Sofia Almeida,
Kenji Watanabe, Priya Nair, Lukas Brenner). They exist so filter, search, empty state, and the
profile route are demonstrable. **Replace before launch.**

### `issues`

`volume` int, `number` int, `slug` unique, `status` enum `in_preparation | published`,
`publish_date` date null, `submissions_close` date null, `cover_path` null, `description` text,
`is_current` boolean.

### `articles`

`slug` unique, `issue_id` fk null, `discipline_id` fk, `article_type` text, `title`,
`abstract` text, `keywords` text[], `body` jsonb (TipTap document), `pdf_path` null,
`page_start` int null, `page_end` int null, `received_on`/`accepted_on`/`published_on` date null,
`status` enum `draft | under_review | published`, `sort_order`.

Dates render as "TBA" when null, matching the prototype.

### `article_authors`

Join table. `article_id`, `author_id`, `author_order` int, `affiliation_marker` text.
Drives the superscript markers and affiliation lines on the reading page.

### `announcements`

`slug` unique, `published_on` date, `tag` text, `title`, `body` text, `cta_label` null,
`cta_href` null, `is_published`, `sort_order`.

Seeded with the three from the design: Call for papers (15 July 2026), Editorial (2 July 2026),
Journal (20 June 2026).

### `ticker_lines`

The three rotating home-page strings. `text`, `sort_order`, `is_active`.

### `submissions`

`corresponding_author`, `email`, `institution`, `discipline_id` fk, `title`, `abstract` text,
`manuscript_path` text null, `originality_confirmed` boolean, `status` enum
`new | screening | under_review | accepted | rejected`, `admin_notes` text null.

### `newsletter_subscribers`

`email` unique, `is_active`.

### Storage buckets

| Bucket | Access | Holds |
|---|---|---|
| `media` | Public read | Hero, editorial photo, portraits, issue covers, article figures |
| `article-pdfs` | Public read | Published article PDFs |
| `manuscripts` | Private | Submitted files, reached by short-lived signed URLs in the admin only |

---

## 6. Security model

**Default deny.** RLS is enabled on every table with no permissive policy as the baseline.

**Anonymous** gets `select` only, scoped per table:

- Unconditional read: `site_config`, `disciplines`, `editorial_roles`. These have no draft state;
  every row is public by definition.
- Conditional read: `team_members`, `authors`, `announcements` where `is_published = true`;
  `articles` where `status = 'published'`; `ticker_lines` where `is_active = true`;
  `issues` unconditionally, and `article_authors` only for rows joining a published article.
- No read at all: `submissions`, `newsletter_subscribers`.

No anon `insert`, `update`, or `delete` policy exists on any table, including `submissions`.

**All writes go through Next.js server actions** using the service-role key. That key is read from
the environment on the server only and is never sent to the browser, never imported into a client
component, and never placed in a `NEXT_PUBLIC_` variable.

**Admin authentication** is Supabase Auth email/password with one account created by hand in the
Supabase dashboard. There is no signup route, no password-reset UI, and no user list.

**Two-layer gate.** Middleware verifies the session before the admin route tree renders, and every
admin server action independently re-verifies it. Middleware alone is not treated as sufficient,
because a server action is reachable by direct POST.

**Path obscurity is a second layer, not the control.** `ADMIN_PATH` is an environment variable.
Middleware rewrites `/${ADMIN_PATH}/*` to the internal `/admin/*` tree; a direct request to
`/admin/*` returns 404. Changing the path is a config change, not a code change.

**Uploads** are validated server-side for MIME type and size before reaching storage. Manuscripts
accept PDF and DOCX up to 20 MB. Images accept PNG, JPEG, and WebP up to 8 MB. Filenames are
regenerated, never taken from the client.

**Rate limiting** on the public submission and newsletter endpoints, keyed by IP, to blunt
automated abuse.

---

## 7. Public routes

| Route | View | Data |
|---|---|---|
| `/` | Home | config, disciplines, ticker lines, announcements (3) |
| `/about` | About | config |
| `/issue/current` | Current Issue | current issue, its articles, config |
| `/archives` | Archives | all issues |
| `/authors` | Contributor directory | authors, disciplines |
| `/authors/[slug]` | Author profile | author, their articles |
| `/team` | Our Team | team members, editorial roles |
| `/submit` | Submit | disciplines, config |
| `/news` | Announcements | announcements |
| `/articles/[slug]` | Article reading page | article, authors, issue |

Section content and copy for each view is specified in `design-reference/README.md` §Views and in
the prototype HTML. Both are authoritative; the HTML wins on conflict.

Notes carried forward from the handoff:

- The nav label is **"Our Team"**, not "Editorial Board", in the nav, page title, drawer, footer,
  and the news CTA.
- The About review-policy copy **must not promise author feedback**. The journal cannot guarantee
  it. Use the current text verbatim.
- The footer brand block uses the **standalone square mark** on maroon, never the full lockup on a
  cream plate.
- The Authors nav item stays highlighted on author profile pages.

---

## 8. Global chrome

Rendered in the `(site)` layout: top strip → masthead → sticky nav → drawer → page → footer → toast.

**Top strip** Full-bleed maroon, cream at `.82`, 11px, `letter-spacing:.16em`, uppercase, 8px
vertical padding. Left "Open Access · ISSN Pending · Est. 2026". Right Contact (targets the About
page's `#contact` block) and Announcements. Wraps on narrow screens.

**Masthead** Centered on `#FDFBF7`. Horizontal lockup ~126px tall, links home, fades in with
`icrrIn` over 600ms.

**Nav** Sticky, `top: 0`, `z-index: 40`. Two DOM variants switched by
`window.matchMedia('(max-width: 860px)')` with a change listener, **not** by CSS `display`, because
the variants differ structurally.

- ≥861px: six links centered with the Submit pill pinned right. Layout is `space-between` with the
  link row as `flex: 1`, **not** absolute positioning. Links are `nowrap`; the row is
  `overflow-x: auto`, `scrollbar-width: none`, `justify-content: safe center`. Active page carries
  `2px solid #C0A265`; inactive carries `2px solid transparent` so nothing shifts.
- ≤860px: a Menu button (3 bars, 1.5px, 4px gap, 20px wide) plus the current page name centered in
  Libre Baskerville 12.5px `#8A7B5C` truncating with ellipsis, plus the Submit pill. Home shows an
  empty page name.

Crossing above 860px force-closes the drawer.

**Drawer** Right sheet, `min(86vw, 340px)`, `#FDFBF7`, `border-left: 3px double #5D1D21`,
`z-index: 60`, over a `rgba(36,31,30,.5)` scrim. Slides in 300ms `cubic-bezier(.2,.7,.2,1)`; the
scrim fades 200ms. Header "NAVIGATION" plus close. Seven items in Libre Baskerville 17px with
`1px solid #EFE9DF` dividers, hover `#F7F4EF`; the current page renders maroon with a gold "Current"
marker. Footer holds the Submit button, the deadline, and the contact address. Closes on any item,
the close button, or the scrim. **Clicks inside the sheet must stop propagation** or the scrim
handler closes it. Bars morph to a cross: top `translateY(5.5px) rotate(45deg)`, middle
`opacity: 0`, bottom `translateY(-5.5px) rotate(-45deg)`.

**Footer** Maroon, cream at `.78`, four columns, `clamp(28px,4vw,44px)` gap, reflowing below 180px
per column. Column 1 is the square mark at `clamp(58px,12vw,74px)` beside the wordmark, separated
by a `1px solid rgba(192,162,101,.55)` left border with 18px padding. Bottom bar divided by
`1px solid rgba(247,244,239,.18)`.

**Toast** Fixed, `bottom: 30px`, centered, `z-index: 80`, `#241F1E` fill, cream text, `14px 24px`
padding, `max-width: min(560px, 90vw)`, the one shadow, `icrrUp` 300ms, auto-dismiss at **3600ms**.
Re-triggering clears the pending timeout.

---

## 9. Behavior

**Scroll reveal** Home sections 4 through 9 carry `data-reveal`. An `IntersectionObserver` with
`rootMargin: '0px 0px -12% 0px'` sets `opacity: 1; transform: none` with
`transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)`, then unobserves.

**Critical guard:** elements already within 92% of the viewport height on arrival are skipped
entirely and never hidden, so nothing above the fold flashes blank. Reproduce this.

**Announcement rotator** Cycles the active ticker lines every 6000ms. Interval cleared on unmount.

**Authors filter and search** `filter` and `q` live in URL search params so results are
shareable and survive a reload. Search is a case-insensitive substring match against name,
affiliation, discipline, role, bio, research interests, and publication titles. The live count reads
"6 contributors" or "3 of 6 contributors". Empty state is a dashed panel with "No contributors match
that search" and a CLEAR FILTERS link.

**Navigation** Every navigation scrolls to top and re-arms the scroll reveal.

**Reduced motion** `prefers-reduced-motion: reduce` disables entrance animations, the rotator's
transition, and the pulse. The drawer still opens; it just does not slide.

---

## 10. Admin panel

Reached at `/${ADMIN_PATH}`. Login is a single email/password form. On success, a Supabase session
cookie; on failure, a generic error that does not disclose whether the email exists.

| Section | Capability |
|---|---|
| Dashboard | Unread submission count, current issue status, quick links |
| Site config | Deadline, expected date, preview-notes flag, contact email, hero and position images |
| Team | Add, edit, reorder, and unpublish core team members with portraits |
| Editorial roles | Edit titles, statuses, duties, order |
| Authors | Full CRUD, portrait upload, interests, ORCID, discipline |
| Issues | Create an issue, set status and dates, upload cover, mark current |
| Articles | Create and edit with the TipTap editor, assign authors and order, upload the PDF, set page range and dates, publish |
| Announcements | CRUD, publish toggle, reorder; separate control for the three ticker lines |
| Media | Browse the `media` bucket, upload, replace, delete |
| Submissions | List with status filter, detail view, signed download of the manuscript, status changes, admin notes |

Editing UI follows the journal's own visual language rather than introducing a second design system.
Forms are server actions with Zod validation on the server; the client mirrors the same schema for
inline errors.

---

## 11. Submissions and email

**Form** at `/submit#form`. Fields: corresponding author, email, institution, section select, title,
abstract textarea (5 rows), manuscript file drop zone, originality checkbox.

**On submit** the server action validates with Zod, checks the rate limit, uploads the file to the
private `manuscripts` bucket under a regenerated filename, inserts the `submissions` row, then sends
a Resend notification to the editorial office containing the metadata and a signed link. The author
sees a confirmation, not the placeholder toast.

**If Resend is unconfigured or fails**, the submission is still stored and the failure is logged.
A stored submission is never lost to an email problem.

**Newsletter** captures the email into `newsletter_subscribers`, upserting so a repeat signup is not
an error. Confirmation copy: "Thanks. You will receive our calls for papers and issue
announcements."

**Toasts that survive** Only affordances with no backend after this phase. PDF downloads become real
once an article has a PDF; where one is absent the affordance is hidden rather than shown as a dead
link.

---

## 12. Images

Every image renders through `<ImageSlot src label ratio priority />`. A null `src` produces the
on-brand placeholder: `1px dashed #E2DACB` on `#FDFBF7` with the label in gold-muted uppercase.
Paths always come from content data, never from JSX literals, so the admin's media upload is the
only thing that needs to change to fill a slot.

Slots needing real photographs: home hero band (~1400×470), "Our position" editorial photo
(~400×290), Issue 1 cover, three team portraits at 4:5, author portraits at 4:5, article figures.

---

## 13. Copy rules

Two editorial constraints the client asked for explicitly, enforced in every view, in seed data, and
in anything the admin panel generates:

1. **No em dashes anywhere.** Use commas, colons, or full stops. En dashes in numeric ranges
   (`3,000–8,000`, `2–3 weeks`) are fine.
2. **Never promise reviewer feedback to authors.** The journal cannot guarantee it.

Voice: plain, first-person where natural, no marketing inflation. The site says what is true today.

---

## 14. Build phases

Each phase ends in a working, reviewable state.

1. **Scaffold** — Next.js, TypeScript, Tailwind v4, fonts, tokens, global styles, repo layout,
   handoff moved to `design-reference/`, git initialized.
2. **Schema** — migrations, RLS policies, storage buckets, generated types, seed with the handoff's
   real copy. Content accessors in `src/lib/content/` return real typed data.
3. **Chrome** — top strip, masthead, nav both variants, drawer, footer, toast, `(site)` layout.
4. **Public views** — all 10 routes at full fidelity, in the order Home, About, Current Issue,
   Archives, Authors, Author profile, Team, Submit, News, Article.
5. **Behavior** — scroll reveal with the 92% guard, rotator, matchMedia switching, URL-backed
   filters, reduced-motion handling.
6. **Admin** — auth, middleware rewrite and gate, then each admin section.
7. **Submissions** — upload, storage, Resend, rate limiting, newsletter.
8. **Verify and deploy** — Playwright side-by-side against the prototype at 1440px and 375px,
   token audit, copy audit, Netlify deploy with environment variables.

---

## 15. Out of scope

Named so the boundary is unambiguous:

- Peer-review workflow: reviewer assignment, review forms, decision letters.
- Author or reviewer accounts of any kind.
- DOI registration, ORCID API integration, Crossref deposits.
- Full-text search across articles.
- Multi-language support.
- Analytics beyond whatever Netlify provides by default.

The schema does not preclude any of these; none is built now.

---

## 16. Open items

These do not block building. They block deploying.

| Item | Needed by | Owner |
|---|---|---|
| Supabase project URL, anon key, service-role key | Phase 2 | Client |
| Admin account email and password, created in the Supabase dashboard | Phase 6 | Client |
| Resend API key and a verified sender | Phase 7 | Client |
| Chosen `ADMIN_PATH` value | Phase 6 | Client |
| Real photographs for the six slot types | Before launch | Client |
| Real author profiles replacing the six placeholders | Before launch | Client |

Until each arrives, development runs against `.env.local` placeholders, a local Supabase instance
or a scratch project, and the styled image placeholders.
