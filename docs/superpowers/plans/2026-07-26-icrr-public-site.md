# ICRR Journal Public Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 10-view public website for the International Collegiate Research Review at high visual fidelity to the approved prototype, backed by a swappable content layer.

**Architecture:** Next.js App Router with server components for every view. Content is reached only through `src/lib/content/`, which returns Zod-validated domain objects. In this plan that module reads from typed seed files; plan 2 swaps its internals for Supabase without touching a single view. Four client islands carry all interactivity: nav, authors browser, announcement rotator, toast.

**Tech Stack:** Next.js 15 (App Router), TypeScript (strict), Tailwind v4, Zod, Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-26-icrr-journal-website-design.md`
**Design source of truth:** `design-reference/ICRR Journal.dc.html`. Line numbers cited throughout refer to this file as it exists at commit `8272b44` (before the phase 1 move, it is `ICRR Journal.dc.html` at the repo root).

## Deviation from spec §14

The spec sequenced the Supabase schema at phase 2 so views would be built against real types rather than throwaway shapes. This plan satisfies that intent differently and better: domain types are defined as **Zod schemas we own** in task 2, and views consume those. The Supabase layer, added in plan 2, maps database rows into the same domain types. Benefits: no Docker or Supabase credentials are needed to build the entire public site, generated database types never leak into view code, and the data source stays genuinely swappable. Spec §14 phase 2 is amended accordingly.

## Plan sequence

| Plan | Covers | Spec phases |
|---|---|---|
| **1 (this)** | Foundation and public site | 1 through 5, plus 8 for the public site |
| 2 | Supabase schema, RLS, storage, admin panel | 2 (database half), 6 |
| 3 | Submissions, file upload, Resend, newsletter | 7 |

---

## Global Constraints

Every task's requirements implicitly include this section.

- **Branch:** all work happens on `rebuild`. Never commit to `main`.
- **No border radius anywhere.** Every corner is square. Enforced by the global reset in task 1.
- **One shadow in the entire design:** the toast, `0 10px 30px rgba(36,31,30,.28)`. No other `box-shadow` may appear.
- **No em dashes in any site copy.** Use commas, colons, or full stops. En dashes in numeric ranges (`3,000–8,000`, `2–3 weeks`, `pp. 1–18`) are correct and required.
- **Never promise reviewer feedback to authors** in any copy.
- **Colors:** only the 14 tokens in task 1, plus the enumerated inline rgba values. No other hex value may appear in any file.
- **Fluid sizes** are reproduced as `clamp()` verbatim from the prototype, never converted to breakpoints.
- **Single breakpoint:** 860px, for the nav only. Everything else is fluid.
- **Nav label is "Our Team"**, never "Editorial Board", in nav, page title, drawer, footer, and news CTAs.
- **TypeScript strict mode.** No `any`. No non-null assertions on data from the content layer.
- **Server components by default.** `'use client'` only in the four islands named in the architecture.
- Commit after every task. Conventional Commits format.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/app/layout.tsx` | Root html, fonts, metadata |
| `src/app/(site)/layout.tsx` | Journal chrome wrapper |
| `src/app/(site)/page.tsx` | Home |
| `src/app/(site)/about/page.tsx` | About |
| `src/app/(site)/issue/current/page.tsx` | Current Issue |
| `src/app/(site)/archives/page.tsx` | Archives |
| `src/app/(site)/authors/page.tsx` | Contributor directory |
| `src/app/(site)/authors/[slug]/page.tsx` | Author profile |
| `src/app/(site)/team/page.tsx` | Our Team |
| `src/app/(site)/submit/page.tsx` | Submit |
| `src/app/(site)/news/page.tsx` | Announcements |
| `src/app/(site)/articles/[slug]/page.tsx` | Article reading page |
| `src/components/chrome/*` | TopStrip, Masthead, Nav, Drawer, Footer, ToastProvider |
| `src/components/ui/*` | Eyebrow, PageHead, Button, Panel, Callout, ImageSlot, Reveal |
| `src/components/site/*` | View-specific sections, one file per section |
| `src/lib/content/schema.ts` | Zod domain schemas and inferred types |
| `src/lib/content/seed/*.ts` | Seed data, one file per entity |
| `src/lib/content/index.ts` | The only content API pages may import |
| `src/lib/authors/filter.ts` | Author filter and search, pure |
| `src/lib/reveal.ts` | Scroll reveal with the 92% guard |
| `src/styles/globals.css` | Tokens, reset, keyframes, component classes |
| `tests/unit/*` | Vitest |
| `tests/e2e/*` | Playwright |

---

## Task 1: Scaffold, design tokens, and repo cleanup

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`
- Create: `src/styles/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx` (temporary, replaced in task 7)
- Create: `design-reference/` (move `ICRR Journal.dc.html`, `README.md`, `support.js`, `image-slot.js`, `assets/`)
- Create: `public/brand/` (copies of the three PNGs)
- Delete: `app.js`, `index.html`, `styles.css` (recoverable at commit `a0e45eb`)
- Test: `tests/unit/tokens.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties `--color-maroon`, `--color-maroon-hover`, `--color-maroon-deep`, `--color-gold`, `--color-gold-muted`, `--color-cream`, `--color-cream-tint`, `--color-page`, `--color-ink`, `--color-ink-soft`, `--color-body`, `--color-body-muted`, `--color-rule`, `--color-rule-light`, giving Tailwind utilities `bg-maroon`, `text-gold`, `border-rule`, and so on. Font variables `--font-serif` (Libre Baskerville) and `--font-sans` (Lato). Component classes `.eyebrow`, `.rule-double`, `.btn-maroon`, `.btn-gold`, `.btn-outline`, `.btn-outline-cream`, `.panel`, `.card`, `.callout-gold`, `.field`. Keyframes `icrrUp`, `icrrIn`, `icrrDraw`, `icrrPlate`, `icrrPulse`, `icrrDrawer`.

- [ ] **Step 1: Create the Next.js project in place**

The repo root already has files, so `create-next-app` cannot scaffold into it directly. Scaffold into a temp directory and move the contents in.

```bash
cd "C:/Users/Envy/Desktop/design_handoff_icrr_journal"
npx --yes create-next-app@latest .icrr-scaffold \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --no-turbopack --use-npm --yes
```

Expected: `.icrr-scaffold/` created with `package.json`, `src/app/`, `tsconfig.json`.

- [ ] **Step 2: Move the scaffold into the repo root and clean up**

```bash
cd "C:/Users/Envy/Desktop/design_handoff_icrr_journal"
mkdir -p design-reference
git mv "ICRR Journal.dc.html" design-reference/
git mv README.md design-reference/
git mv support.js design-reference/
git mv image-slot.js design-reference/
git mv assets design-reference/assets
git rm -q app.js index.html styles.css
mv .icrr-scaffold/* .icrr-scaffold/.[!.]* . 2>/dev/null
rm -rf .icrr-scaffold
mkdir -p public/brand
cp design-reference/assets/icrr_lockup_full_name_transparent.png public/brand/lockup-full.png
cp design-reference/assets/icrr_lockup_stacked_transparent.png public/brand/lockup-stacked.png
cp design-reference/assets/icrr_mark.png public/brand/mark.png
```

Expected: `ls` shows `src/`, `public/`, `design-reference/`, `docs/`, `package.json`, and no `app.js`, `index.html`, or `styles.css` at root.

- [ ] **Step 3: Install the remaining dependencies**

```bash
npm install zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test
npx playwright install chromium
```

Expected: all install without peer-dependency errors.

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit/setup.ts'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

Create `tests/unit/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

- [ ] **Step 5: Write the failing token test**

Create `tests/unit/tokens.test.ts`. This test guards the single highest-risk thing at this stage: a mistyped hex in the palette propagates into every view.

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('src/styles/globals.css', 'utf8')

const COLORS: Record<string, string> = {
  maroon: '#5D1D21',
  'maroon-hover': '#7C2A2F',
  'maroon-deep': '#3F1417',
  gold: '#C0A265',
  'gold-muted': '#8A7B5C',
  cream: '#F7F4EF',
  'cream-tint': '#FBF7EE',
  page: '#FDFBF7',
  ink: '#241F1E',
  'ink-soft': '#3F3733',
  body: '#5A524A',
  'body-muted': '#6E655C',
  rule: '#E2DACB',
  'rule-light': '#EFE9DF',
}

describe('design tokens', () => {
  it.each(Object.entries(COLORS))('declares --color-%s as %s', (name, hex) => {
    expect(css).toMatch(new RegExp(`--color-${name}:\\s*${hex};`, 'i'))
  })

  it.each(['icrrUp', 'icrrIn', 'icrrDraw', 'icrrPlate', 'icrrPulse', 'icrrDrawer'])(
    'defines the %s keyframes',
    (name) => {
      expect(css).toContain(`@keyframes ${name}`)
    },
  )

  it('declares the one permitted shadow and no other', () => {
    const shadows = css.match(/box-shadow:[^;]+;/g) ?? []
    expect(shadows).toEqual(['box-shadow: 0 10px 30px rgba(36, 31, 30, 0.28);'])
  })

  it('resets border radius globally', () => {
    expect(css).toMatch(/border-radius:\s*0/)
  })
})
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test -- tests/unit/tokens.test.ts`
Expected: FAIL. Every case fails because `src/styles/globals.css` still holds the create-next-app default.

- [ ] **Step 7: Write globals.css**

Replace `src/styles/globals.css` entirely. Delete `src/app/globals.css` if create-next-app placed one there.

```css
@import 'tailwindcss';

@theme {
  --color-maroon: #5D1D21;
  --color-maroon-hover: #7C2A2F;
  --color-maroon-deep: #3F1417;
  --color-gold: #C0A265;
  --color-gold-muted: #8A7B5C;
  --color-cream: #F7F4EF;
  --color-cream-tint: #FBF7EE;
  --color-page: #FDFBF7;
  --color-ink: #241F1E;
  --color-ink-soft: #3F3733;
  --color-body: #5A524A;
  --color-body-muted: #6E655C;
  --color-rule: #E2DACB;
  --color-rule-light: #EFE9DF;

  --font-serif: var(--font-libre-baskerville), Georgia, serif;
  --font-sans: var(--font-lato), system-ui, sans-serif;
}

/* Global reset. Prototype lines 16-23. */
*,
*::before,
*::after {
  box-sizing: border-box;
  border-radius: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--color-page);
  color: var(--color-ink);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--color-maroon);
  text-decoration: none;
}

a:hover {
  color: var(--color-maroon-hover);
}

img {
  max-width: 100%;
}

::selection {
  background: var(--color-gold);
  color: var(--color-ink);
}

input,
select,
textarea,
button {
  font-family: inherit;
}

/* Keyframes. Prototype lines 24-29. */
@keyframes icrrUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}
@keyframes icrrIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes icrrDraw {
  from { width: 0; }
  to { width: 96px; }
}
@keyframes icrrPlate {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: none; }
}
@keyframes icrrPulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
@keyframes icrrDrawer {
  from { transform: translateX(100%); }
  to { transform: none; }
}

@layer components {
  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-gold-muted);
  }

  .rule-double {
    border-top: 3px double var(--color-maroon);
  }

  .btn-base {
    display: inline-block;
    padding: 12px 22px;
    font-size: 11.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  }

  .btn-maroon {
    background: var(--color-maroon);
    color: var(--color-cream);
  }
  .btn-maroon:hover {
    background: var(--color-maroon-hover);
    color: var(--color-cream);
  }

  .btn-gold {
    background: var(--color-gold);
    color: var(--color-maroon-deep);
  }
  .btn-gold:hover {
    background: #D2B67E;
    color: var(--color-maroon-deep);
  }

  .btn-outline {
    border: 1px solid var(--color-maroon);
    color: var(--color-maroon);
  }
  .btn-outline:hover {
    background: var(--color-cream);
  }

  .btn-outline-cream {
    border: 1px solid rgba(247, 244, 239, 0.5);
    color: var(--color-cream);
  }
  .btn-outline-cream:hover {
    background: rgba(247, 244, 239, 0.1);
    color: var(--color-cream);
  }

  .panel {
    background: var(--color-cream);
    border: 1px solid var(--color-rule);
  }

  .card {
    border: 1px solid var(--color-rule);
    background: var(--color-page);
  }

  .callout-gold {
    border: 1px solid var(--color-gold);
    background: var(--color-cream-tint);
  }

  .field {
    width: 100%;
    background: var(--color-page);
    border: 1px solid var(--color-rule);
    padding: 11px 13px;
    font-size: 14.5px;
    color: var(--color-ink);
    outline: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

`#D2B67E` is the gold hover value from spec §4 and prototype line 224; it is the one hex outside the 14 tokens, permitted because it appears exactly once.

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test -- tests/unit/tokens.test.ts`
Expected: PASS, all cases.

- [ ] **Step 9: Wire fonts and the root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Libre_Baskerville, Lato } from 'next/font/google'
import '@/styles/globals.css'

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre-baskerville',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'International Collegiate Research Review',
  description:
    'An independent, open-access journal publishing undergraduate and graduate research across five sections.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${libreBaskerville.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

Replace `src/app/page.tsx` with a placeholder that task 7 overwrites:

```tsx
export default function Home() {
  return <main className="p-10 font-serif text-maroon">ICRR scaffold</main>
}
```

- [ ] **Step 10: Verify the app builds and runs**

Run: `npm run build`
Expected: build succeeds with no type errors.

Run: `npm run dev`, open `http://localhost:3000`
Expected: "ICRR scaffold" renders in Libre Baskerville, maroon, on the `#FDFBF7` page background.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js app with ICRR design tokens

Move the design handoff into design-reference/ and remove the superseded
vanilla JS prototype, recoverable at a0e45eb."
```

---

## Task 2: Domain schema, seed data, and content accessors

**Files:**
- Create: `src/lib/content/schema.ts`
- Create: `src/lib/content/seed/config.ts`, `disciplines.ts`, `team.ts`, `roles.ts`, `authors.ts`, `issues.ts`, `articles.ts`, `announcements.ts`, `ticker.ts`, `process.ts`
- Create: `src/lib/content/index.ts`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: types `SiteConfig`, `Discipline`, `TeamMember`, `EditorialRole`, `Author`, `Issue`, `Article`, `Announcement`, `TickerLine`, `ProcessStep`, `TimelineEntry`, `Requirement`, `Fact`. Async accessors `getConfig()`, `getDisciplines()`, `getTeam()`, `getEditorialRoles()`, `getAuthors()`, `getAuthorBySlug(slug)`, `getIssues()`, `getCurrentIssue()`, `getArticles()`, `getArticleBySlug(slug)`, `getArticlesByAuthor(authorId)`, `getAnnouncements()`, `getTickerLines()`, `getProcessSteps()`, `getTimeline()`, `getRequirements()`, `getChecklist()`, `getFacts()`, `getTocPreview()`.

Every accessor is `async` from day one so plan 2 can swap the body for a Supabase query with no call-site change.

- [ ] **Step 1: Write the failing content test**

Create `tests/unit/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  getAnnouncements,
  getAuthorBySlug,
  getAuthors,
  getConfig,
  getCurrentIssue,
  getDisciplines,
  getEditorialRoles,
  getTeam,
  getTickerLines,
} from '@/lib/content'

describe('content accessors', () => {
  it('returns the six seeded authors with unique slugs', async () => {
    const authors = await getAuthors()
    expect(authors).toHaveLength(6)
    expect(new Set(authors.map((a) => a.slug)).size).toBe(6)
  })

  it('finds an author by slug', async () => {
    const author = await getAuthorBySlug('amara-okonkwo')
    expect(author?.name).toBe('Amara Okonkwo')
    expect(author?.disciplineSlug).toBe('natural-sciences')
  })

  it('returns null for an unknown slug rather than throwing', async () => {
    expect(await getAuthorBySlug('nobody')).toBeNull()
  })

  it('returns the five disciplines in order', async () => {
    const names = (await getDisciplines()).map((d) => d.name)
    expect(names).toEqual([
      'Natural Sciences',
      'Business & Economics',
      'Law & Policy',
      'Humanities',
      'Social Sciences',
    ])
  })

  it('returns the three team members', async () => {
    const team = await getTeam()
    expect(team.map((t) => t.name)).toEqual([
      'Ayla Ahmadova',
      'Kanan Hajiyev',
      'Gunel Ahmadova',
    ])
  })

  it('returns seven editorial roles and excludes Editor-in-Chief', async () => {
    const roles = await getEditorialRoles()
    expect(roles).toHaveLength(7)
    expect(roles.some((r) => r.title.includes('Editor-in-Chief'))).toBe(false)
  })

  it('returns config with the deadline and expected dates', async () => {
    const config = await getConfig()
    expect(config.deadline).toBe('31 August 2026')
    expect(config.expected).toBe('30 September 2026')
    expect(config.showPreviewNotes).toBe(true)
  })

  it('returns the three ticker lines', async () => {
    expect(await getTickerLines()).toHaveLength(3)
  })

  it('returns the three announcements newest first', async () => {
    const news = await getAnnouncements()
    expect(news).toHaveLength(3)
    expect(news[0].title).toBe('Call for Papers: Volume 1, Issue 1')
  })

  it('returns Volume 1 Issue 1 as the current issue, in preparation', async () => {
    const issue = await getCurrentIssue()
    expect(issue?.volume).toBe(1)
    expect(issue?.number).toBe(1)
    expect(issue?.status).toBe('in_preparation')
  })
})

describe('copy rules', () => {
  it('contains no em dashes in any seeded copy', async () => {
    const everything = JSON.stringify([
      await getConfig(),
      await getDisciplines(),
      await getTeam(),
      await getEditorialRoles(),
      await getAuthors(),
      await getAnnouncements(),
      await getTickerLines(),
    ])
    expect(everything).not.toContain('\u2014')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/content.test.ts`
Expected: FAIL with "Failed to resolve import @/lib/content".

- [ ] **Step 3: Write the domain schema**

Create `src/lib/content/schema.ts`:

```ts
import { z } from 'zod'

export const siteConfigSchema = z.object({
  deadline: z.string(),
  expected: z.string(),
  showPreviewNotes: z.boolean(),
  contactEmail: z.string().email(),
  issnStatus: z.string(),
  heroImagePath: z.string().nullable(),
  positionImagePath: z.string().nullable(),
})

export const disciplineSchema = z.object({
  slug: z.string(),
  name: z.string(),
  blurb: z.string(),
  sortOrder: z.number().int(),
})

export const teamMemberSchema = z.object({
  slug: z.string(),
  name: z.string(),
  role: z.string(),
  duty: z.string(),
  portraitPath: z.string().nullable(),
  sortOrder: z.number().int(),
})

export const editorialRoleStatusSchema = z.enum(['pending', 'recruiting'])

export const editorialRoleSchema = z.object({
  title: z.string(),
  status: editorialRoleStatusSchema,
  statusLabel: z.string(),
  duty: z.string(),
  sortOrder: z.number().int(),
})

export const authorSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  role: z.string(),
  affiliation: z.string(),
  department: z.string(),
  location: z.string(),
  disciplineSlug: z.string(),
  disciplineName: z.string(),
  orcid: z.string().nullable(),
  bio: z.string(),
  interests: z.array(z.string()),
  portraitPath: z.string().nullable(),
})

export const issueStatusSchema = z.enum(['in_preparation', 'published'])

export const issueSchema = z.object({
  slug: z.string(),
  volume: z.number().int(),
  number: z.number().int(),
  status: issueStatusSchema,
  statusLabel: z.string(),
  publishDate: z.string().nullable(),
  submissionsClose: z.string().nullable(),
  coverPath: z.string().nullable(),
  description: z.string(),
  isCurrent: z.boolean(),
})

export const articleStatusSchema = z.enum(['draft', 'under_review', 'published'])

export const articleAuthorSchema = z.object({
  authorId: z.string(),
  authorName: z.string(),
  authorSlug: z.string(),
  affiliationMarker: z.string(),
  order: z.number().int(),
})

export const articleSchema = z.object({
  slug: z.string(),
  issueSlug: z.string().nullable(),
  disciplineSlug: z.string(),
  disciplineName: z.string(),
  articleType: z.string(),
  title: z.string(),
  abstract: z.string(),
  keywords: z.array(z.string()),
  status: articleStatusSchema,
  statusLabel: z.string(),
  citation: z.string(),
  pdfPath: z.string().nullable(),
  pageStart: z.number().int().nullable(),
  pageEnd: z.number().int().nullable(),
  receivedOn: z.string().nullable(),
  acceptedOn: z.string().nullable(),
  publishedOn: z.string().nullable(),
  authors: z.array(articleAuthorSchema),
})

export const announcementSchema = z.object({
  slug: z.string(),
  publishedOn: z.string(),
  tag: z.string(),
  title: z.string(),
  blurb: z.string(),
  body: z.string(),
  ctaLabel: z.string().nullable(),
  ctaHref: z.string().nullable(),
  sortOrder: z.number().int(),
})

export const tickerLineSchema = z.object({
  text: z.string(),
  sortOrder: z.number().int(),
})

export const processStepSchema = z.object({
  number: z.string(),
  time: z.string(),
  title: z.string(),
  body: z.string(),
})

export const timelineEntrySchema = z.object({
  title: z.string(),
  when: z.string(),
  body: z.string(),
  filled: z.boolean(),
})

export const requirementSchema = z.object({ key: z.string(), value: z.string() })
export const factSchema = z.object({ key: z.string(), value: z.string() })

export const tocPreviewEntrySchema = z.object({
  section: z.string(),
  title: z.string(),
  byline: z.string(),
  pages: z.string(),
})

export type SiteConfig = z.infer<typeof siteConfigSchema>
export type Discipline = z.infer<typeof disciplineSchema>
export type TeamMember = z.infer<typeof teamMemberSchema>
export type EditorialRole = z.infer<typeof editorialRoleSchema>
export type Author = z.infer<typeof authorSchema>
export type Issue = z.infer<typeof issueSchema>
export type Article = z.infer<typeof articleSchema>
export type ArticleAuthor = z.infer<typeof articleAuthorSchema>
export type Announcement = z.infer<typeof announcementSchema>
export type TickerLine = z.infer<typeof tickerLineSchema>
export type ProcessStep = z.infer<typeof processStepSchema>
export type TimelineEntry = z.infer<typeof timelineEntrySchema>
export type Requirement = z.infer<typeof requirementSchema>
export type Fact = z.infer<typeof factSchema>
export type TocPreviewEntry = z.infer<typeof tocPreviewEntrySchema>
```

- [ ] **Step 4: Write the seed data**

Create the files below. Every string is copied verbatim from the prototype at the cited lines. Do not paraphrase.

`src/lib/content/seed/config.ts`:

```ts
import type { SiteConfig } from '../schema'

export const config: SiteConfig = {
  deadline: '31 August 2026',
  expected: '30 September 2026',
  showPreviewNotes: true,
  contactEmail: 'icrrjournal@gmail.com',
  issnStatus: 'Pending',
  heroImagePath: null,
  positionImagePath: null,
}
```

`src/lib/content/seed/disciplines.ts` (prototype lines 750-756):

```ts
import type { Discipline } from '../schema'

export const disciplines: Discipline[] = [
  { slug: 'natural-sciences', name: 'Natural Sciences', blurb: 'Biology, chemistry, physics, earth and environmental science.', sortOrder: 1 },
  { slug: 'business-economics', name: 'Business & Economics', blurb: 'Markets, organisations, finance, and applied economics.', sortOrder: 2 },
  { slug: 'law-policy', name: 'Law & Policy', blurb: 'Doctrinal analysis, comparative law, regulation, and governance.', sortOrder: 3 },
  { slug: 'humanities', name: 'Humanities', blurb: 'History, literature, philosophy, languages, and the arts.', sortOrder: 4 },
  { slug: 'social-sciences', name: 'Social Sciences', blurb: 'Psychology, sociology, anthropology, and political science.', sortOrder: 5 },
]
```

`src/lib/content/seed/team.ts` (prototype lines 826-830; note the prototype's trailing `\n` in two `role` values is a data artefact and must be dropped):

```ts
import type { TeamMember } from '../schema'

export const team: TeamMember[] = [
  { slug: 'ayla-ahmadova', name: 'Ayla Ahmadova', role: 'Founder & Editor', duty: 'Founded the journal and leads editorial direction, scope, and final decisions on submissions.', portraitPath: null, sortOrder: 1 },
  { slug: 'kanan-hajiyev', name: 'Kanan Hajiyev', role: 'Technical Director', duty: 'Builds and maintains the journal platform, submission workflow, and article archive.', portraitPath: null, sortOrder: 2 },
  { slug: 'gunel-ahmadova', name: 'Gunel Ahmadova', role: 'Chief Marketing Officer', duty: 'Runs calls for papers, announcements, and outreach to student researchers and institutions.', portraitPath: null, sortOrder: 3 },
]
```

`src/lib/content/seed/roles.ts` (prototype lines 832-840; `holder` becomes `statusLabel`, `color` becomes `status`):

```ts
import type { EditorialRole } from '../schema'

export const editorialRoles: EditorialRole[] = [
  { title: 'Managing Editor', status: 'pending', statusLabel: 'Appointment pending', duty: 'Runs the review cycle, correspondence, and production schedule.', sortOrder: 1 },
  { title: 'Section Editor, Natural Sciences', status: 'recruiting', statusLabel: 'Recruiting', duty: 'Assigns reviewers and arbitrates conflicting reports in the sciences.', sortOrder: 2 },
  { title: 'Section Editor, Business & Economics', status: 'recruiting', statusLabel: 'Recruiting', duty: 'Oversees review in economics, finance, and organisational research.', sortOrder: 3 },
  { title: 'Section Editor, Law & Policy', status: 'recruiting', statusLabel: 'Recruiting', duty: 'Handles doctrinal, comparative, and regulatory submissions.', sortOrder: 4 },
  { title: 'Section Editor, Humanities', status: 'recruiting', statusLabel: 'Recruiting', duty: 'Oversees history, literature, philosophy, and the arts.', sortOrder: 5 },
  { title: 'Section Editor, Social Sciences', status: 'recruiting', statusLabel: 'Recruiting', duty: 'Oversees psychology, sociology, anthropology, and politics.', sortOrder: 6 },
  { title: 'Copyeditor', status: 'recruiting', statusLabel: 'Recruiting', duty: 'House style, references, and proofing of accepted manuscripts.', sortOrder: 7 },
]
```

`src/lib/content/seed/authors.ts` (prototype lines 758-783). Slugs are kebab-cased names. `publications` moves out of the author record into `articles.ts` and is joined by `getArticlesByAuthor`.

```ts
import type { Author } from '../schema'

export const authors: Author[] = [
  {
    id: 'a1', slug: 'amara-okonkwo', name: 'Amara Okonkwo',
    role: 'MSc candidate, Environmental Science', affiliation: 'University of Edinburgh',
    department: 'School of GeoSciences', location: 'Edinburgh, United Kingdom',
    disciplineSlug: 'natural-sciences', disciplineName: 'Natural Sciences',
    orcid: '0000-0002-1825-0097',
    bio: 'Amara studies how urban tree canopy affects summer surface temperatures in mid-sized European cities. Her work combines satellite thermal imagery with ground sensor networks, and she is interested in making municipal climate data usable by the councils that collect it.',
    interests: ['Urban climate', 'Remote sensing', 'Environmental policy', 'Open data'],
    portraitPath: null,
  },
  {
    id: 'a2', slug: 'daniel-reyes', name: 'Daniel Reyes',
    role: 'Undergraduate, Economics', affiliation: 'Universidad de Chile',
    department: 'Facultad de Economía y Negocios', location: 'Santiago, Chile',
    disciplineSlug: 'business-economics', disciplineName: 'Business & Economics',
    orcid: '0000-0001-5109-3700',
    bio: 'Daniel works on informal labour markets and household credit access in Latin America. He is assembling a panel dataset on microloan repayment drawn from three national household surveys.',
    interests: ['Informal labour', 'Household finance', 'Development economics'],
    portraitPath: null,
  },
  {
    id: 'a3', slug: 'sofia-almeida', name: 'Sofia Almeida',
    role: 'LLM candidate, Public Law', affiliation: 'Universidade de Lisboa',
    department: 'Faculdade de Direito', location: 'Lisbon, Portugal',
    disciplineSlug: 'law-policy', disciplineName: 'Law & Policy',
    orcid: '0000-0003-4471-2288',
    bio: 'Sofia researches how national courts apply proportionality review to emergency legislation, with a focus on measures introduced under time pressure and later left in force.',
    interests: ['Constitutional law', 'Proportionality', 'Emergency powers', 'Comparative law'],
    portraitPath: null,
  },
  {
    id: 'a4', slug: 'kenji-watanabe', name: 'Kenji Watanabe',
    role: 'Undergraduate, History', affiliation: 'University of Tokyo',
    department: 'Faculty of Letters', location: 'Tokyo, Japan',
    disciplineSlug: 'humanities', disciplineName: 'Humanities',
    orcid: '0000-0002-9931-4410',
    bio: 'Kenji works on port-city trade correspondence in the nineteenth century, reading merchant letters as evidence of how commercial trust was established between parties who never met.',
    interests: ['Economic history', 'Archival method', 'Port cities'],
    portraitPath: null,
  },
  {
    id: 'a5', slug: 'priya-nair', name: 'Priya Nair',
    role: 'PhD candidate, Social Psychology', affiliation: 'University of Toronto',
    department: 'Department of Psychology', location: 'Toronto, Canada',
    disciplineSlug: 'social-sciences', disciplineName: 'Social Sciences',
    orcid: '0000-0001-7742-6013',
    bio: 'Priya studies how students judge the credibility of peers in group work, and whether those judgements track actual competence. Her current project is a pre-registered replication across four institutions.',
    interests: ['Group dynamics', 'Credibility judgement', 'Replication', 'Pre-registration'],
    portraitPath: null,
  },
  {
    id: 'a6', slug: 'lukas-brenner', name: 'Lukas Brenner',
    role: 'MSc candidate, Chemistry', affiliation: 'ETH Zürich',
    department: 'Department of Chemistry and Applied Biosciences', location: 'Zürich, Switzerland',
    disciplineSlug: 'natural-sciences', disciplineName: 'Natural Sciences',
    orcid: '0000-0002-3308-9915',
    bio: 'Lukas develops low-cost colorimetric assays for detecting heavy metals in drinking water, with an emphasis on methods that can be run without laboratory instrumentation.',
    interests: ['Analytical chemistry', 'Water quality', 'Low-cost instrumentation'],
    portraitPath: null,
  },
]
```

`src/lib/content/seed/issues.ts`:

```ts
import type { Issue } from '../schema'

export const issues: Issue[] = [
  {
    slug: 'volume-1-issue-1', volume: 1, number: 1,
    status: 'in_preparation', statusLabel: 'In preparation',
    publishDate: '30 September 2026', submissionsClose: '31 August 2026',
    coverPath: null,
    description: 'Publishing 30 September 2026. Submissions open until 31 August 2026.',
    isCurrent: true,
  },
  {
    slug: 'volume-1-issue-2', volume: 1, number: 2,
    status: 'in_preparation', statusLabel: 'Scheduled',
    publishDate: '30 October 2026', submissionsClose: null,
    coverPath: null,
    description: '30 October 2026',
    isCurrent: false,
  },
]
```

`src/lib/content/seed/articles.ts` (from the four `publications` entries at prototype lines 762, 766, 774, 778):

```ts
import type { Article } from '../schema'

export const articles: Article[] = [
  {
    slug: 'canopy-cover-and-summer-surface-temperature',
    issueSlug: 'volume-1-issue-1',
    disciplineSlug: 'natural-sciences', disciplineName: 'Natural Sciences',
    articleType: 'Research article',
    title: 'Canopy cover and summer surface temperature in mid-sized European cities',
    abstract: 'A comparison of thermal imagery and ground sensor readings across eleven cities, testing whether canopy targets translate into measurable cooling.',
    keywords: ['Urban climate', 'Remote sensing', 'Thermal imagery'],
    status: 'under_review', statusLabel: 'Under review',
    citation: 'ICRR, Vol. 1, Issue 1 (forthcoming)',
    pdfPath: null, pageStart: null, pageEnd: null,
    receivedOn: null, acceptedOn: null, publishedOn: null,
    authors: [{ authorId: 'a1', authorName: 'Amara Okonkwo', authorSlug: 'amara-okonkwo', affiliationMarker: '1', order: 1 }],
  },
  {
    slug: 'microloan-repayment-and-informal-income-volatility',
    issueSlug: 'volume-1-issue-1',
    disciplineSlug: 'business-economics', disciplineName: 'Business & Economics',
    articleType: 'Research article',
    title: 'Microloan repayment and informal income volatility',
    abstract: 'Tests whether income volatility, rather than income level, predicts default among informally employed borrowers.',
    keywords: ['Household finance', 'Informal labour', 'Credit access'],
    status: 'under_review', statusLabel: 'Under review',
    citation: 'ICRR, Vol. 1, Issue 1 (forthcoming)',
    pdfPath: null, pageStart: null, pageEnd: null,
    receivedOn: null, acceptedOn: null, publishedOn: null,
    authors: [{ authorId: 'a2', authorName: 'Daniel Reyes', authorSlug: 'daniel-reyes', affiliationMarker: '1', order: 1 }],
  },
  {
    slug: 'letters-of-credit-and-letters-of-trust',
    issueSlug: 'volume-1-issue-1',
    disciplineSlug: 'humanities', disciplineName: 'Humanities',
    articleType: 'Research article',
    title: 'Letters of credit and letters of trust in the treaty ports',
    abstract: 'Reads a corpus of merchant correspondence to trace how reputation substituted for enforceable contract.',
    keywords: ['Economic history', 'Port cities', 'Archival method'],
    status: 'under_review', statusLabel: 'Under review',
    citation: 'ICRR, Vol. 1, Issue 1 (forthcoming)',
    pdfPath: null, pageStart: null, pageEnd: null,
    receivedOn: null, acceptedOn: null, publishedOn: null,
    authors: [{ authorId: 'a4', authorName: 'Kenji Watanabe', authorSlug: 'kenji-watanabe', affiliationMarker: '1', order: 1 }],
  },
  {
    slug: 'perceived-and-actual-competence-in-student-project-groups',
    issueSlug: 'volume-1-issue-1',
    disciplineSlug: 'social-sciences', disciplineName: 'Social Sciences',
    articleType: 'Replication study',
    title: 'Perceived and actual competence in student project groups: a four-site replication',
    abstract: 'A pre-registered replication testing whether confident speech predicts assigned credibility more strongly than demonstrated accuracy.',
    keywords: ['Group dynamics', 'Replication', 'Credibility judgement'],
    status: 'under_review', statusLabel: 'Under review',
    citation: 'ICRR, Vol. 1, Issue 1 (forthcoming)',
    pdfPath: null, pageStart: null, pageEnd: null,
    receivedOn: null, acceptedOn: null, publishedOn: null,
    authors: [{ authorId: 'a5', authorName: 'Priya Nair', authorSlug: 'priya-nair', affiliationMarker: '1', order: 1 }],
  },
]
```

`src/lib/content/seed/announcements.ts` (prototype lines 791-798; `ctaKey` becomes a real href):

```ts
import type { Announcement } from '../schema'

export const announcements: Announcement[] = [
  {
    slug: 'call-for-papers-volume-1-issue-1', publishedOn: '15 July 2026', tag: 'Call for papers',
    title: 'Call for Papers: Volume 1, Issue 1',
    blurb: 'Submissions open in all five sections until 31 August 2026.',
    body: 'ICRR invites original research, reviews, replication studies, and case analyses of 3,000–8,000 words from students at any institution. Submissions for Issue 1 close 31 August 2026; the issue publishes 30 September 2026, and at the end of each month thereafter. There are no fees at any stage.',
    ctaLabel: 'Read the guidelines', ctaHref: '/submit', sortOrder: 1,
  },
  {
    slug: 'reviewer-recruitment-inaugural-cycle', publishedOn: '2 July 2026', tag: 'Editorial',
    title: 'Reviewer recruitment for the inaugural cycle',
    blurb: 'Graduate students, postdocs, and faculty are invited to join the review panel.',
    body: 'Each section is building a panel of reviewers with subject expertise. Reviewers assess up to two manuscripts a month with a three-week turnaround, and are credited on the team page unless they ask not to be.',
    ctaLabel: 'Meet the team', ctaHref: '/team', sortOrder: 2,
  },
  {
    slug: 'the-journal-is-established', publishedOn: '20 June 2026', tag: 'Journal',
    title: 'The journal is established',
    blurb: 'ICRR is founded as an independent, open-access outlet for student research.',
    body: 'ICRR was established to give early-career researchers a properly reviewed, permanently citable place to publish. Articles are licensed CC BY 4.0 and authors retain copyright; ISSN registration follows the first issue.',
    ctaLabel: 'About the journal', ctaHref: '/about', sortOrder: 3,
  },
]
```

`src/lib/content/seed/ticker.ts` (prototype lines 785-789):

```ts
import type { TickerLine } from '../schema'

export const tickerLines: TickerLine[] = [
  { text: 'Call for Papers: Issue 1 closes 31 August 2026.', sortOrder: 1 },
  { text: 'Issue 1 publishes 30 September 2026, and at the end of each month thereafter.', sortOrder: 2 },
  { text: 'We are recruiting peer reviewers across all five sections.', sortOrder: 3 },
]
```

`src/lib/content/seed/process.ts` (prototype lines 800-824, 842-857, 815-819):

```ts
import type { Fact, ProcessStep, Requirement, TimelineEntry, TocPreviewEntry } from '../schema'

export const processSteps: ProcessStep[] = [
  { number: '1', time: 'Day 1', title: 'Submission', body: 'Upload an anonymised manuscript and a short cover letter.' },
  { number: '2', time: 'Week 1', title: 'Editorial screening', body: 'An editor checks scope, eligibility, and similarity.' },
  { number: '3', time: 'Weeks 1–3', title: 'Double-blind review', body: 'At least two subject reviewers return written reports.' },
  { number: '4', time: 'Week 4', title: 'Decision and copyediting', body: 'Accepted papers are copyedited for the next issue.' },
]

export const timeline: TimelineEntry[] = [
  { title: 'Submissions open', when: 'Now', body: 'Rolling. Papers enter the next available monthly cycle.', filled: true },
  { title: 'Issue 1 submissions close', when: '31 Aug 2026', body: 'Later submissions are held for the October issue.', filled: false },
  { title: 'Peer review', when: '2–3 weeks', body: 'Double-blind assessment by at least two reviewers.', filled: false },
  { title: 'Decisions returned', when: 'Mid-Sept 2026', body: 'Accept, revise, or decline, based on the reviewer reports.', filled: false },
  { title: 'Publication', when: '30 Sept 2026', body: 'Issue 1 published open access, then at the end of each month.', filled: false },
]

export const tocPreview: TocPreviewEntry[] = [
  { section: 'Natural Sciences', title: 'Article title as it will appear in the table of contents', byline: 'Author Name, Institution', pages: 'pp. 1–18' },
  { section: 'Business & Economics', title: 'A second article, showing a title that runs to two lines in the listing', byline: 'Author Name, Institution', pages: 'pp. 19–34' },
  { section: 'Humanities', title: 'A third article entry', byline: 'Author Name, Institution', pages: 'pp. 35–52' },
]

export const facts: Fact[] = [
  { key: 'Founded', value: '2026' },
  { key: 'Access', value: 'Open, CC BY 4.0' },
  { key: 'Author fees', value: 'None' },
  { key: 'Review', value: 'Double-blind' },
  { key: 'Frequency', value: 'Monthly, at month end' },
  { key: 'ISSN', value: 'Pending' },
]

export const requirements: Requirement[] = [
  { key: 'Length', value: '3,000–8,000 words excluding references and appendices.' },
  { key: 'File format', value: 'PDF or DOCX, single column, 1.5 line spacing, numbered pages.' },
  { key: 'Anonymisation', value: 'No author names, affiliations, or acknowledgements in the manuscript file.' },
  { key: 'Abstract', value: '250 words maximum, plus four to six keywords.' },
  { key: 'References', value: 'Consistent style throughout: APA, Chicago, or OSCOLA.' },
  { key: 'Figures', value: 'Numbered, captioned, and legible in greyscale at print size.' },
]

export const checklist: string[] = [
  'At least one author is a current student or graduated within the last twelve months.',
  'The manuscript is anonymised and contains no identifying information.',
  'The work is original, unpublished, and not under consideration elsewhere.',
  'Ethical approval is attached where human subjects are involved.',
  'Funding, supervision, and use of generative tools are declared in the cover letter.',
]
```

- [ ] **Step 5: Write the accessor module**

Create `src/lib/content/index.ts`. Every accessor validates through Zod on the way out, so a malformed seed fails loudly here rather than silently rendering wrong.

```ts
import {
  announcementSchema, articleSchema, authorSchema, disciplineSchema,
  editorialRoleSchema, issueSchema, siteConfigSchema, teamMemberSchema, tickerLineSchema,
} from './schema'
import type {
  Announcement, Article, Author, Discipline, EditorialRole, Fact, Issue,
  ProcessStep, Requirement, SiteConfig, TeamMember, TickerLine, TimelineEntry, TocPreviewEntry,
} from './schema'

import { config } from './seed/config'
import { disciplines } from './seed/disciplines'
import { team } from './seed/team'
import { editorialRoles } from './seed/roles'
import { authors } from './seed/authors'
import { issues } from './seed/issues'
import { articles } from './seed/articles'
import { announcements } from './seed/announcements'
import { tickerLines } from './seed/ticker'
import { checklist, facts, processSteps, requirements, timeline, tocPreview } from './seed/process'

const byOrder = <T extends { sortOrder: number }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => a.sortOrder - b.sortOrder)

export async function getConfig(): Promise<SiteConfig> {
  return siteConfigSchema.parse(config)
}

export async function getDisciplines(): Promise<Discipline[]> {
  return byOrder(disciplines).map((d) => disciplineSchema.parse(d))
}

export async function getTeam(): Promise<TeamMember[]> {
  return byOrder(team).map((t) => teamMemberSchema.parse(t))
}

export async function getEditorialRoles(): Promise<EditorialRole[]> {
  return byOrder(editorialRoles).map((r) => editorialRoleSchema.parse(r))
}

export async function getAuthors(): Promise<Author[]> {
  return authors.map((a) => authorSchema.parse(a))
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const found = authors.find((a) => a.slug === slug)
  return found ? authorSchema.parse(found) : null
}

export async function getIssues(): Promise<Issue[]> {
  return issues.map((i) => issueSchema.parse(i))
}

export async function getCurrentIssue(): Promise<Issue | null> {
  const found = issues.find((i) => i.isCurrent)
  return found ? issueSchema.parse(found) : null
}

export async function getArticles(): Promise<Article[]> {
  return articles.map((a) => articleSchema.parse(a))
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const found = articles.find((a) => a.slug === slug)
  return found ? articleSchema.parse(found) : null
}

export async function getArticlesByAuthor(authorId: string): Promise<Article[]> {
  return articles
    .filter((a) => a.authors.some((x) => x.authorId === authorId))
    .map((a) => articleSchema.parse(a))
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return byOrder(announcements).map((a) => announcementSchema.parse(a))
}

export async function getTickerLines(): Promise<TickerLine[]> {
  return byOrder(tickerLines).map((t) => tickerLineSchema.parse(t))
}

export async function getProcessSteps(): Promise<ProcessStep[]> { return processSteps }
export async function getTimeline(): Promise<TimelineEntry[]> { return timeline }
export async function getTocPreview(): Promise<TocPreviewEntry[]> { return tocPreview }
export async function getFacts(): Promise<Fact[]> { return facts }
export async function getRequirements(): Promise<Requirement[]> { return requirements }
export async function getChecklist(): Promise<string[]> { return checklist }

export * from './schema'
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- tests/unit/content.test.ts`
Expected: PASS, all cases including the em dash check.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add domain schema, seed content, and content accessors

Accessors are async from the start so the Supabase implementation in
plan 2 can replace their bodies with no call-site change."
```

---

## Task 3: Author filter and search

Extracted as its own task because it is the only non-trivial logic on the public site and the prototype's exact matching behaviour must be preserved.

**Files:**
- Create: `src/lib/authors/filter.ts`
- Test: `tests/unit/authors-filter.test.ts`

**Interfaces:**
- Consumes: `Author`, `Article` from `@/lib/content`.
- Produces:
  - `type AuthorCard = Author & { publicationCount: number; publicationTitles: string[] }`
  - `buildAuthorCards(authors: Author[], articles: Article[]): AuthorCard[]`
  - `filterAuthors(cards: AuthorCard[], disciplineName: string, query: string): AuthorCard[]`
  - `publicationLabel(count: number): string`
  - `countLabel(visible: number, total: number): string`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/authors-filter.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getArticles, getAuthors } from '@/lib/content'
import {
  buildAuthorCards, countLabel, filterAuthors, publicationLabel,
} from '@/lib/authors/filter'

const cards = async () => buildAuthorCards(await getAuthors(), await getArticles())

describe('buildAuthorCards', () => {
  it('attaches publication counts from articles', async () => {
    const all = await cards()
    expect(all.find((a) => a.slug === 'amara-okonkwo')?.publicationCount).toBe(1)
    expect(all.find((a) => a.slug === 'sofia-almeida')?.publicationCount).toBe(0)
  })
})

describe('filterAuthors', () => {
  it('returns everyone for All sections and an empty query', async () => {
    expect(filterAuthors(await cards(), 'All', '')).toHaveLength(6)
  })

  it('filters by discipline name', async () => {
    const result = filterAuthors(await cards(), 'Natural Sciences', '')
    expect(result.map((a) => a.slug).sort()).toEqual(['amara-okonkwo', 'lukas-brenner'])
  })

  it('matches name case-insensitively', async () => {
    expect(filterAuthors(await cards(), 'All', 'PRIYA')).toHaveLength(1)
  })

  it('matches affiliation', async () => {
    expect(filterAuthors(await cards(), 'All', 'edinburgh')[0].slug).toBe('amara-okonkwo')
  })

  it('matches research interests', async () => {
    expect(filterAuthors(await cards(), 'All', 'proportionality')[0].slug).toBe('sofia-almeida')
  })

  it('matches bio text', async () => {
    expect(filterAuthors(await cards(), 'All', 'colorimetric')[0].slug).toBe('lukas-brenner')
  })

  it('matches publication titles', async () => {
    expect(filterAuthors(await cards(), 'All', 'treaty ports')[0].slug).toBe('kenji-watanabe')
  })

  it('matches role', async () => {
    expect(filterAuthors(await cards(), 'All', 'LLM candidate')[0].slug).toBe('sofia-almeida')
  })

  it('combines discipline and query, returning empty when they conflict', async () => {
    expect(filterAuthors(await cards(), 'Humanities', 'edinburgh')).toEqual([])
  })

  it('ignores surrounding whitespace in the query', async () => {
    expect(filterAuthors(await cards(), 'All', '  priya  ')).toHaveLength(1)
  })
})

describe('publicationLabel', () => {
  it.each([
    [0, 'Under review for Issue 1'],
    [1, '1 article'],
    [2, '2 articles'],
  ])('renders %i as "%s"', (count, expected) => {
    expect(publicationLabel(count)).toBe(expected)
  })
})

describe('countLabel', () => {
  it('reads plainly when nothing is filtered out', () => {
    expect(countLabel(6, 6)).toBe('6 contributors')
  })

  it('reads as a subset when filtered', () => {
    expect(countLabel(3, 6)).toBe('3 of 6 contributors')
  })

  it('reads as a subset when empty', () => {
    expect(countLabel(0, 6)).toBe('0 of 6 contributors')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/authors-filter.test.ts`
Expected: FAIL with "Failed to resolve import @/lib/authors/filter".

- [ ] **Step 3: Write the implementation**

Create `src/lib/authors/filter.ts`. The haystack fields mirror prototype line 930 exactly.

```ts
import type { Article, Author } from '@/lib/content'

export type AuthorCard = Author & {
  publicationCount: number
  publicationTitles: string[]
}

export function buildAuthorCards(authors: Author[], articles: Article[]): AuthorCard[] {
  return authors.map((author) => {
    const own = articles.filter((a) => a.authors.some((x) => x.authorId === author.id))
    return {
      ...author,
      publicationCount: own.length,
      publicationTitles: own.map((a) => a.title),
    }
  })
}

export function filterAuthors(
  cards: AuthorCard[],
  disciplineName: string,
  query: string,
): AuthorCard[] {
  const needle = query.trim().toLowerCase()
  return cards.filter((card) => {
    if (disciplineName !== 'All' && card.disciplineName !== disciplineName) return false
    if (!needle) return true
    const haystack = [
      card.name,
      card.affiliation,
      card.disciplineName,
      card.role,
      card.bio,
      card.interests.join(' '),
      card.publicationTitles.join(' '),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(needle)
  })
}

export function publicationLabel(count: number): string {
  if (count === 0) return 'Under review for Issue 1'
  return `${count} ${count === 1 ? 'article' : 'articles'}`
}

export function countLabel(visible: number, total: number): string {
  return visible === total ? `${total} contributors` : `${visible} of ${total} contributors`
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/unit/authors-filter.test.ts`
Expected: PASS, all cases.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add author filter and search matching the prototype"
```

---

## Task 4: Scroll reveal with the above-the-fold guard

**Files:**
- Create: `src/lib/reveal.ts`
- Create: `src/components/ui/Reveal.tsx`
- Test: `tests/unit/reveal.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `armReveal(root?: ParentNode): () => void` returning a disconnect function, and `<Reveal>{children}</Reveal>` which renders a `<section data-reveal>` wrapper.

The guard at prototype line 906 is the critical behaviour: an element already within 92% of the viewport height on arrival is never hidden, so nothing above the fold flashes blank.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/reveal.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { armReveal } from '@/lib/reveal'

type ObservedCallback = (entries: { isIntersecting: boolean; target: Element }[], obs: { unobserve: (el: Element) => void }) => void

let observed: Element[] = []
let capturedCallback: ObservedCallback | null = null

class FakeIntersectionObserver {
  constructor(cb: ObservedCallback) {
    capturedCallback = cb
  }
  observe(el: Element) { observed.push(el) }
  unobserve(el: Element) { observed = observed.filter((o) => o !== el) }
  disconnect() { observed = [] }
}

function makeElement(top: number): HTMLElement {
  const el = document.createElement('section')
  el.setAttribute('data-reveal', '')
  el.getBoundingClientRect = () => ({ top }) as DOMRect
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  observed = []
  capturedCallback = null
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('armReveal', () => {
  it('leaves above-the-fold elements fully visible and unobserved', () => {
    const el = makeElement(500) // 500 < 1000 * 0.92
    armReveal()
    expect(el.style.opacity).toBe('')
    expect(el.style.transform).toBe('')
    expect(observed).not.toContain(el)
  })

  it('treats exactly the 92% boundary as below the fold', () => {
    const el = makeElement(920) // not < 920, so it hides
    armReveal()
    expect(el.style.opacity).toBe('0')
    expect(observed).toContain(el)
  })

  it('hides and observes below-the-fold elements', () => {
    const el = makeElement(1500)
    armReveal()
    expect(el.style.opacity).toBe('0')
    expect(el.style.transform).toBe('translateY(20px)')
    expect(observed).toContain(el)
  })

  it('reveals an element when it intersects, then unobserves it', () => {
    const el = makeElement(1500)
    armReveal()
    capturedCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: (target) => { observed = observed.filter((o) => o !== target) },
    })
    expect(el.style.opacity).toBe('1')
    expect(el.style.transform).toBe('none')
    expect(el.style.transition).toBe('opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)')
    expect(observed).not.toContain(el)
  })

  it('ignores non-intersecting entries', () => {
    const el = makeElement(1500)
    armReveal()
    capturedCallback?.([{ isIntersecting: false, target: el }], { unobserve: () => {} })
    expect(el.style.opacity).toBe('0')
  })

  it('returns a disconnect function that clears observation', () => {
    makeElement(1500)
    const disconnect = armReveal()
    disconnect()
    expect(observed).toHaveLength(0)
  })

  it('does nothing when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const el = makeElement(1500)
    expect(() => armReveal()).not.toThrow()
    expect(el.style.opacity).toBe('')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/reveal.test.ts`
Expected: FAIL with "Failed to resolve import @/lib/reveal".

- [ ] **Step 3: Write the implementation**

Create `src/lib/reveal.ts`. Ported from prototype lines 891-911.

```ts
const TRANSITION = 'opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)'
const ROOT_MARGIN = '0px 0px -12% 0px'
const FOLD_RATIO = 0.92

export function armReveal(root: ParentNode = document): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const target = entry.target as HTMLElement
        target.style.transition = TRANSITION
        target.style.opacity = '1'
        target.style.transform = 'none'
        obs.unobserve(target)
      })
    },
    { rootMargin: ROOT_MARGIN },
  )

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    // Already within the fold on arrival: never hide it, or it flashes blank.
    if (el.getBoundingClientRect().top < window.innerHeight * FOLD_RATIO) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    observer.observe(el)
  })

  return () => observer.disconnect()
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/unit/reveal.test.ts`
Expected: PASS, all eight cases.

- [ ] **Step 5: Add the Reveal wrapper component**

Create `src/components/ui/Reveal.tsx`. This is a server component; only the arming is client-side, added in task 6's chrome.

```tsx
export function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <section data-reveal className={className}>
      {children}
    </section>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add scroll reveal with the above-the-fold guard"
```

---

## Task 5: UI primitives

**Files:**
- Create: `src/components/ui/Eyebrow.tsx`, `PageHead.tsx`, `Button.tsx`, `Panel.tsx`, `Callout.tsx`, `ImageSlot.tsx`, `Container.tsx`
- Test: `tests/unit/ui.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `<Container width="content" | "wide">` — `max-width: 1180px` or `1400px`, `padding: 0 clamp(18px, 5vw, 40px)`, centered
  - `<Eyebrow tone="muted" | "gold">`
  - `<PageHead title, lead?, centered?>` — h1 at `clamp(27px, 5.4vw, 44px)` under a double rule
  - `<Button href, variant="maroon" | "gold" | "outline" | "outline-cream", full?>`
  - `<Panel tone="cream" | "page">`
  - `<Callout>` — the gold-hairline `#FBF7EE` block
  - `<ImageSlot src, label, ratio, priority?, className?>` — renders `next/image` when `src` is set, otherwise the dashed placeholder

- [ ] **Step 1: Write the failing test**

Create `tests/unit/ui.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ImageSlot } from '@/components/ui/ImageSlot'

describe('Eyebrow', () => {
  it('uppercases through the eyebrow class', () => {
    render(<Eyebrow>Our position</Eyebrow>)
    expect(screen.getByText('Our position')).toHaveClass('eyebrow')
  })
})

describe('Button', () => {
  it('renders a link with the maroon variant class', () => {
    render(<Button href="/submit" variant="maroon">Submit a Manuscript</Button>)
    const link = screen.getByRole('link', { name: 'Submit a Manuscript' })
    expect(link).toHaveAttribute('href', '/submit')
    expect(link).toHaveClass('btn-maroon')
  })

  it('renders the gold variant', () => {
    render(<Button href="/submit" variant="gold">Submit</Button>)
    expect(screen.getByRole('link')).toHaveClass('btn-gold')
  })
})

describe('ImageSlot', () => {
  it('renders the labelled placeholder when src is null', () => {
    render(<ImageSlot src={null} label="Hero image" ratio="1400/470" />)
    expect(screen.getByText('Hero image')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders an image with alt text when src is set', () => {
    render(<ImageSlot src="/brand/mark.png" label="ICRR mark" ratio="1/1" />)
    expect(screen.getByRole('img', { name: 'ICRR mark' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/ui.test.tsx`
Expected: FAIL with unresolved imports for the three components.

- [ ] **Step 3: Write the primitives**

`src/components/ui/Container.tsx`:

```tsx
export function Container({
  children,
  width = 'content',
  className = '',
}: {
  children: React.ReactNode
  width?: 'content' | 'wide'
  className?: string
}) {
  const max = width === 'wide' ? 'max-w-[1400px]' : 'max-w-[1180px]'
  return (
    <div className={`${max} mx-auto px-[clamp(18px,5vw,40px)] ${className}`}>{children}</div>
  )
}
```

`src/components/ui/Eyebrow.tsx`:

```tsx
export function Eyebrow({
  children,
  tone = 'muted',
  className = '',
}: {
  children: React.ReactNode
  tone?: 'muted' | 'gold'
  className?: string
}) {
  const color = tone === 'gold' ? 'text-gold' : 'text-gold-muted'
  return <div className={`eyebrow ${color} ${className}`}>{children}</div>
}
```

`src/components/ui/Button.tsx`:

```tsx
import Link from 'next/link'

type Variant = 'maroon' | 'gold' | 'outline' | 'outline-cream'

const VARIANTS: Record<Variant, string> = {
  maroon: 'btn-maroon',
  gold: 'btn-gold',
  outline: 'btn-outline',
  'outline-cream': 'btn-outline-cream',
}

export function Button({
  href,
  children,
  variant = 'maroon',
  full = false,
  className = '',
}: {
  href: string
  children: React.ReactNode
  variant?: Variant
  full?: boolean
  className?: string
}) {
  return (
    <Link
      href={href}
      className={`btn-base ${VARIANTS[variant]} ${full ? 'block w-full text-center' : ''} ${className}`}
    >
      {children}
    </Link>
  )
}
```

`src/components/ui/Panel.tsx`:

```tsx
export function Panel({
  children,
  tone = 'cream',
  className = '',
}: {
  children: React.ReactNode
  tone?: 'cream' | 'page'
  className?: string
}) {
  const fill = tone === 'cream' ? 'bg-cream' : 'bg-page'
  return <div className={`${fill} border border-rule ${className}`}>{children}</div>
}
```

`src/components/ui/Callout.tsx`:

```tsx
export function Callout({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`callout-gold ${className}`}>{children}</div>
}
```

`src/components/ui/PageHead.tsx`:

```tsx
import { Container } from './Container'

export function PageHead({
  title,
  lead,
  centered = false,
}: {
  title: React.ReactNode
  lead?: React.ReactNode
  centered?: boolean
}) {
  return (
    <Container className={`pt-[clamp(38px,6vw,56px)] pb-[clamp(24px,4vw,34px)] ${centered ? 'text-center' : ''}`}>
      <h1 className="font-serif font-normal text-[clamp(27px,5.4vw,44px)] leading-[1.22] text-ink max-w-[22ch] m-0" style={centered ? { marginInline: 'auto' } : undefined}>
        {title}
      </h1>
      {lead ? (
        <p className={`font-sans text-[15.5px] leading-[1.85] text-body max-w-[68ch] mt-[18px] ${centered ? 'mx-auto' : ''}`}>
          {lead}
        </p>
      ) : null}
      <div className="rule-double mt-[clamp(24px,4vw,34px)]" />
    </Container>
  )
}
```

`src/components/ui/ImageSlot.tsx`:

```tsx
import Image from 'next/image'

export function ImageSlot({
  src,
  label,
  ratio,
  priority = false,
  className = '',
}: {
  src: string | null
  label: string
  ratio: string
  priority?: boolean
  className?: string
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: ratio }}>
        <Image src={src} alt={label} fill priority={priority} className="object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`grid place-items-center border border-dashed border-rule bg-page p-4 text-center ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <span className="eyebrow text-gold-muted">{label}</span>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/unit/ui.test.tsx`
Expected: PASS, all five cases.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add UI primitives for the journal design system"
```

---

## Task 6: Global chrome

**Files:**
- Create: `src/components/chrome/TopStrip.tsx`, `Masthead.tsx`, `Nav.tsx`, `Drawer.tsx`, `Footer.tsx`, `ToastProvider.tsx`, `RevealArmer.tsx`
- Create: `src/lib/nav-items.ts`
- Create: `src/app/(site)/layout.tsx`
- Test: `tests/e2e/chrome.spec.ts`

**Interfaces:**
- Consumes: `getConfig()` from `@/lib/content`; `armReveal` from `@/lib/reveal`.
- Produces:
  - `NAV_ITEMS: { href: string; label: string }[]` — the six primary links
  - `DRAWER_ITEMS: { href: string; label: string }[]` — the six plus Announcements
  - `PAGE_TITLES: Record<string, string>` — route to narrow-nav label
  - `<ToastProvider>` plus `useToast(): (message: string) => void`
  - `<SiteLayout>` composing all chrome

`Nav` and `Drawer` are one client island (`Nav.tsx` owns the `narrow` and `menuOpen` state and renders `Drawer`). `ToastProvider` is a client island. `RevealArmer` is a client island that calls `armReveal` on mount and on every pathname change.

- [ ] **Step 1: Write the nav item constants**

Create `src/lib/nav-items.ts`. Prototype lines 959-966 and 861-864.

```ts
export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/issue/current', label: 'Current Issue' },
  { href: '/archives', label: 'Archives' },
  { href: '/authors', label: 'Authors' },
  { href: '/team', label: 'Our Team' },
] as const

export const DRAWER_ITEMS = [
  ...NAV_ITEMS,
  { href: '/news', label: 'Announcements' },
] as const

export const PAGE_TITLES: Record<string, string> = {
  '/': '',
  '/about': 'About',
  '/issue/current': 'Current Issue',
  '/archives': 'Archives',
  '/authors': 'Authors',
  '/team': 'Our Team',
  '/submit': 'Submit',
  '/news': 'Announcements',
}

/** Authors stays highlighted on author profile pages. Prototype line 964. */
export function isNavItemActive(itemHref: string, pathname: string): boolean {
  if (itemHref === '/') return pathname === '/'
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`)
}

export function pageTitleFor(pathname: string): string {
  if (PAGE_TITLES[pathname] !== undefined) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/authors/')) return 'Contributor'
  if (pathname.startsWith('/articles/')) return 'Article'
  return ''
}
```

- [ ] **Step 2: Write the failing chrome unit test**

Create `tests/unit/nav-items.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { isNavItemActive, pageTitleFor } from '@/lib/nav-items'

describe('isNavItemActive', () => {
  it('matches home only exactly', () => {
    expect(isNavItemActive('/', '/')).toBe(true)
    expect(isNavItemActive('/', '/about')).toBe(false)
  })

  it('keeps Authors active on an author profile', () => {
    expect(isNavItemActive('/authors', '/authors/priya-nair')).toBe(true)
  })

  it('does not activate About on an unrelated route', () => {
    expect(isNavItemActive('/about', '/archives')).toBe(false)
  })
})

describe('pageTitleFor', () => {
  it('is empty on home', () => {
    expect(pageTitleFor('/')).toBe('')
  })

  it('names known routes', () => {
    expect(pageTitleFor('/team')).toBe('Our Team')
  })

  it('names an author profile "Contributor"', () => {
    expect(pageTitleFor('/authors/priya-nair')).toBe('Contributor')
  })

  it('names an article page "Article"', () => {
    expect(pageTitleFor('/articles/anything')).toBe('Article')
  })
})
```

Run: `npm test -- tests/unit/nav-items.test.ts`
Expected: FAIL, then PASS after step 1's file is in place. If step 1 is already committed, this test passes immediately; that is acceptable for a pure constants module.

- [ ] **Step 3: Build TopStrip and Masthead**

`src/components/chrome/TopStrip.tsx` — port prototype lines 36-41. Server component.

```tsx
import Link from 'next/link'

export function TopStrip() {
  return (
    <div className="bg-maroon text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(247,244,239,.82)' }}>
      <div className="max-w-[1180px] mx-auto px-[clamp(16px,5vw,40px)] py-2 flex justify-between gap-5 flex-wrap">
        <span>Open Access · ISSN Pending · Est. 2026</span>
        <span className="flex gap-[22px]">
          <Link href="/about#contact" style={{ color: 'rgba(247,244,239,.82)' }}>Contact</Link>
          <Link href="/news" style={{ color: 'rgba(247,244,239,.82)' }}>Announcements</Link>
        </span>
      </div>
    </div>
  )
}
```

`src/components/chrome/Masthead.tsx` — port prototype lines 42-47. Server component.

```tsx
import Image from 'next/image'
import Link from 'next/link'

export function Masthead() {
  return (
    <header
      className="text-center px-[clamp(16px,5vw,40px)] pt-[clamp(14px,4vw,10px)] pb-[clamp(18px,3vw,8px)]"
      style={{ animation: 'icrrIn .6s ease both' }}
    >
      <Link href="/" className="inline-block">
        <Image
          src="/brand/lockup-full.png"
          alt="International Collegiate Research Review"
          width={454}
          height={126}
          priority
          className="h-[126px] w-[454px] object-contain block max-w-full"
        />
      </Link>
    </header>
  )
}
```

- [ ] **Step 4: Build Nav and Drawer**

`src/components/chrome/Nav.tsx` — client island. Ports prototype lines 48-102 and the matchMedia logic at 872-875. The two variants are separate DOM, switched by state, not by CSS `display`.

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DRAWER_ITEMS, NAV_ITEMS, isNavItemActive, pageTitleFor } from '@/lib/nav-items'
import { Drawer } from './Drawer'

export function Nav({ deadline, contactEmail }: { deadline: string; contactEmail: string }) {
  const pathname = usePathname()
  const [narrow, setNarrow] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)')
    setNarrow(mq.matches)
    const onChange = (e: MediaQueryListEvent) => {
      setNarrow(e.matches)
      // Crossing above 860px force-closes the drawer. Prototype line 873.
      if (!e.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // Every navigation closes the drawer. Prototype line 913.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <nav className="sticky top-0 z-40 bg-page rule-double border-b border-maroon">
        {narrow ? (
          <div className="max-w-[1180px] mx-auto px-[clamp(12px,4vw,40px)] flex items-center justify-between gap-3 min-h-[50px]">
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex flex-col gap-[4px] w-5 bg-transparent border-0 p-0 cursor-pointer"
            >
              <span className="block h-[1.5px] w-5 bg-maroon transition-transform duration-200" style={{ transform: menuOpen ? 'translateY(5.5px) rotate(45deg)' : 'none' }} />
              <span className="block h-[1.5px] w-5 bg-maroon transition-opacity duration-200" style={{ opacity: menuOpen ? 0 : 1 }} />
              <span className="block h-[1.5px] w-5 bg-maroon transition-transform duration-200" style={{ transform: menuOpen ? 'translateY(-5.5px) rotate(-45deg)' : 'none' }} />
            </button>
            <span className="font-serif text-[12.5px] text-gold-muted truncate min-w-0 flex-1 text-center">
              {pageTitleFor(pathname)}
            </span>
            <Link href="/submit" className="flex-none bg-maroon text-cream px-[18px] py-[9px] text-[11.5px] tracking-[0.14em] uppercase font-bold whitespace-nowrap hover:bg-maroon-hover hover:text-cream">
              Submit
            </Link>
          </div>
        ) : (
          <div className="max-w-[1180px] mx-auto px-[clamp(12px,4vw,40px)] flex items-center justify-between gap-[clamp(10px,2vw,24px)] min-h-[50px]">
            <div
              className="flex-1 min-w-0 flex gap-[clamp(13px,2.2vw,30px)] flex-nowrap overflow-x-auto text-[clamp(10.5px,1.15vw,12.5px)] tracking-[0.13em] uppercase font-bold whitespace-nowrap"
              style={{ scrollbarWidth: 'none', justifyContent: 'safe center' }}
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-[15px] text-ink-soft border-b-2"
                  style={{ borderBottomColor: isNavItemActive(item.href, pathname) ? '#C0A265' : 'transparent' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link href="/submit" className="flex-none bg-maroon text-cream px-[18px] py-[9px] text-[11.5px] tracking-[0.14em] uppercase font-bold whitespace-nowrap hover:bg-maroon-hover hover:text-cream">
              Submit
            </Link>
          </div>
        )}
      </nav>

      {narrow && menuOpen ? (
        <Drawer
          items={DRAWER_ITEMS}
          pathname={pathname}
          deadline={deadline}
          contactEmail={contactEmail}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
    </>
  )
}
```

`src/components/chrome/Drawer.tsx` — client component. Ports prototype lines 78-102.

```tsx
'use client'

import Link from 'next/link'
import { isNavItemActive } from '@/lib/nav-items'

export function Drawer({
  items,
  pathname,
  deadline,
  contactEmail,
  onClose,
}: {
  items: readonly { href: string; label: string }[]
  pathname: string
  deadline: string
  contactEmail: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[60]"
      style={{ background: 'rgba(36,31,30,.5)', animation: 'icrrIn .2s ease both' }}
      onClick={onClose}
    >
      <aside
        className="absolute right-0 top-0 h-full w-[min(86vw,340px)] bg-page flex flex-col"
        style={{
          borderLeft: '3px double #5D1D21',
          animation: 'icrrDrawer .3s cubic-bezier(.2,.7,.2,1) both',
        }}
        // Clicks inside the sheet must not reach the scrim handler.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[22px] py-4 border-b border-rule-light">
          <span className="eyebrow">Navigation</span>
          <button type="button" aria-label="Close menu" onClick={onClose} className="bg-transparent border-0 text-[20px] leading-none text-maroon cursor-pointer p-0">
            ×
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {items.map((item) => {
            const active = isNavItemActive(item.href, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between font-serif text-[17px] px-[22px] py-4 border-b border-rule-light hover:bg-cream"
                style={{ color: active ? '#5D1D21' : '#241F1E' }}
              >
                {item.label}
                {active ? <span className="eyebrow text-gold">Current</span> : null}
              </Link>
            )
          })}
        </nav>

        <div className="px-[22px] py-5 border-t border-rule-light">
          <Link href="/submit" onClick={onClose} className="btn-base btn-maroon block w-full text-center">
            Submit
          </Link>
          <p className="text-[12.5px] text-body-muted mt-3 mb-0">Issue 1 submissions close {deadline}.</p>
          <p className="text-[12.5px] text-body-muted mt-1 mb-0">{contactEmail}</p>
        </div>
      </aside>
    </div>
  )
}
```

- [ ] **Step 5: Build Footer**

`src/components/chrome/Footer.tsx` — port prototype lines 703-742. Server component. Column 1 uses the standalone square mark, never the full lockup on a plate.

```tsx
import Image from 'next/image'
import Link from 'next/link'

const COLUMNS = [
  {
    head: 'The journal',
    links: [
      { href: '/about', label: 'About' },
      { href: '/issue/current', label: 'Current issue' },
      { href: '/archives', label: 'Archives' },
      { href: '/team', label: 'Our team' },
    ],
  },
  {
    head: 'For authors',
    links: [
      { href: '/submit', label: 'Submit' },
      { href: '/submit', label: 'Author guidelines' },
      { href: '/authors', label: 'Contributor directory' },
      { href: '/news', label: 'Announcements' },
    ],
  },
]

export function Footer({ contactEmail }: { contactEmail: string }) {
  const cream78 = { color: 'rgba(247,244,239,.78)' }

  return (
    <footer className="mt-[88px] bg-maroon" style={cream78}>
      <div className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] py-[clamp(38px,5vw,54px)] grid gap-[clamp(28px,4vw,44px)] [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <div className="flex items-center gap-[18px]">
          <Image src="/brand/mark.png" alt="" width={74} height={74} className="w-[clamp(58px,12vw,74px)] h-auto" />
          <span
            className="font-serif uppercase text-cream text-[clamp(11px,1.2vw,12.5px)] tracking-[0.16em] pl-[18px]"
            style={{ borderLeft: '1px solid rgba(192,162,101,.55)' }}
          >
            International Collegiate
            <br />
            Research Review
          </span>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.head}>
            <div className="eyebrow text-gold mb-4">{column.head}</div>
            <ul className="list-none p-0 m-0 grid gap-[10px]">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px]" style={cream78}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <div className="eyebrow text-gold mb-4">Contact</div>
          <ul className="list-none p-0 m-0 grid gap-[10px] text-[13px]">
            <li><a href={`mailto:${contactEmail}`} style={cream78}>{contactEmail}</a></li>
            <li>ISSN pending</li>
          </ul>
        </div>
      </div>

      <div
        className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] py-[18px] flex justify-between gap-5 flex-wrap text-[11.5px]"
        style={{ borderTop: '1px solid rgba(247,244,239,.18)' }}
      >
        <span>© 2026 International Collegiate Research Review</span>
        <span>Publication ethics · Open access policy · Articles licensed CC BY 4.0</span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 6: Build ToastProvider and RevealArmer**

`src/components/chrome/ToastProvider.tsx` — client island. Ports prototype lines 743-745 and 916.

```tsx
'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const TOAST_MS = 3600

const ToastContext = createContext<(message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('')
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((next: string) => {
    if (timeout.current) clearTimeout(timeout.current)
    setMessage(next)
    timeout.current = setTimeout(() => setMessage(''), TOAST_MS)
  }, [])

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <div
          role="status"
          className="fixed left-1/2 bottom-[30px] -translate-x-1/2 z-[80] bg-ink text-cream px-6 py-[14px] text-[14px] text-center max-w-[min(560px,90vw)]"
          style={{ boxShadow: '0 10px 30px rgba(36, 31, 30, 0.28)', animation: 'icrrUp .3s ease both' }}
        >
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}
```

Note: this is the only `box-shadow` permitted in the codebase, and it is written inline rather than in `globals.css` so the task 1 shadow test keeps passing. Add an exemption to that test:

In `tests/unit/tokens.test.ts`, the shadow assertion already scopes to `globals.css` only, so no change is needed.

`src/components/chrome/RevealArmer.tsx` — client island.

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { armReveal } from '@/lib/reveal'

export function RevealArmer() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
    const disconnect = armReveal()
    return disconnect
  }, [pathname])

  return null
}
```

- [ ] **Step 7: Compose the site layout**

Create `src/app/(site)/layout.tsx`:

```tsx
import { Footer } from '@/components/chrome/Footer'
import { Masthead } from '@/components/chrome/Masthead'
import { Nav } from '@/components/chrome/Nav'
import { RevealArmer } from '@/components/chrome/RevealArmer'
import { ToastProvider } from '@/components/chrome/ToastProvider'
import { TopStrip } from '@/components/chrome/TopStrip'
import { getConfig } from '@/lib/content'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfig()

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <TopStrip />
        <Masthead />
        <Nav deadline={config.deadline} contactEmail={config.contactEmail} />
        <RevealArmer />
        <main className="flex-1">{children}</main>
        <Footer contactEmail={config.contactEmail} />
      </div>
    </ToastProvider>
  )
}
```

Move the placeholder home page: `git mv src/app/page.tsx "src/app/(site)/page.tsx"`.

- [ ] **Step 8: Configure Playwright**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
```

- [ ] **Step 9: Write the chrome e2e test**

Create `tests/e2e/chrome.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test.describe('chrome at desktop width', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('shows the six primary nav links and the Submit pill', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav').first()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Our Team' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Submit' })).toBeVisible()
    await expect(nav.getByRole('button', { name: /menu/i })).toHaveCount(0)
  })

  test('marks the active page with the gold underline', async ({ page }) => {
    await page.goto('/about')
    const link = page.locator('nav').first().getByRole('link', { name: 'About' })
    await expect(link).toHaveCSS('border-bottom-color', 'rgb(192, 162, 101)')
  })

  test('keeps Authors active on an author profile', async ({ page }) => {
    await page.goto('/authors/priya-nair')
    const link = page.locator('nav').first().getByRole('link', { name: 'Authors' })
    await expect(link).toHaveCSS('border-bottom-color', 'rgb(192, 162, 101)')
  })
})

test.describe('chrome at mobile width', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('replaces the links with a Menu button and the page name', async ({ page }) => {
    await page.goto('/about')
    const nav = page.locator('nav').first()
    await expect(nav.getByRole('button', { name: /menu/i })).toBeVisible()
    await expect(nav.getByText('About', { exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Archives' })).toHaveCount(0)
  })

  test('shows an empty page name on home', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav').first().getByRole('link', { name: 'Archives' })).toHaveCount(0)
  })

  test('opens the drawer, closes on the scrim, and stays open on an inside click', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open menu/i }).click()

    const drawer = page.getByRole('complementary')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByRole('link', { name: 'Announcements' })).toBeVisible()

    // A click inside the sheet must not close it.
    await drawer.getByText('Navigation').click()
    await expect(drawer).toBeVisible()

    // A click on the scrim must close it.
    await page.mouse.click(20, 400)
    await expect(drawer).toHaveCount(0)
  })

  test('closes the drawer when a nav item is chosen', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open menu/i }).click()
    await page.getByRole('complementary').getByRole('link', { name: 'Archives' }).click()
    await expect(page).toHaveURL(/\/archives$/)
    await expect(page.getByRole('complementary')).toHaveCount(0)
  })
})

test('resizing above 860px force-closes the drawer', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.getByRole('button', { name: /open menu/i }).click()
  await expect(page.getByRole('complementary')).toBeVisible()

  await page.setViewportSize({ width: 1200, height: 900 })
  await expect(page.getByRole('complementary')).toHaveCount(0)
})

test('footer carries the contact address and the licence line', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('contentinfo').getByText('icrrjournal@gmail.com')).toBeVisible()
  await expect(page.getByRole('contentinfo').getByText(/CC BY 4\.0/)).toBeVisible()
})
```

- [ ] **Step 10: Create stub routes so the e2e test can navigate**

Create minimal placeholder pages so navigation resolves. Each is replaced by its real task later.

```bash
for route in about issue/current archives authors team submit news; do
  mkdir -p "src/app/(site)/$route"
  cat > "src/app/(site)/$route/page.tsx" <<'EOF'
export default function Page() {
  return <div className="p-10" />
}
EOF
done
mkdir -p "src/app/(site)/authors/[slug]" "src/app/(site)/articles/[slug]"
cat > "src/app/(site)/authors/[slug]/page.tsx" <<'EOF'
export default function Page() {
  return <div className="p-10" />
}
EOF
cp "src/app/(site)/authors/[slug]/page.tsx" "src/app/(site)/articles/[slug]/page.tsx"
```

- [ ] **Step 11: Run the e2e test**

Run: `npm run test:e2e -- tests/e2e/chrome.spec.ts`
Expected: PASS, all cases across both projects.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add global chrome with matchMedia nav switching and drawer"
```

---

## Tasks 7 to 16: the ten views

Each view follows the same shape, so the steps are given once here and the per-view detail follows. **Do not skip the per-view detail; each view names its own sections, data, and prototype lines.**

**Shared steps for every view task:**

- [ ] **Step A:** Open `design-reference/ICRR Journal.dc.html` at the cited line range. Read the entire range before writing anything.
- [ ] **Step B:** Write the route's `page.tsx` as an async server component that awaits only the accessors listed under Data.
- [ ] **Step C:** Write one component file per section under `src/components/site/<view>/`. Port markup and inline styles verbatim; replace `{{ }}` bindings with props; replace `onClick="{{ go* }}"` with `next/link`.
- [ ] **Step D:** Run `npm run build` and confirm no type errors.
- [ ] **Step E:** Run the view's Playwright spec and confirm it passes.
- [ ] **Step F:** Commit with `feat: add <view> page`.

---

### Task 7: Home

**Files:**
- Modify: `src/app/(site)/page.tsx`
- Create: `src/components/site/home/Hero.tsx`, `HeroBand.tsx`, `AnnouncementBar.tsx`, `ValueColumns.tsx`, `WhatWePublish.tsx`, `ProcessSteps.tsx`, `OurPosition.tsx`, `AnnouncementRows.tsx`, `ClosingCta.tsx`
- Test: `tests/e2e/home.spec.ts`

**Prototype:** lines 103-227.
**Data:** `getConfig()`, `getDisciplines()`, `getTickerLines()`, `getProcessSteps()`, `getAnnouncements()`.

**Sections, in order:**

1. **Hero** (lines 104-118). Centered, `64px` top padding. Eyebrow "Volume 1 · Issue 1 · Publishing 30 September 2026". h1 `clamp(29px, 6.3vw, 52px)` / 1.2 / 400 / `letter-spacing:-.01em`, max `22ch`: "Student research, " then "read closely." in `text-maroon italic`. A `96px × 2px` gold rule animating from zero width: `animation: icrrDraw .9s cubic-bezier(.2,.7,.2,1) .35s both`. Lead paragraph `clamp(15px,1.7vw,16.5px)` / 1.85, max `64ch`. Two buttons: `Submit a Manuscript` (`btn-maroon`, href `/submit`) and `Read the Call for Papers` (`btn-outline`, href `/news`). The four blocks stagger via `animation: icrrUp .7s cubic-bezier(.2,.7,.2,1) <delay> both` at 0, 60, 140, and 220ms.

2. **HeroBand** (lines 119-135). `<Container width="wide">`, height `clamp(230px,45vw,470px)`, `border: 1px solid #E2DACB`, `animation: icrrPlate .9s ease .3s both`. `<ImageSlot src={config.heroImagePath} label="Library, reading room, or campus interior" ratio="1400/470" priority />` fills it. Absolutely positioned over it, `pointer-events: none`: a bottom gradient layer at `height: 52%` with `background: linear-gradient(to top, rgba(36,31,30,.72), rgba(36,31,30,0))`, carrying "Rigorous review. Transparent process. Work that stands on its own." in `font-serif clamp(16px,2.4vw,22px)` cream, max `34ch`, and "VOLUME 1 IN PREPARATION" right-aligned in `eyebrow` at `rgba(247,244,239,.75)`.

3. **AnnouncementBar** (lines 136-155). **Client island.** Full-bleed maroon, `min-height: 56px`. A `6px` gold dot with `animation: icrrPulse 2.4s ease-in-out infinite`, the label "LATEST", the rotating line, and an "ALL ANNOUNCEMENTS" link to `/news`. Rotation:

```tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { TickerLine } from '@/lib/content'

export function AnnouncementBar({ lines }: { lines: TickerLine[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (lines.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % lines.length), 6000)
    return () => clearInterval(timer)
  }, [lines.length])

  return (
    <div className="bg-maroon text-cream">
      <div className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] min-h-[56px] flex items-center gap-4 flex-wrap py-3">
        <span className="w-[6px] h-[6px] bg-gold flex-none" style={{ animation: 'icrrPulse 2.4s ease-in-out infinite' }} />
        <span className="eyebrow text-gold flex-none">Latest</span>
        <span aria-live="polite" className="flex-1 min-w-0 text-[13.5px]">{lines[index]?.text}</span>
        <Link href="/news" className="eyebrow text-cream flex-none">All announcements</Link>
      </div>
    </div>
  )
}
```

4. **ValueColumns** (lines 156-170). `data-reveal`, `64px` top padding. Three columns, `repeat(auto-fit, minmax(min(100%,260px), 1fr))`. Each: number `01`/`02`/`03` in `font-serif text-gold text-[13px]`, h3 in `text-maroon` at `19-21px`/700, body at `13.5-14.5px`/1.75. Content: "Double-blind peer review" / "Every submission is assessed by at least two subject-specialist reviewers."; "Open access, no fees" / "Free to read and free to publish. Authors retain copyright under CC BY 4.0."; "Genuinely multidisciplinary" / "Five sections and one review board, so interdisciplinary work has somewhere to go."

5. **WhatWePublish** (lines 171-185). `data-reveal`, `64px` top padding. h2 `clamp(22px,3.4vw,30px)`/400 plus an "AIMS & SCOPE" link to `/about`, under a `rule-double`. Then `disciplines.map()` rendering name and blurb per row with `border-bottom: 1px solid #E2DACB`.

6. **ProcessSteps** (lines 186-199). `data-reveal`, `70px` top padding. Heading "From submission to publication". Four bordered columns from `getProcessSteps()`. Each: a `26px` square with `border: 1px solid #C0A265` holding the step number in `font-serif text-gold`, the duration in `eyebrow`, h3, and one line of body copy.

7. **OurPosition** (lines 200-213). `data-reveal`, `70px` top padding, `bg-cream` panel, two columns `repeat(auto-fit, minmax(min(100%,420px), 1fr))`. Left: `<Eyebrow>Our position</Eyebrow>`, a pull quote in `font-serif italic text-maroon-deep clamp(19px,2.6vw,26px)`/1.55 reading "Student research deserves the same editorial care as any other scholarship. Not a lower bar, just a fairer door.", a supporting paragraph, and a "MORE ABOUT THE JOURNAL" link to `/about` with `border-bottom: 1px solid #C0A265`. Right: `<ImageSlot src={config.positionImagePath} label="Editorial photo" ratio="400/290" />`.

8. **AnnouncementRows** (lines 214-... within the reveal block). `data-reveal`. Three rows from `getAnnouncements()`. Each row: a `150px` date column, title and blurb, and a `→`, with `border-bottom: 1px solid #E2DACB` and `hover:bg-cream`. Each row links to `/news`.

9. **ClosingCta** (lines 214-227). `data-reveal`, `margin-top: 76px`, full-bleed maroon, centered. "Have a paper you are proud of?" plus deadline copy using `config.deadline` and `config.expected`. Buttons: `btn-gold` primary (the only gold-filled button in the design) and `btn-outline-cream` secondary.

**Test** `tests/e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('hero renders the headline and both calls to action', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Student research')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('read closely')
  await expect(page.getByRole('link', { name: 'Submit a Manuscript' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Read the Call for Papers' })).toBeVisible()
})

test('announcement bar rotates every six seconds', async ({ page }) => {
  await page.goto('/')
  const ticker = page.locator('[aria-live="polite"]')
  const first = await ticker.textContent()
  await expect(ticker).not.toHaveText(first ?? '', { timeout: 9000 })
})

test('lists the five disciplines', async ({ page }) => {
  await page.goto('/')
  for (const name of ['Natural Sciences', 'Business & Economics', 'Law & Policy', 'Humanities', 'Social Sciences']) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
  }
})

test('closing CTA uses the only gold-filled button', async ({ page }) => {
  await page.goto('/')
  const gold = page.locator('.btn-gold')
  await expect(gold).toHaveCount(1)
  await expect(gold).toHaveCSS('background-color', 'rgb(192, 162, 101)')
})

test('above-the-fold content is never hidden by the reveal', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const opacity = await page.locator('[data-reveal]').first().evaluate((el) => getComputedStyle(el).opacity)
  expect(Number(opacity)).toBeGreaterThan(0)
})
```

---

### Task 8: About

**Files:** `src/app/(site)/about/page.tsx`; `src/components/site/about/JournalAtAGlance.tsx`, `EditorialOffice.tsx`. Test: `tests/e2e/about.spec.ts`.
**Prototype:** lines 228-265.
**Data:** `getConfig()`, `getFacts()`.

`<PageHead>` then a `1.6fr / 1fr` grid collapsing at `repeat(auto-fit, minmax(min(100%,420px), 1fr))`.

Main column: a standfirst in `font-serif text-[20px] text-maroon-deep`, then four h2 sections in `text-maroon` at `24px`/700 — Aims and scope, Review policy, Publication ethics, Open access and copyright. Body paragraphs at `15.5px`/1.85, max `70ch`.

**The review policy copy is fixed and must be used verbatim:**

> All submissions undergo double-blind review by at least two reviewers. Author identities are removed before assessment, and reviewer identities are not disclosed.

Do not add any sentence promising written feedback to authors.

Sidebar, `position: sticky; top: 70px; max-width: 380px; justify-self: start`:
- **Journal at a glance** — a `panel` with a maroon header bar and six key/value rows from `getFacts()`, each divided by `1px solid #E2DACB`.
- **Editorial office** — carries `id="contact"`, the target of the top strip's Contact link. Reads "Enquiries and submissions" and the address from `config.contactEmail`.

**Test:**

```ts
import { expect, test } from '@playwright/test'

test('renders the four policy sections', async ({ page }) => {
  await page.goto('/about')
  for (const heading of ['Aims and scope', 'Review policy', 'Publication ethics', 'Open access and copyright']) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }
})

test('review policy does not promise author feedback', async ({ page }) => {
  await page.goto('/about')
  const body = (await page.locator('main').textContent()) ?? ''
  expect(body).toContain('reviewer identities are not disclosed')
  expect(body.toLowerCase()).not.toContain('written feedback')
})

test('contact block is reachable by anchor from the top strip', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Contact' }).click()
  await expect(page).toHaveURL(/\/about#contact$/)
  await expect(page.locator('#contact')).toBeVisible()
})

test('journal at a glance lists all six facts', async ({ page }) => {
  await page.goto('/about')
  for (const key of ['Founded', 'Access', 'Author fees', 'Review', 'Frequency', 'ISSN']) {
    await expect(page.getByText(key, { exact: true })).toBeVisible()
  }
})
```

---

### Task 9: Current Issue

**Files:** `src/app/(site)/issue/current/page.tsx`; `src/components/site/issue/StatusCallout.tsx`, `ProductionTimeline.tsx`, `TocPreview.tsx`, `KeyDates.tsx`. Test: `tests/e2e/issue.spec.ts`.
**Prototype:** lines 266-332.
**Data:** `getConfig()`, `getCurrentIssue()`, `getTimeline()`, `getTocPreview()`.

Centered head: h1 `clamp(28px,5.6vw,46px)`/1.2 "Volume 1, Issue 1" plus "Inaugural issue · Publishing 30 September 2026, then at the end of each month".

Main column:
- **StatusCallout** — a `callout-gold` reading "Calls for papers are open" plus a note that the table of contents appears here when Issue 1 publishes.
- **ProductionTimeline** — five entries from `getTimeline()` on an `11px` circle rail. The first dot is filled `#C0A265`; the rest are `#FDFBF7` with a `1px solid #E2DACB` border. A `1px` vertical rule connects them, drawn as an absolutely positioned element behind the dots.
- **TocPreview** — three rows from `getTocPreview()` at `opacity: .55`, each showing the section eyebrow, title, byline, page range, and a `PDF` chip. Below, a link to `/articles/canopy-cover-and-summer-surface-temperature` labelled as the article page template.

Sidebar: `<ImageSlot src={issue.coverPath} label="Issue 1 cover" ratio="3/4" />`, a **Key dates** panel (Submissions close 31 August 2026 · Decisions Mid-Sept 2026 · Publication 30 September 2026), and a full-width `btn-maroon` Submit button.

**Test:**

```ts
import { expect, test } from '@playwright/test'

test('shows the issue heading and status', async ({ page }) => {
  await page.goto('/issue/current')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Volume 1, Issue 1')
  await expect(page.getByText('Calls for papers are open')).toBeVisible()
})

test('renders all five timeline entries', async ({ page }) => {
  await page.goto('/issue/current')
  for (const title of ['Submissions open', 'Issue 1 submissions close', 'Peer review', 'Decisions returned', 'Publication']) {
    await expect(page.getByText(title, { exact: true })).toBeVisible()
  }
})

test('table of contents preview is visibly muted', async ({ page }) => {
  await page.goto('/issue/current')
  const preview = page.getByTestId('toc-preview')
  await expect(preview).toHaveCSS('opacity', '0.55')
})
```

Add `data-testid="toc-preview"` to the preview wrapper.

---

### Task 10: Archives

**Files:** `src/app/(site)/archives/page.tsx`; `src/components/site/archives/IssueCard.tsx`. Test: `tests/e2e/archives.spec.ts`.
**Prototype:** lines 333-365.
**Data:** `getConfig()`, `getIssues()`.

`<PageHead>` then a card grid at `repeat(auto-fill, minmax(min(100%,300px), 1fr))`:
- **Volume 1, Issue 1** — `callout-gold`, cover slot, "IN PREPARATION" eyebrow, "Publishing 30 September 2026. Submissions open until 31 August 2026.", and an "ISSUE STATUS" link to `/issue/current`.
- **Volume 1, Issue 2** — `border: 1px dashed #E2DACB`, "30 October 2026".
- **Future issues** — dashed, "Published at the end of each month". This card is static, not from `getIssues()`.

Below, under a `1px solid #E2DACB` rule, an indexing and preservation note.

**Test:**

```ts
import { expect, test } from '@playwright/test'

test('shows Issue 1 as in preparation with a link to its status', async ({ page }) => {
  await page.goto('/archives')
  await expect(page.getByText('In preparation', { exact: false }).first()).toBeVisible()
  await page.getByRole('link', { name: /issue status/i }).click()
  await expect(page).toHaveURL(/\/issue\/current$/)
})

test('shows the scheduled and future issue cards', async ({ page }) => {
  await page.goto('/archives')
  await expect(page.getByText('30 October 2026')).toBeVisible()
  await expect(page.getByText('Published at the end of each month')).toBeVisible()
})
```

---

### Task 11: Authors directory

**Files:** `src/app/(site)/authors/page.tsx`; `src/components/site/authors/AuthorsBrowser.tsx` (client island), `AuthorCard.tsx`, `PreviewBanner.tsx`. Test: `tests/e2e/authors.spec.ts`.
**Prototype:** lines 366-430.
**Data:** `getConfig()`, `getAuthors()`, `getArticles()`, `getDisciplines()`.

The page is a server component that builds the cards with `buildAuthorCards` and passes them to the client island. `filter` and `q` live in URL search params via `useRouter` and `useSearchParams`, so results are shareable and survive reload.

`<PageHead>`, then a dismissible design-preview banner rendered only when `config.showPreviewNotes` is true: `border-left: 3px solid #C0A265` on `bg-cream-tint`, stating the profiles are placeholders.

**Filter bar:** six chips from `['All', ...disciplines]`. Active chip `bg-maroon text-cream border-maroon`; inactive `bg-page text-body border-rule`. Plus a search input at `width: min(100%, 290px)` using the `field` class. A live count from `countLabel(visible.length, cards.length)`.

**Cards:** grid `repeat(auto-fill, minmax(min(100%,296px), 1fr))`. Each card links to `/authors/<slug>` and holds a `96 × 120px` portrait slot, the discipline eyebrow, the name in `font-serif text-[19px] font-bold`, the role, the affiliation, and `publicationLabel(count)` in `text-maroon`. Hover: `border-gold bg-cream-tint`.

**Empty state:** a `border-dashed border-rule` panel reading "No contributors match that search" plus a "CLEAR FILTERS" link that resets both params.

Closing panel: "Publish with us and get a profile" plus a Submit button.

**Test:**

```ts
import { expect, test } from '@playwright/test'

test('lists all six contributors by default', async ({ page }) => {
  await page.goto('/authors')
  await expect(page.getByText('6 contributors')).toBeVisible()
})

test('filters by discipline and reflects it in the URL', async ({ page }) => {
  await page.goto('/authors')
  await page.getByRole('button', { name: 'Natural Sciences' }).click()
  await expect(page).toHaveURL(/filter=Natural\+Sciences|filter=Natural%20Sciences/)
  await expect(page.getByText('2 of 6 contributors')).toBeVisible()
})

test('searches across bio and interests', async ({ page }) => {
  await page.goto('/authors')
  await page.getByRole('searchbox').fill('proportionality')
  await expect(page.getByText('1 of 6 contributors')).toBeVisible()
  await expect(page.getByText('Sofia Almeida')).toBeVisible()
})

test('shows the empty state and clears filters', async ({ page }) => {
  await page.goto('/authors')
  await page.getByRole('searchbox').fill('zzzznotathing')
  await expect(page.getByText('No contributors match that search')).toBeVisible()
  await page.getByRole('link', { name: /clear filters/i }).click()
  await expect(page.getByText('6 contributors')).toBeVisible()
})

test('filter state survives a reload', async ({ page }) => {
  await page.goto('/authors?filter=Humanities')
  await expect(page.getByText('1 of 6 contributors')).toBeVisible()
  await page.reload()
  await expect(page.getByText('1 of 6 contributors')).toBeVisible()
})

test('opens an author profile', async ({ page }) => {
  await page.goto('/authors')
  await page.getByRole('link', { name: /Priya Nair/ }).click()
  await expect(page).toHaveURL(/\/authors\/priya-nair$/)
})
```

---

### Task 12: Author profile

**Files:** `src/app/(site)/authors/[slug]/page.tsx`; `src/components/site/authors/ProfileHeader.tsx`, `PublicationList.tsx`, `ResearchInterests.tsx`. Test: `tests/e2e/author-profile.spec.ts`.
**Prototype:** lines 431-488.
**Data:** `getAuthorBySlug(slug)`, `getArticlesByAuthor(author.id)`, `getConfig()`.

Call `notFound()` when the slug does not resolve. Add `generateStaticParams` returning every author slug.

A back link to `/authors`, then a `200px` portrait beside the discipline eyebrow, the name at `clamp(26px,5vw,40px)`/1.2, "role · affiliation", the location, and three `btn-outline` chips: ORCID, Email author, Download all PDFs. All three call the toast with "Not available yet. PDFs and author links go live with Issue 1." They are therefore rendered by a small client component.

Under a `rule-double`: **Biography**, then **Publications with ICRR**. Each entry: the section eyebrow, the status in `text-gold` ("Under review"), the title, the abstract, the citation line, and a PDF link that toasts. An author with no publications gets a dashed panel reading "No published articles yet. This author has work under review for Issue 1."

Sidebar: **Research interests** as bordered tags, and an **Affiliation** block showing department, affiliation, and location.

**Test:**

```ts
import { expect, test } from '@playwright/test'

test('renders a profile with a publication', async ({ page }) => {
  await page.goto('/authors/amara-okonkwo')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Amara Okonkwo')
  await expect(page.getByText('University of Edinburgh').first()).toBeVisible()
  await expect(page.getByText('Under review').first()).toBeVisible()
  await expect(page.getByText(/Canopy cover and summer surface temperature/)).toBeVisible()
})

test('renders the empty publications state', async ({ page }) => {
  await page.goto('/authors/sofia-almeida')
  await expect(page.getByText('No published articles yet. This author has work under review for Issue 1.')).toBeVisible()
})

test('shows a toast for actions with no backend', async ({ page }) => {
  await page.goto('/authors/amara-okonkwo')
  await page.getByRole('button', { name: /orcid/i }).click()
  await expect(page.getByRole('status')).toHaveText('Not available yet. PDFs and author links go live with Issue 1.')
})

test('returns 404 for an unknown author', async ({ page }) => {
  const response = await page.goto('/authors/not-a-real-person')
  expect(response?.status()).toBe(404)
})

test('lists research interests', async ({ page }) => {
  await page.goto('/authors/priya-nair')
  await expect(page.getByText('Pre-registration')).toBeVisible()
})
```

---

### Task 13: Our Team

**Files:** `src/app/(site)/team/page.tsx`; `src/components/site/team/CoreTeam.tsx`, `EditorialRoles.tsx`, `ReviewerPanel.tsx`, `EditorialIndependence.tsx`. Test: `tests/e2e/team.spec.ts`.
**Prototype:** lines 489-537.
**Data:** `getTeam()`, `getEditorialRoles()`, `getConfig()`.

Head: "The people behind the journal" plus "A small team runs ICRR: editorial, technical, and communications. The section editorships are being appointed ahead of Issue 1."

**Core team** — three cards from `getTeam()`. Each: a `150px` max-width 4:5 `<ImageSlot>`, the role in `eyebrow`, the name in `font-serif text-[20px] font-bold`, and the duty line.

**Editorial roles** — seven entries from `getEditorialRoles()`. Each: the title, the `statusLabel` in uppercase coloured `text-gold-muted` when `status === 'pending'` and `text-maroon` when `'recruiting'`, and the duty line, divided by `1px solid #E2DACB`.

Two closing panels: **Join the reviewer panel** (a `callout-gold` reading "Two manuscripts a month, three-week turnaround" with an apply button that toasts) and **Editorial independence** (the recusal policy).

**Test:**

```ts
import { expect, test } from '@playwright/test'

test('shows the three core team members with their roles', async ({ page }) => {
  await page.goto('/team')
  await expect(page.getByText('Ayla Ahmadova')).toBeVisible()
  await expect(page.getByText('Founder & Editor')).toBeVisible()
  await expect(page.getByText('Kanan Hajiyev')).toBeVisible()
  await expect(page.getByText('Gunel Ahmadova')).toBeVisible()
})

test('shows seven editorial roles and no Editor-in-Chief', async ({ page }) => {
  await page.goto('/team')
  await expect(page.getByText('Managing Editor')).toBeVisible()
  await expect(page.getByText('Copyeditor')).toBeVisible()
  await expect(page.getByText('Editor-in-Chief')).toHaveCount(0)
})

test('distinguishes pending from recruiting', async ({ page }) => {
  await page.goto('/team')
  await expect(page.getByText('Appointment pending')).toHaveCSS('color', 'rgb(138, 123, 92)')
  await expect(page.getByText('Recruiting').first()).toHaveCSS('color', 'rgb(93, 29, 33)')
})

test('nav and page both say Our Team, never Editorial Board', async ({ page }) => {
  await page.goto('/team')
  const body = (await page.locator('body').textContent()) ?? ''
  expect(body).not.toContain('Editorial Board')
})
```

---

### Task 14: Submit

**Files:** `src/app/(site)/submit/page.tsx`; `src/components/site/submit/Requirements.tsx`, `Checklist.tsx`, `SubmissionForm.tsx` (client island), `WhatHappensNext.tsx`. Test: `tests/e2e/submit.spec.ts`.
**Prototype:** lines 538-607.
**Data:** `getConfig()`, `getDisciplines()`, `getRequirements()`, `getChecklist()`, `getProcessSteps()`.

Head plus a deadline note, then a `1fr / 330px` grid.

- **Eligibility** paragraph.
- **Manuscript requirements** — six key/value rows from `getRequirements()` with a `170px` label column.
- **Before you submit** — the five checklist lines from `getChecklist()`, each with a gold `✓`. (The spec's §"Submit" says four lines; the prototype has five at lines 851-857. The HTML wins.)
- **SubmissionForm** — a `bg-cream` panel with `id="form"`. Fields: corresponding author, email, institution, a section `<select>` from `getDisciplines()`, title, a 5-row abstract textarea, a dashed gold file drop zone reading "PDF or DOCX · max 20 MB · no author names in the file", an originality checkbox, and a `btn-maroon` submit button. All inputs use the `field` class.

In this plan the form calls the toast with "Submission portal opens with the call for papers. Email icrrjournal@gmail.com in the meantime." Mark the handler `// TODO(plan-3): replace with the real server action`.

Sidebar: **What happens next** (the four steps from `getProcessSteps()`), **Templates** (toasts), **Questions** (the contact address and a five-working-day reply note).

**Test:**

```ts
import { expect, test } from '@playwright/test'

test('lists all six manuscript requirements', async ({ page }) => {
  await page.goto('/submit')
  for (const key of ['Length', 'File format', 'Anonymisation', 'Abstract', 'References', 'Figures']) {
    await expect(page.getByText(key, { exact: true })).toBeVisible()
  }
})

test('section select offers the five disciplines', async ({ page }) => {
  await page.goto('/submit')
  const options = page.getByRole('combobox').locator('option')
  await expect(options).toHaveCount(6) // placeholder plus five
})

test('submitting shows the interim toast', async ({ page }) => {
  await page.goto('/submit')
  await page.getByRole('button', { name: /submit/i }).last().click()
  await expect(page.getByRole('status')).toContainText('Submission portal opens with the call for papers')
})

test('form is reachable by the #form anchor', async ({ page }) => {
  await page.goto('/submit#form')
  await expect(page.locator('#form')).toBeVisible()
})
```

---

### Task 15: Announcements

**Files:** `src/app/(site)/news/page.tsx`; `src/components/site/news/NewsArticle.tsx`, `StayInformed.tsx` (client island). Test: `tests/e2e/news.spec.ts`.
**Prototype:** lines 608-635.
**Data:** `getAnnouncements()`, `getConfig()`.

Three articles from `getAnnouncements()`, divided by `1px solid #E2DACB`. Each: the date plus a gold tag eyebrow, an h2 at `clamp(21px,3vw,26px)`, the body, and a CTA link using `ctaLabel` and `ctaHref` with `border-bottom: 1px solid #C0A265`.

Sidebar: **Stay informed** email capture with the note "one message a month at most". Submitting toasts "Thanks. You will receive our calls for papers and issue announcements." Mark `// TODO(plan-3)`.

**Test:**

```ts
import { expect, test } from '@playwright/test'

test('renders the three announcements newest first', async ({ page }) => {
  await page.goto('/news')
  const headings = page.getByRole('heading', { level: 2 })
  await expect(headings.first()).toHaveText('Call for Papers: Volume 1, Issue 1')
  await expect(headings).toHaveCount(4) // three articles plus the sidebar heading
})

test('CTAs route to the right pages', async ({ page }) => {
  await page.goto('/news')
  await page.getByRole('link', { name: 'Meet the team' }).click()
  await expect(page).toHaveURL(/\/team$/)
})

test('newsletter signup shows the confirmation toast', async ({ page }) => {
  await page.goto('/news')
  await page.getByRole('textbox', { name: /email/i }).fill('reader@example.com')
  await page.getByRole('button', { name: /subscribe|sign up/i }).click()
  await expect(page.getByRole('status')).toContainText('Thanks. You will receive our calls for papers')
})
```

---

### Task 16: Article reading page

**Files:** `src/app/(site)/articles/[slug]/page.tsx`; `src/components/site/article/ArticleHeader.tsx`, `AbstractBlock.tsx`, `ArticleBody.tsx`, `ArticleInfo.tsx`, `OnThisPage.tsx`. Test: `tests/e2e/article.spec.ts`.
**Prototype:** lines 636-702.
**Data:** `getArticleBySlug(slug)`, `getConfig()`.

Call `notFound()` for an unknown slug. Add `generateStaticParams` from `getArticles()`.

A design-preview banner when `config.showPreviewNotes`, then the reading column at `max-width: 74ch`.

Header: the section and type eyebrows, the title at `clamp(24px,4.6vw,38px)`/1.28, the authors with superscript affiliation markers from `article.authors`, the affiliation lines, then Download PDF / Cite / Share under a `1px solid #E2DACB` rule. All three toast.

**Abstract block:** `bg-cream` with `border-left: 3px solid #5D1D21`, a Lato "ABSTRACT" eyebrow, the abstract in `font-serif text-[15.5px] leading-[1.85]`, and a keywords line.

**Body:** numbered h2s in `text-maroon text-[22px] font-bold` — 1. Introduction, 2. Method, 3. Results, 4. Discussion. Serif body at `16px`/1.9. Paragraphs separated by space, **never** by indentation. A `300px` figure `<ImageSlot>` with a Lato caption whose "Figure 1." is bold. Then References as an ordered list.

In this plan the body is static placeholder prose held in the component, clearly marked as such. Plan 2 replaces it with the TipTap renderer reading `article.body`.

Sidebar: **Article information** (Received, Accepted, Published all rendering "TBA" when the date is null; Licence CC BY 4.0) and an **On this page** contents list linking to the four body headings.

**Test:**

```ts
import { expect, test } from '@playwright/test'

const SLUG = '/articles/canopy-cover-and-summer-surface-temperature'

test('renders the article header and abstract', async ({ page }) => {
  await page.goto(SLUG)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Canopy cover')
  await expect(page.getByText('Abstract', { exact: true })).toBeVisible()
  await expect(page.getByText('Amara Okonkwo')).toBeVisible()
})

test('renders the four numbered body sections', async ({ page }) => {
  await page.goto(SLUG)
  for (const heading of ['1. Introduction', '2. Method', '3. Results', '4. Discussion']) {
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }
})

test('unpublished dates read TBA', async ({ page }) => {
  await page.goto(SLUG)
  await expect(page.getByText('TBA').first()).toBeVisible()
})

test('paragraphs are separated by space, not indentation', async ({ page }) => {
  await page.goto(SLUG)
  const indent = await page.locator('article p').first().evaluate((el) => getComputedStyle(el).textIndent)
  expect(indent).toBe('0px')
})

test('returns 404 for an unknown article', async ({ page }) => {
  const response = await page.goto('/articles/nope')
  expect(response?.status()).toBe(404)
})
```

---

## Task 17: Design audit

Catches drift that individual view tests cannot: a stray hex, a rounded corner, a second shadow, an em dash.

**Files:**
- Create: `tests/unit/design-audit.test.ts`
- Create: `tests/e2e/design-audit.spec.ts`

**Interfaces:**
- Consumes: every source file under `src/`.
- Produces: nothing importable.

- [ ] **Step 1: Write the source audit**

Create `tests/unit/design-audit.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const FILES = globSync('src/**/*.{ts,tsx,css}')
const read = (file: string) => readFileSync(file, 'utf8')

const ALLOWED_HEX = new Set([
  '#5D1D21', '#7C2A2F', '#3F1417', '#C0A265', '#8A7B5C', '#F7F4EF', '#FBF7EE',
  '#FDFBF7', '#241F1E', '#3F3733', '#5A524A', '#6E655C', '#E2DACB', '#EFE9DF',
  '#D2B67E',
])

describe('design audit', () => {
  it('uses no hex colour outside the palette', () => {
    const offenders: string[] = []
    for (const file of FILES) {
      for (const hex of read(file).match(/#[0-9a-fA-F]{6}\b/g) ?? []) {
        if (!ALLOWED_HEX.has(hex.toUpperCase())) offenders.push(`${file}: ${hex}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('declares no border radius', () => {
    const offenders = FILES.filter((file) => /rounded(-|\b)|border-radius:\s*(?!0)/.test(read(file)))
    expect(offenders).toEqual([])
  })

  it('declares exactly one box shadow across the codebase', () => {
    const found = FILES.flatMap((file) => (read(file).match(/box-?[Ss]hadow/g) ?? []).map(() => file))
    expect(found).toEqual(['src/components/chrome/ToastProvider.tsx'])
  })

  it('contains no em dash in any source file', () => {
    const offenders = FILES.filter((file) => read(file).includes('\u2014'))
    expect(offenders).toEqual([])
  })

  it('never says Editorial Board', () => {
    const offenders = FILES.filter((file) => read(file).includes('Editorial Board'))
    expect(offenders).toEqual([])
  })
})
```

If `globSync` is unavailable on the installed Node version, replace it with `fast-glob`: `npm install -D fast-glob` and `import fg from 'fast-glob'; const FILES = fg.sync('src/**/*.{ts,tsx,css}')`.

- [ ] **Step 2: Run it and fix every offender**

Run: `npm test -- tests/unit/design-audit.test.ts`
Expected: initially FAIL with a list of offending files. Fix each by replacing the literal with the matching token. Re-run until PASS.

- [ ] **Step 3: Write the rendered audit**

Create `tests/e2e/design-audit.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const ROUTES = [
  '/', '/about', '/issue/current', '/archives', '/authors',
  '/authors/priya-nair', '/team', '/submit', '/news',
  '/articles/canopy-cover-and-summer-surface-temperature',
]

for (const route of ROUTES) {
  test(`${route} renders with square corners only`, async ({ page }) => {
    await page.goto(route)
    const rounded = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*')).filter((el) => {
        const radius = getComputedStyle(el).borderRadius
        return radius !== '0px' && radius !== '' && !radius.startsWith('0')
      }).length,
    )
    expect(rounded).toBe(0)
  })

  test(`${route} never scrolls horizontally at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(route)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })

  test(`${route} has exactly one h1`, async ({ page }) => {
    await page.goto(route)
    await expect(page.locator('h1')).toHaveCount(1)
  })
}
```

- [ ] **Step 4: Run the rendered audit and fix every failure**

Run: `npm run test:e2e -- tests/e2e/design-audit.spec.ts`
Expected: PASS on all 30 cases after fixes.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add design audit for palette, corners, shadows, and copy rules"
```

---

## Task 18: Netlify deploy

**Files:**
- Create: `netlify.toml`
- Create: `.env.example`
- Modify: `README.md` (a new project README, distinct from the handoff's, which now lives at `design-reference/README.md`)

**Interfaces:**
- Consumes: nothing.
- Produces: a deploy preview URL on every push to `rebuild`.

- [ ] **Step 1: Write netlify.toml**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "22"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

- [ ] **Step 2: Write .env.example**

```
# Populated in plan 2. Nothing in plan 1 requires these.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 3: Write the project README**

Create `README.md` at the repo root covering: what the project is, `npm install` / `npm run dev` / `npm test` / `npm run test:e2e`, the branch policy (`rebuild` until launch), where the design source of truth lives (`design-reference/`), and a pointer to the spec and plans under `docs/superpowers/`.

- [ ] **Step 4: Verify the production build**

Run: `npm run build && npm start`
Expected: build succeeds; every route renders at `http://localhost:3000`.

- [ ] **Step 5: Run the full test suite**

Run: `npm test && npm run test:e2e`
Expected: all unit and e2e specs pass.

- [ ] **Step 6: Push and confirm the Netlify preview**

```bash
git add -A
git commit -m "chore: add Netlify config and project README"
git push -u origin rebuild
```

Then connect the Netlify site to the `rebuild` branch and confirm the deploy preview builds. **Do not merge to `main`** until the client has reviewed the preview.

---

## Self-Review

**Spec coverage.** Spec §4 tokens → task 1. §5 data model → task 2 (as domain types; tables land in plan 2). §6 security → plan 2, correctly out of scope here. §7 routes → tasks 7 to 16, all ten. §8 chrome → task 6. §9 behavior → tasks 3, 4, 6, 11. §10 admin → plan 2. §11 submissions → plan 3, with the interim toasts and `TODO` markers placed in tasks 14 and 15. §12 images → `ImageSlot` in task 5, used by every view that needs it. §13 copy rules → enforced by tests in tasks 2 and 17. §14 phases 1 to 5 and the public half of 8 → tasks 1 to 18. §15 out of scope → untouched. §16 open items → no plan-1 task depends on any of them.

**Gap found and closed.** The spec's §"Submit" describes four checklist lines; the prototype has five. Task 14 names the conflict and applies the HTML-wins rule.

**Type consistency.** `AuthorCard` is produced in task 3 and consumed in task 11. `publicationLabel` and `countLabel` keep those names throughout. `isNavItemActive` and `pageTitleFor` are defined in task 6 step 1 and used in `Nav` and `Drawer`. `armReveal` returns a disconnect function in task 4 and is used that way in `RevealArmer`. `ImageSlot` takes `src, label, ratio, priority, className` in task 5 and is called with exactly those props in tasks 7, 9, 11, 13, and 16. Accessor names in task 2 match every call site in tasks 7 to 16.

**Placeholder scan.** The only `TODO` markers are the two deliberate `// TODO(plan-3)` handoff markers in tasks 14 and 15, which the plan names explicitly as the grep target for plan 3.
