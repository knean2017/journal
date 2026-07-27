# Handoff: ICRR Journal Website

**International Collegiate Research Review** — public website for a student-run, open-access academic journal.

## Overview

A 10-view marketing + publishing site for a monthly student research journal. It covers the public
face of the journal (what it is, what it publishes, who runs it), the author pipeline (guidelines,
submission form), and the publishing surfaces that go live once Issue 1 ships (issue table of
contents, article reading page, contributor directory and profiles).

The journal has **not published anything yet**. That is deliberate throughout the copy: the site is
honest about being pre-launch ("Issue 1 publishing 30 September 2026", "Appointment pending",
"Recruiting") rather than filled with fake articles. Two sections are explicitly marked as design
previews and are hidden by a single flag.

## About the Design Files

The files in this bundle are **design references created in HTML** — a prototype showing intended
look, copy, and behaviour. They are **not production code to copy directly**.

`ICRR Journal.dc.html` is authored in a lightweight in-house template runtime with a React-like
component class. Do not try to port that runtime. The task is to **recreate these designs in the
target codebase's environment** using its established patterns, router, and component library.

If no codebase exists yet, this is a good fit for **Next.js (App Router) + Tailwind**, since:
- Every view is static content except the Authors filter/search — server components for the rest.
- The 10 views map cleanly onto file-based routes (see Routing below).
- Article and author content should come from a CMS or MDX rather than being hardcoded, because
  editors (non-developers) will be adding an issue every month.

The prototype keeps all views in one file and swaps them with a `page` state variable purely so the
whole thing previews in a single browser tab. **Do not replicate that pattern** — use real routes.

## Fidelity

**High fidelity.** Colors, typography, spacing, borders, animation timings, and all copy are final
and should be reproduced exactly. Values below are authoritative; where this README and the HTML
disagree, the HTML wins.

Not final: the six author profiles in the contributor directory and the article body text are
placeholder content, clearly labelled as such in the UI.

---

## Design Tokens

### Colors

From the ICRR brand guidelines. Only these seven, plus black/white, appear anywhere.

| Token | Hex | Use |
|---|---|---|
| `maroon` | `#5D1D21` | Primary. Rules, headings, buttons, footer, top strip, announcement bar. |
| `maroon-hover` | `#7C2A2F` | Button/link hover only. |
| `maroon-deep` | `#3F1417` | Pull-quote text, text on gold buttons. |
| `gold` | `#C0A265` | Accent. Active nav underline, rules, eyebrow numbers, section markers. |
| `gold-muted` | `#8A7B5C` | Eyebrow labels, metadata, muted uppercase text. |
| `cream` | `#F7F4EF` | Panel fill, text on maroon. |
| `cream-tint` | `#FBF7EE` | Highlighted callout fill (paired with a gold border). |
| `page` | `#FDFBF7` | Page background. |
| `ink` | `#241F1E` | Body text, headings. |
| `ink-soft` | `#3F3733` | Nav links, article body. |
| `body` | `#5A524A` | Paragraph text. |
| `body-muted` | `#6E655C` | Secondary paragraph text, captions. |
| `rule` | `#E2DACB` | All 1px borders and dividers. |
| `rule-light` | `#EFE9DF` | Divider inside the mobile drawer. |

Two more values used inline:
- Scrim over content when the mobile drawer is open: `rgba(36,31,30,.5)`
- Hero image bottom gradient: `linear-gradient(to top, rgba(36,31,30,.72), rgba(36,31,30,0))`, height 52%
- Cream at reduced opacity on maroon backgrounds: `.82` (top strip), `.78` (footer body), `.75` (hero caption), `.18` (footer divider), `.5` (footer button border)

### Typography

Two families, loaded from Google Fonts:

```
Libre Baskerville — 400, 400 italic, 700
Lato — 400, 400 italic, 700, 900
```

- **Libre Baskerville** (fallback `Georgia, serif`): all headings, pull quotes, article body, issue
  numbers, drawer nav items, author names, the hero image caption, and the footer wordmark.
- **Lato** (fallback `system-ui, sans-serif`): body copy, nav, buttons, labels, form fields, tables.

Body text is `-webkit-font-smoothing: antialiased`.

Fluid sizes use `clamp(min, preferred, max)` — reproduce them as-is rather than as breakpoints:

| Element | Size |
|---|---|
| Home h1 | `clamp(29px, 6.3vw, 52px)` / 1.2 / weight 400 / `letter-spacing:-.01em` |
| Page h1 (About, Archives, Authors, Team, Submit, News) | `clamp(27px, 5.4vw, 44px)` / 1.22 / 400 |
| Current Issue h1 | `clamp(28px, 5.6vw, 46px)` / 1.2 / 400 |
| Author profile h1 | `clamp(26px, 5vw, 40px)` / 1.2 / 400 |
| Article title | `clamp(24px, 4.6vw, 38px)` / 1.28 / 400 |
| Section h2 | `clamp(22px, 3.4vw, 30px)` / 400 |
| Sub-head h2 | `24px` / 700 |
| Card h3 | `19–21px` / 700 |
| Pull quote | `clamp(19px, 2.6vw, 26px)` / 1.55 / italic |
| Hero lead paragraph | `clamp(15px, 1.7vw, 16.5px)` / 1.85 |
| Body paragraph | `15.5px` / 1.85 |
| Card paragraph | `13.5–14.5px` / 1.75–1.8 |
| Article body | `16px` / 1.9, max-width `74ch` |
| Eyebrow label | `11–11.5px` / `letter-spacing:.16–.24em` / uppercase / 700 |
| Button label | `11–12.5px` / `letter-spacing:.12–.14em` / uppercase / 700 |
| Desktop nav link | `clamp(10.5px, 1.15vw, 12.5px)` / `letter-spacing:.13em` / uppercase / 700 |

Measure caps: headline `22ch`, hero lead `64ch`, intro paragraphs `66–70ch`, article body `74ch`,
hero caption `34ch`.

### Spacing & layout

- Content column: `max-width: 1180px`, centered. Hero image band only: `1400px`.
- Horizontal page padding: `clamp(18px, 5vw, 40px)` (nav and hero band use `clamp(12–14px, 4vw, 40px)`).
- Vertical section rhythm: `56–70px` top padding between major sections; `clamp(38px, 6vw, 56px)` on page heads.
- **No border radius anywhere.** Every corner is square. This is intentional — it is what makes the
  site read as a print journal rather than a SaaS product.
- **One shadow in the whole design**: the toast, `0 10px 30px rgba(36,31,30,.28)`.

### Rules and dividers

The print-journal character comes almost entirely from three rule treatments. Get these right:

1. **Double rule** `border-top: 3px double #5D1D21` — under the masthead (as the nav's top border),
   under every page heading, and as the mobile drawer's left border.
2. **Hairline** `1px solid #E2DACB` — all card borders, table rows, list dividers.
3. **Gold hairline** `1px solid #C0A265` — only on highlighted callouts, always with `#FBF7EE` fill.

The nav bar is `border-top: 3px double #5D1D21` + `border-bottom: 1px solid #5D1D21`.

---

## Routing

| View | Suggested route | Purpose |
|---|---|---|
| Home | `/` | What the journal is; drive submissions. |
| About | `/about` | Aims & scope, review policy, ethics, open access. |
| Current Issue | `/issue/current` | Issue 1 status, production timeline, ToC (when published). |
| Archives | `/archives` | All volumes and issues. |
| Authors | `/authors` | Filterable contributor directory. |
| Author profile | `/authors/[slug]` | Bio, interests, publication list. |
| Our Team | `/team` | Core team + editorial roles + reviewer recruitment. |
| Submit | `/submit` | Eligibility, requirements, checklist, submission form. |
| Announcements | `/news` | Editorial-office news. |
| Article | `/articles/[slug]` | Reading page for a published article. |

---

## Global chrome (every view)

### 1. Top strip
Full-bleed `#5D1D21`. Cream at `.82` opacity, `11px`, `letter-spacing:.16em`, uppercase.
`8px` vertical padding. Left: "Open Access · ISSN Pending · Est. 2026". Right: "Contact" (jumps to
the About page's contact block) and "Announcements". On a narrow screen the two halves wrap onto
separate lines and both centre; pushed apart they read as an accidental break.

### 2. Masthead
Centered, on `#FDFBF7`. The horizontal ICRR lockup links home and fades in (`icrrIn`, 600ms).
Sized by height at `clamp(72px,9.5vw,92px)` with `width: auto`, not by a fixed box: the file is
`2500x600`, and the prototype's `454x126` box did not match that ratio, so `object-contain`
letterboxed the artwork and it drew smaller than the number implied. Padding
`clamp(16px,3vw,24px)` top / `clamp(14px,2.5vw,20px)` bottom.

### 3. Nav — sticky, two variants at 860px

**≥ 861px:** `position: sticky; top: 0; z-index: 40`. Six links centered
(Home · About · Current Issue · Archives · Authors · Our Team) with a `Submit` maroon pill pinned
right. Layout is `justify-content: space-between` with the link row as `flex: 1` — **not**
absolute positioning; an earlier version used `position:absolute` for Submit and the links ran
underneath it. Links are `white-space: nowrap` and the row is `overflow-x: auto` with
`scrollbar-width: none` and `justify-content: safe center`. Active page: `2px solid #C0A265`
bottom border; inactive: `2px solid transparent` (keep the transparent border so nothing shifts).

**≤ 860px:** links are replaced by a **Menu** button (3 × 1.5px maroon bars, 4px gap, 20px wide) +
the current page name centered in Libre Baskerville `12.5px` `#8A7B5C` (truncating with ellipsis) +
the Submit pill. Home shows an empty page name.

The switch is driven by `window.matchMedia('(max-width: 860px)')` with a change listener, not by CSS
`display`, because the two variants have different DOM. Resizing above 860px force-closes the drawer.

### 4. Mobile drawer
Right-hand sheet, `min(86vw, 340px)`, `#FDFBF7`, `border-left: 3px double #5D1D21`,
`z-index: 60`, over a `rgba(36,31,30,.5)` scrim. Slides in from the right
(`translateX(100%)` → `none`, 300ms `cubic-bezier(.2,.7,.2,1)`); the scrim fades (200ms).

Header: "NAVIGATION" eyebrow + `×` close. Body: seven items (the six nav links plus Announcements)
in Libre Baskerville `17px`, `16px 22px` padding, `1px solid #EFE9DF` dividers, hover `#F7F4EF`.
The current page renders in `#5D1D21` with a gold `Current` marker on the right. Footer: full-width
Submit button, the deadline, and the contact address.

Closes on: any nav item, the `×`, or the scrim. Clicks inside the sheet must **stop propagation** or
the scrim handler closes it. Hamburger bars morph to an `×` when open — top bar
`translateY(5.5px) rotate(45deg)`, middle `opacity: 0`, bottom `translateY(-5.5px) rotate(-45deg)`.

### 5. Footer
`#5D1D21`, cream at `.78`. Four columns, `clamp(28px,4vw,44px)` gap, reflowing to fewer columns
below `180px` per column.

Column 1 is the brand block: the **stacked lockup drawn for dark grounds**,
`lockup-stacked-white.png`, at `clamp(132px,17vw,168px)` wide. It carries the mark and the
wordmark in one transparent file, so nothing sits beside it. *Note: the constraint that produced
the earlier square-mark-plus-text arrangement still holds — do not put a cream or white rectangle
behind a lockup to make it legible on maroon; the plate looks pasted on. This file needs none,
because its wordmark is already cream. It is cropped to its artwork, so any breathing room around
it belongs to the layout, not to the file.*

Columns 2–4: "The journal" (About, Current issue, Archives, Our team), "For authors" (Submit,
Author guidelines, Contributor directory, Announcements), "Contact" (icrrjournal@gmail.com,
ISSN pending). Column heads are gold `11px` uppercase `letter-spacing:.16em`.

Bottom bar, divided by `1px solid rgba(247,244,239,.18)`: "© 2026 International Collegiate Research
Review" left; "Publication ethics · Open access policy · Articles licensed CC BY 4.0" right.

### 6. Toast
Fixed, bottom `30px`, centered, `z-index: 80`. `#241F1E` fill, cream text, `14px 24px` padding,
`max-width: min(560px, 90vw)`, the one shadow. Slides up (`icrrUp`, 300ms). Auto-dismisses after
**3600ms**. Used for every not-yet-real action (see Interactions).

---

## Views

### Home

1. **Hero** (centered, `64px` top padding)
   - Eyebrow: "Volume 1 · Issue 1 · Publishing 30 September 2026"
   - h1: "Student research, *read closely.*" — "read closely" in `#5D1D21` italic
   - A `96px × 2px` gold rule that **animates its width from 0** (`icrrDraw`, 900ms,
     `cubic-bezier(.2,.7,.2,1)`, 350ms delay)
   - Lead: "An independent, open-access journal publishing undergraduate and graduate research
     across five sections. Submissions are open for our first issue."
   - Buttons: `Submit a Manuscript` (maroon fill) + `Read the Call for Papers` (maroon outline,
     hover fills `#F7F4EF`)
   - The four elements stagger in via `icrrUp` at 0 / 60 / 140 / 220ms delay.

2. **Hero image band** — `1400px` wide, `clamp(288px, 45vw, 470px)` tall, `1px solid #E2DACB`.
   The floor is 288 rather than the prototype's 230 because the caption sits over the bottom of
   the band and at 230 it landed on the placeholder's centred label on a phone.
   Bottom 52% carries the dark gradient. Over it: "Rigorous review. Transparent process. Work that
   stands on its own." in Libre Baskerville `clamp(16px,2.4vw,22px)` cream, and
   "VOLUME 1 IN PREPARATION" right-aligned. Caption layer is `pointer-events: none`.
   Enters with `icrrPlate` (900ms, fade + `translateY(10px)` + `scale(.985)`).
   **This needs a real photograph** — a library, reading room, or campus interior. In the prototype
   it is a drop target.

3. **Announcement bar** — full-bleed maroon, `min-height: 56px`. Gold `6px` dot pulsing
   (`icrrPulse`, 2.4s, opacity .35 → 1) + "LATEST" + the announcements + "ALL ANNOUNCEMENTS".
   Three strings, separated by a gold `·`:
   - "Call for Papers: Issue 1 closes 31 August 2026."
   - "Issue 1 publishes 30 September 2026, and at the end of each month thereafter."
   - "We are recruiting peer reviewers across all five sections."

   **The line slides continuously** (`icrrTicker`, linear, infinite), it does not swap every
   6000ms as the prototype did: a swap takes a line away half way through being read. The track
   holds the three strings twice over and travels `translateX(-50%)`, so the loop has no seam.
   Duration is `0.11s` per character of announcement text with a `30s` floor, which keeps the
   speed the same however much there is to say. It pauses on hover and on focus within the bar,
   and the ends are softened by a `mask-image` rather than a coloured gradient. Under
   `prefers-reduced-motion` the global rule collapses the animation and the bar reads as static
   text.

4. **Three value columns** — numbered `01 / 02 / 03` in Libre Baskerville gold `13px`, h3 in maroon:
   - Double-blind peer review — "Every submission is assessed by at least two subject-specialist reviewers."
   - Open access, no fees — "Free to read and free to publish. Authors retain copyright under CC BY 4.0."
   - Genuinely multidisciplinary — "Five sections and one review board, so interdisciplinary work has somewhere to go."

5. **What we publish** — h2 + "AIMS & SCOPE" link, under a double rule. Five discipline entries,
   each name + one-line blurb, `1px` bottom rules:
   Natural Sciences · Business & Economics · Law & Policy · Humanities · Social Sciences.

6. **From submission to publication** — four steps in bordered columns. Each: a `26px` gold-outlined
   square with the step number, a gold-muted duration, h3, and a line of body copy.
   Day 1 Submission → Week 1 Editorial screening → Weeks 1–3 Double-blind review → Week 4 Decision and copyediting.

7. **Our position** — `#F7F4EF` panel, two columns. Left: "OUR POSITION" eyebrow, a Libre
   Baskerville italic pull quote in `#3F1417` ("Student research deserves the same editorial care as
   any other scholarship. Not a lower bar, just a fairer door."), a supporting paragraph, and a
   gold-underlined "MORE ABOUT THE JOURNAL" link. Right: a `290px` editorial photo.

8. **Announcements** — three rows, `150px` date column / title + blurb / `→`. Row hover fills
   `#F7F4EF`. Under 640px the date sits above the title and the arrow goes: the whole row is
   already the link, and holding three columns on a phone broke five-word headlines over four lines.

9. **Closing CTA** — full-bleed maroon, centered. "Have a paper you are proud of?" + deadline copy +
   a **gold** primary button (`#C0A265` fill, `#3F1417` text, hover `#D2B67E`) and a cream-outline
   secondary. This is the only gold-filled button in the design.

Sections 4–9 fade up on scroll (see Interactions → Scroll reveal).

### About

Page head, then a `1.6fr / 1fr` split.

Main column: a Libre Baskerville `20px` `#3F1417` standfirst, then four h2 sections in maroon —
Aims and scope · Review policy · Publication ethics · Open access and copyright.

**The review policy copy must not promise author feedback.** An earlier draft said every author
receives written feedback; that was removed because the journal cannot guarantee it. Current text:
"All submissions undergo double-blind review by at least two reviewers. Author identities are
removed before assessment, and reviewer identities are not disclosed."

Sidebar (`position: sticky; top: 70px`, `max-width: 380px`):
- **Journal at a glance** — cream panel, maroon header bar, six key/value rows:
  Founded 2026 · Access Open, CC BY 4.0 · Author fees None · Review Double-blind ·
  Frequency Monthly, at month end · ISSN Pending
- **Editorial office** — `id="contact"` (the top strip's Contact link targets it):
  "Enquiries and submissions — icrrjournal@gmail.com"

### Current Issue

Centered head: "Volume 1, Issue 1" + "Inaugural issue · Publishing 30 September 2026, then at the
end of each month".

Main column:
- **Status callout** (gold border, `#FBF7EE`): "Calls for papers are open" + a note that the ToC
  appears here when Issue 1 publishes.
- **Production timeline** — five entries with an `11px` circle rail; the first dot is filled gold,
  the rest `#FDFBF7`; a `1px` vertical rule connects them:
  Submissions open (Now) · Issue 1 submissions close (31 Aug 2026) · Peer review (2–3 weeks) ·
  Decisions returned (Mid-Sept 2026) · Publication (30 Sept 2026)
- **ToC preview** — three placeholder rows at `opacity: .55`, showing section eyebrow, title,
  byline, page range, and a `PDF` chip. Plus a link to the article page template.

Sidebar: issue cover slot, **Key dates** panel (Submissions close 31 August 2026 · Decisions
Mid-Sept 2026 · Publication 30 September 2026), and a full-width Submit button.

### Archives

Page head, then a card grid:
- **Volume 1, Issue 1** — gold border, `#FBF7EE`, cover slot, "IN PREPARATION", "Publishing
  30 September 2026. Submissions open until 31 August 2026." + "ISSUE STATUS" link.
- **Volume 1, Issue 2** — `1px dashed #E2DACB`, "30 October 2026".
- **Future issues** — dashed, "Published at the end of each month".

Below, under a `1px` rule: an indexing-and-preservation note.

### Authors

Page head + a dismissible **design-preview banner** (`3px solid #C0A265` left border on `#FBF7EE`)
stating the profiles are placeholders. Controlled by the `showPreviewNotes` flag.

**Filter bar:** six chips (All sections + the five disciplines) — active chip is maroon fill /
cream text, inactive is `#FDFBF7` fill / `#5A524A` text / `#E2DACB` border. Plus a search input,
`min(100%, 290px)`. A live count reads "6 contributors" or "3 of 6 contributors".

**Search matches against** name, affiliation, discipline, role, bio, research interests, and
publication titles — case-insensitive substring.

**Cards:** `96 × 120px` portrait + discipline eyebrow, name (Libre Baskerville `19px` 700), role,
affiliation, and a maroon publication count ("1 article" / "Under review for Issue 1"). Hover:
border `#C0A265`, fill `#FBF7EE`. Grid is `repeat(auto-fill, minmax(min(100%, 296px), 1fr))`.

**Empty state:** dashed panel, "No contributors match that search" + a "CLEAR FILTERS" link.

Closing panel: "Publish with us and get a profile" + Submit button.

The six profiles are placeholder data (Amara Okonkwo, Daniel Reyes, Sofia Almeida, Kenji Watanabe,
Priya Nair, Lukas Brenner) with realistic affiliations, ORCIDs, bios, interests, and 0–1
publications each. **Replace with real authors before launch** — they exist so the filter, search,
empty state, and profile route are all demonstrable.

### Author profile

Back link, then a `200px` portrait beside discipline eyebrow, name, "role · affiliation", location,
and three outline chips (ORCID, Email author, Download all PDFs) — all currently toast.
Under a double rule: Biography, then **Publications with ICRR** — per entry a section eyebrow, a
gold status ("Under review"), title, abstract, citation line, and a PDF link. Authors with no
publications get a dashed "No published articles yet. This author has work under review for Issue 1."

Sidebar: **Research interests** as bordered tags, and an **Affiliation** block.

### Our Team

*Renamed from "Editorial Board" — the nav label, page title, mobile drawer entry, footer link, and
one news CTA all say "Our Team" / "Our team" / "Meet the team".*

Head: "The people behind the journal" + "A small team runs ICRR: editorial, technical, and
communications. The section editorships are being appointed ahead of Issue 1."

**Core team** — three cards, each a `150px` max-width 4:5 portrait slot, role eyebrow, name in
Libre Baskerville `20px` 700, and a duty line:

| Name | Role | Duty |
|---|---|---|
| Ayla Ahmadova | Founder & Editor | Founded the journal and leads editorial direction, scope, and final decisions on submissions. |
| Kanan Hajiyev | Technical Director | Builds and maintains the journal platform, submission workflow, and article archive. |
| Gunel Ahmadova | Chief Marketing Officer | Runs calls for papers, announcements, and outreach to student researchers and institutions. |

**Editorial roles** — seven entries, each a title, a status in uppercase (gold-muted "Appointment
pending" or maroon "Recruiting"), and a duty line: Managing Editor, five Section Editors (Natural
Sciences, Business & Economics, Law & Policy, Humanities, Social Sciences), Copyeditor.
Editor-in-Chief is intentionally absent — Ayla covers it in the core team.

Two closing panels: **Join the reviewer panel** (gold callout, "Two manuscripts a month, three-week
turnaround" + apply button) and **Editorial independence** (recusal policy).

### Submit

Head + deadline note, then `1fr / 330px`.

- **Eligibility** paragraph.
- **Manuscript requirements** — six key/value rows (`170px` label column, stacking under 640px
  where that column would take half the screen): Length 3,000–8,000 words · File format ·
  Anonymisation · Abstract · References · Figures.
- **Before you submit** — four checklist lines, each with a gold `✓`.
- **Submission form** (`#F7F4EF` panel, `id="form"`): corresponding author, email, institution,
  section select (the five disciplines), title, abstract textarea (5 rows), a dashed gold file
  drop zone ("PDF or DOCX · max 20 MB · no author names in the file"), an originality checkbox,
  and a maroon submit button. Inputs are `#FDFBF7` fill, `1px solid #E2DACB`, `11px 13px` padding,
  `14.5px`, no radius, `outline: none`.

Sidebar: **What happens next** (the four process steps), **Templates**, **Questions**
(icrrjournal@gmail.com, five-working-day reply).

### Announcements

Three articles, `1px` divided: date + gold tag eyebrow, h2 `clamp(21px,3vw,26px)`, body, and a
gold-underlined CTA linking to the relevant page.
- 15 July 2026 · Call for papers · "Call for Papers: Volume 1, Issue 1"
- 2 July 2026 · Editorial · "Reviewer recruitment for the inaugural cycle"
- 20 June 2026 · Journal · "The journal is established"

Sidebar: **Stay informed** email capture, "one message a month at most".

### Article (template)

Design-preview banner, then the reading page at `74ch`:

Section + type eyebrows, title, authors with superscript affiliation markers, affiliation lines,
then Download PDF / Cite / Share under a `1px` rule.

**Abstract block:** `#F7F4EF` fill with a `3px solid #5D1D21` left border, a Lato "ABSTRACT"
eyebrow, `15.5px/1.85` serif body, and a keywords line.

Body: numbered h2s (1. Introduction, 2. Method, 3. Results, 4. Discussion) in maroon `22px` 700,
serif body at `16px/1.9`; paragraphs separated by space, **not indentation**. A `300px` figure slot
with a Lato caption ("Figure 1." bolded). Then References as an ordered list.

Sidebar: **Article information** (Received / Accepted / Published all "TBA", Licence CC BY 4.0) and
an **On this page** contents list.

---

## Interactions & Behavior

### Navigation
All nav is client-side page swapping in the prototype; use the router in the real build. Every
navigation **scrolls to top** and re-arms the scroll reveal. The Authors nav item stays highlighted
on author profile pages.

### Scroll reveal
Home sections 4–9 carry `data-reveal`. An `IntersectionObserver` (`rootMargin: '0px 0px -12% 0px'`)
sets `opacity: 1; transform: none` with
`transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)`, then unobserves.

**Important:** elements already within `92%` of the viewport height on arrival are skipped entirely
and never hidden, so nothing above the fold flashes blank. Reproduce that guard.

### Animations

| Name | Definition | Applied to |
|---|---|---|
| `icrrUp` | `opacity 0 → 1`, `translateY(18px) → none` | Hero elements (staggered 0/60/140/220ms), toast |
| `icrrIn` | `opacity 0 → 1` | Masthead (600ms), drawer scrim (200ms) |
| `icrrDraw` | `width 0 → 96px` | Hero gold rule (900ms, 350ms delay) |
| `icrrPlate` | fade + `translateY(10px)` + `scale(.985)` | Hero image band (900ms, 300ms delay) |
| `icrrPulse` | `opacity .35 → 1 → .35` | Announcement dot (2.4s infinite) |
| `icrrDrawer` | `translateX(100%) → none` | Mobile drawer (300ms) |
| `icrrTicker` | `translateX(0) → translateX(-50%)` | Announcement track (linear, infinite, duration per instance) |

Standard easing outside these: `cubic-bezier(.2,.7,.2,1)`.

### Hover states
- Maroon buttons → `#7C2A2F`
- Gold button → `#D2B67E`
- Outline buttons → fill `#F7F4EF`, or border → `#C0A265`
- Author cards → border `#C0A265`, fill `#FBF7EE`
- Announcement rows / drawer items → fill `#F7F4EF`
- Links → `#5D1D21` to `#7C2A2F`

### Placeholder actions
Every action that has no backend yet shows a toast rather than doing nothing:
- PDF downloads, ORCID, email author, cite, share, reviewer application, templates →
  "Not available yet. PDFs and author links go live with Issue 1."
- Submission form → "Submission portal opens with the call for papers. Email icrrjournal@gmail.com in the meantime."
- Newsletter → "Thanks. You will receive our calls for papers and issue announcements."

In the real build, wire these up or hide the affordance — don't ship the toasts.

### Responsive
Two breakpoints. **860px** switches the nav, and is the only one that changes what is in the DOM.
**640px** (Tailwind's `sm`) is where a handful of rows that are fixed-width by design stop being
rows and become stacks. Everything else is fluid:
- Two-column layouts are `repeat(auto-fit, minmax(min(100%, 420px), 1fr))`, so they collapse
  around 900px. Sidebars then go full-width, capped at `380px`, `justify-self: start`.
- Card grids use `minmax(min(100%, Npx), 1fr)` so they never overflow on small screens.
- All type and padding scale with `clamp()`.
- The hero band shrinks 470 → 288px.
- Form fields and footer columns stack.

**Below 640px**, these stop being side-by-side. Each was measured on a 375px screen first: a
fixed column that is comfortable at 1180px takes half a phone and leaves its content wrapping four
deep, which is what made the small layout look like a mistake rather than a choice.

| Element | Wide | Under 640px |
|---|---|---|
| Announcement rows (home) | `150px` date / title / `→` | Date over title, no arrow |
| Manuscript requirements, reviewer commitments | `170px` label / value | Label over value |
| Table-of-contents preview | Entry / pages + PDF | Pages and PDF under the entry |
| Process steps | Four columns divided by left rules | Stack divided by top rules, `18px` apart |
| Announcement bar | Label · line · link, one row | Label and link on one row, line full-width below |
| Hero buttons | Side by side, natural widths | Stacked, matched widths, `320px` cap |
| Top strip | Pushed to both edges | Centred on two lines |

### Copy rules

Two editorial constraints the client asked for explicitly. Keep them:

1. **No em dashes anywhere.** Use commas, colons, or full stops. En dashes in numeric ranges
   (`3,000–8,000`, `2–3 weeks`) are fine.
2. **Never promise reviewer feedback to authors.** The journal cannot guarantee it.

Voice: plain, first-person where natural, no marketing inflation. The site says what is true today
("Appointment pending", "Recruiting", "TBA") rather than pretending to be established.

---

## State Management

| State | Type | Notes |
|---|---|---|
| `page` | route | Becomes real routing. |
| `authorId` | string | Becomes the `[slug]` route param. |
| `filter` | string | Active discipline chip; `'All'` default. Worth putting in the URL. |
| `q` | string | Search query. Worth putting in the URL. |
| ~~`ann`~~ | — | Gone. The announcement bar slides in CSS and holds no state. |
| `toast` | string | Auto-clears after 3600ms; clear the pending timeout when re-triggering. |
| `narrow` | boolean | From `matchMedia('(max-width: 860px)')`; remove the listener on unmount. |
| `menuOpen` | boolean | Force-closed when `narrow` goes false and on every navigation. |

Content that should come from a CMS rather than code: articles, issues, author profiles,
announcements, team members, editorial roles.

Configurable values exposed as props in the prototype, worth keeping configurable:
`deadline` ("31 August 2026"), `expected` ("30 September 2026"),
`showPreviewNotes` (hides the two design-preview banners in one move).

---

## Assets

In `assets/`:

| File | Use |
|---|---|
| `icrr_lockup_full_name_transparent.png` | Horizontal lockup — the masthead. Transparent. |
| `icrr_lockup_stacked_transparent.png` | Stacked lockup, dark artwork — for print/social on light grounds. |
| `icrr_mark.png` | Square mark — kept for favicons and tight spaces. |
| `Brand Guidelines (ICRR).pdf` | Source of truth for colors and type. |

Shipped in `public/brand/`, which is what the site actually loads:

| File | Use |
|---|---|
| `lockup-full.png` | The masthead. `2500x600`. |
| `lockup-stacked-white.png` | The footer brand block. Cream artwork for maroon grounds, cropped to `956x686`. |
| `lockup-stacked.png` | Dark stacked lockup. Not currently loaded. |
| `mark.png` | Square mark. Not currently loaded; the footer used it before the white lockup existed. |

**Needed, not yet supplied** — every one of these is a drop-target placeholder in the prototype:
- Home hero band (library / reading room / campus interior), `~1400 × 470`
- "Our position" editorial photo, `~400 × 290`
- Issue 1 cover art
- Team portraits (Ayla, Kanan, Gunel), 4:5
- Author portraits, 4:5
- Article figures

Fonts are Google Fonts (Libre Baskerville, Lato) — self-host them if the target project does.

---

## Files

| File | What it is |
|---|---|
| `ICRR Journal.dc.html` | **The design.** All ten views. Open in a browser. |
| `ICRR Directions.dc.html` | The three visual directions explored first. Direction `1a` (classic academic) was chosen; the other two are dead ends kept for context. |
| `support.js`, `image-slot.js` | Prototype runtime and the drag-drop image placeholder. **Not for production.** |
| `assets/` | Logos and brand guidelines. |

To view: open `ICRR Journal.dc.html` directly in a browser. No build step, no server.
