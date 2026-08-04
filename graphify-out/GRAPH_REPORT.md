# Graph Report - design_handoff_icrr_journal  (2026-08-04)

## Corpus Check
- 200 files · ~140,383 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1120 nodes · 2427 edges · 77 communities (58 shown, 19 thin omitted)
- Extraction: 97% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84ac2b64`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin Server Actions|Admin Server Actions]]
- [[_COMMUNITY_Forms and Toast System|Forms and Toast System]]
- [[_COMMUNITY_Prototype DCLogic Runtime|Prototype DCLogic Runtime]]
- [[_COMMUNITY_Site Chrome and Shell|Site Chrome and Shell]]
- [[_COMMUNITY_NPM Dependency Manifest|NPM Dependency Manifest]]
- [[_COMMUNITY_Static Public Pages|Static Public Pages]]
- [[_COMMUNITY_Prototype ImageSlot Element|Prototype ImageSlot Element]]
- [[_COMMUNITY_Journal Process Content|Journal Process Content]]
- [[_COMMUNITY_Supabase Content Sources|Supabase Content Sources]]
- [[_COMMUNITY_Root Layout and Metadata|Root Layout and Metadata]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_Zod Content Schemas|Zod Content Schemas]]
- [[_COMMUNITY_Homepage Sections|Homepage Sections]]
- [[_COMMUNITY_Authors Browsing and Sitemap|Authors Browsing and Sitemap]]
- [[_COMMUNITY_Content Accessor Layer|Content Accessor Layer]]
- [[_COMMUNITY_Seed Data and Script|Seed Data and Script]]
- [[_COMMUNITY_Archives, Issue, Article Views|Archives, Issue, Article Views]]
- [[_COMMUNITY_Prototype to Code Mapping|Prototype to Code Mapping]]
- [[_COMMUNITY_Global Chrome Design Notes|Global Chrome Design Notes]]
- [[_COMMUNITY_Brand Lockup Source Assets|Brand Lockup Source Assets]]
- [[_COMMUNITY_Public Brand Assets|Public Brand Assets]]
- [[_COMMUNITY_Author Profile and TOC|Author Profile and TOC]]
- [[_COMMUNITY_Architecture Decisions|Architecture Decisions]]
- [[_COMMUNITY_Copy and Visual Constraints|Copy and Visual Constraints]]
- [[_COMMUNITY_Design Tokens and Motion|Design Tokens and Motion]]
- [[_COMMUNITY_App Router Icons|App Router Icons]]
- [[_COMMUNITY_Scroll Reveal Behavior|Scroll Reveal Behavior]]
- [[_COMMUNITY_Manuscript Upload Flow|Manuscript Upload Flow]]
- [[_COMMUNITY_Deployment and Security Model|Deployment and Security Model]]
- [[_COMMUNITY_Route Map and UI Primitives|Route Map and UI Primitives]]
- [[_COMMUNITY_Admin Panel Design Notes|Admin Panel Design Notes]]
- [[_COMMUNITY_Design Audit Unit Test|Design Audit Unit Test]]
- [[_COMMUNITY_Admin Route Middleware|Admin Route Middleware]]
- [[_COMMUNITY_Button Primitive|Button Primitive]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Editorial Roles Seed|Editorial Roles Seed]]
- [[_COMMUNITY_Site Config Seed|Site Config Seed]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Admin E2E Test|Admin E2E Test]]
- [[_COMMUNITY_Design Audit E2E Test|Design Audit E2E Test]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]

## God Nodes (most connected - your core abstractions)
1. `createSupabaseServiceClient()` - 63 edges
2. `requireCapability()` - 45 edges
3. `adminPath()` - 40 edges
4. `requireAdmin()` - 35 edges
5. `getConfig` - 29 edges
6. `ImageSlot` - 27 edges
7. `isSupabaseConfigured()` - 20 edges
8. `ICRR Journal Public Site Implementation Plan` - 19 edges
9. `PageHead()` - 18 edges
10. `ICRR Journal Website — Design Spec` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Continuous Announcement Ticker` --semantically_similar_to--> `Announcement Rotator (6000ms cycle)`  [INFERRED] [semantically similar]
  design-reference/README.md → docs/superpowers/specs/2026-07-26-icrr-journal-website-design.md
- `Author Filter and Search (src/lib/authors/filter.ts)` --semantically_similar_to--> `Authors Filter and Search`  [INFERRED] [semantically similar]
  docs/superpowers/plans/2026-07-26-icrr-public-site.md → design-reference/README.md
- `fromDb()` --calls--> `read()`  [INFERRED]
  src/lib/content/index.ts → tests/unit/design-audit.test.ts
- `Seed Data (src/lib/content/seed/*)` --shares_data_with--> `ANNOUNCEMENTS (three ticker strings)`  [EXTRACTED]
  docs/superpowers/plans/2026-07-26-icrr-public-site.md → design-reference/ICRR Journal.dc.html
- `Routing` --conceptually_related_to--> `Public Routes and Their Data`  [INFERRED]
  design-reference/README.md → docs/superpowers/specs/2026-07-26-icrr-journal-website-design.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Global Chrome Shell (top strip to toast, every view)** — design_reference_readme_top_strip, design_reference_readme_masthead, design_reference_readme_nav, design_reference_readme_mobile_drawer, design_reference_readme_footer, design_reference_readme_toast, plans_2026_07_26_icrr_public_site_chrome_task [EXTRACTED 1.00]
- **Editorial Copy Constraint System (no em dashes, no promised feedback, no named review model)** — readme_copy_rules, design_reference_readme_copy_rules, specs_2026_07_26_icrr_journal_website_design_copy_rules, design_reference_readme_review_policy_copy, design_reference_readme_our_team_rename, plans_2026_07_26_icrr_public_site_design_audit [EXTRACTED 1.00]
- **Swappable Content Pipeline (Zod schema to seed to accessors to prerendered pages)** — plans_2026_07_26_icrr_public_site_domain_schema, plans_2026_07_26_icrr_public_site_seed_data, plans_2026_07_26_icrr_public_site_content_accessors, readme_content_layer, readme_prerendering, readme_cookieless_anon_client, plans_2026_07_26_icrr_public_site_deviation_spec_14 [INFERRED 0.95]
- **ICRR Brand Identity Asset Set (mark + two lockups on one palette)** — assets_icrr_mark, assets_icrr_lockup_full_name_transparent, assets_icrr_lockup_stacked_transparent, assets_icrr_mark_oxblood_bone_palette, assets_icrr_mark_lockup_variant_system [INFERRED 0.95]
- **Lockup Composition Grammar: monogram + hairline rule + letterspaced wordmark** — assets_icrr_mark_quadrant_monogram, assets_icrr_lockup_full_name_transparent_vertical_rule, assets_icrr_lockup_stacked_transparent_horizontal_rule, assets_icrr_lockup_full_name_transparent_wordmark, assets_icrr_lockup_stacked_transparent_centered_axis [INFERRED 0.85]
- **ICRR Brand Lockup Asset Family (all four PNG variants of one identity)** — brand_lockup_full, brand_lockup_stacked, brand_lockup_stacked_white, brand_mark [EXTRACTED 1.00]
- **ICRR Visual Identity System (mark + wordmark + palette + type + rule)** — brand_mark_quadrant_checkerboard, brand_lockup_full_wordmark, brand_mark_maroon_cream_palette, brand_lockup_full_serif_letterspaced_type, brand_lockup_full_divider_rule [INFERRED 0.85]
- **Context-Adaptive Logo Usage (orientation and background coverage)** — brand_lockup_full_responsive_lockup_set, brand_lockup_stacked_white_reversed_treatment, brand_lockup_full, brand_lockup_stacked, brand_mark [INFERRED 0.75]
- **ICRR Brand Mark Visual System** — app_icon_icrr_monogram_mark, app_icon_checkerboard_inversion, app_icon_maroon_cream_palette, app_icon_serif_academic_wordmark [INFERRED 0.85]
- **Next.js App Router Icon Asset Set** — app_icon, app_apple_icon, app_icon_nextjs_file_convention_metadata [INFERRED 0.95]

## Communities (77 total, 19 thin omitted)

### Community 0 - "Admin Server Actions"
Cohesion: 0.21
Nodes (15): matchesQuery(), matchesStatus(), param(), InboxRow(), ListToolbar(), StatusOption, EditorApplicationsPage(), MessagesPage() (+7 more)

### Community 1 - "Forms and Toast System"
Cohesion: 0.05
Nodes (81): Field, ToastContext, useToast(), ConfirmPage(), metadata, OUTCOMES, ContactForm(), ERROR_LABELS (+73 more)

### Community 2 - "Prototype DCLogic Runtime"
Cohesion: 0.06
Nodes (49): boot(), cdnScriptFor(), collectProps(), compileAttr(), compileTemplate(), contentKey(), createComponentFactory(), createExternalModules() (+41 more)

### Community 3 - "Site Chrome and Shell"
Cohesion: 0.07
Nodes (23): Drawer(), COLUMNS, CREAM_78, Footer(), Masthead(), Nav(), RevealArmer(), SiteChrome() (+15 more)

### Community 4 - "NPM Dependency Manifest"
Cohesion: 0.05
Nodes (40): dependencies, next, react, react-dom, resend, server-only, @supabase/ssr, @supabase/supabase-js (+32 more)

### Community 5 - "Static Public Pages"
Cohesion: 0.11
Nodes (24): ContactPage(), metadata, getConfig, EthicsPage(), metadata, pageMetadata(), PolicyBody(), PolicyList() (+16 more)

### Community 6 - "Prototype ImageSlot Element"
Cohesion: 0.12
Nodes (7): flushNow(), getSlot(), ImageSlot, load(), save(), setSlot(), toDataUrl()

### Community 7 - "Journal Process Content"
Cohesion: 0.12
Nodes (17): Fact, ProcessStep, Requirement, TimelineEntry, TocPreviewEntry, checklist, facts, processSteps (+9 more)

### Community 8 - "Supabase Content Sources"
Cohesion: 0.08
Nodes (24): ArticleAuthor, ArticleRow, AuthorRow, DisciplineRow, getAnnouncements, getArticleBySlug, getArticles, getArticlesByAuthor (+16 more)

### Community 9 - "Root Layout and Metadata"
Cohesion: 0.27
Nodes (13): sitemap(), STATIC_ROUTES, AuthorsBrowser(), AuthorCard, buildAuthorCards(), countLabel(), filterAuthors(), publicationLabel() (+5 more)

### Community 10 - "TypeScript Compiler Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 11 - "Zod Content Schemas"
Cohesion: 0.11
Nodes (17): announcementSchema, articleAuthorSchema, articleSchema, articleStatusSchema, authorSchema, disciplineSchema, editorialRoleSchema, factSchema (+9 more)

### Community 13 - "Authors Browsing and Sitemap"
Cohesion: 0.18
Nodes (18): SendableAnnouncement, SendAnnouncementForm(), sendAnnouncement(), windows(), bodyFor(), checkQuota(), chunk(), FREE_TIER (+10 more)

### Community 14 - "Content Accessor Layer"
Cohesion: 0.15
Nodes (23): activeAdministrators(), invitePerson(), InviteResult, isRole(), listStaff(), savePermissions(), setPersonActive(), setPersonRole() (+15 more)

### Community 15 - "Seed Data and Script"
Cohesion: 0.15
Nodes (11): Article, EditorialRole, SiteConfig, TickerLine, check(), main(), supabase, articles (+3 more)

### Community 16 - "Archives, Issue, Article Views"
Cohesion: 0.31
Nodes (6): ArchivesPage(), metadata, ArticleBody(), SECTIONS, getIssues, ImageSlot()

### Community 17 - "Prototype to Code Mapping"
Cohesion: 0.16
Nodes (18): AUTHORS (six placeholder profiles), DISCIPLINES (five sections), matches (author search predicate), nav(page), NEWS (three announcement articles), PAGES / PAGE_TITLES, renderVals, TEAM / ROLES (+10 more)

### Community 18 - "Global Chrome Design Notes"
Cohesion: 0.24
Nodes (11): closeMenu, toggleMenu, Assets, Footer Brand Block, Global Chrome (every view), Masthead Lockup Sizing, Mobile Drawer, Sticky Nav, Two Variants at 860px (+3 more)

### Community 19 - "Brand Lockup Source Assets"
Cohesion: 0.33
Nodes (13): ICRR Horizontal Lockup (Full Name, Transparent), Charcoal Wordmark Ink (Off-Brand-Color Text), Vertical Hairline Divider, Letterspaced All-Caps Serif Wordmark, ICRR Stacked Lockup (Transparent), Centered Vertical Composition Axis, Horizontal Hairline Divider, ICRR Mark (2x2 Quadrant Monogram) (+5 more)

### Community 20 - "Public Brand Assets"
Cohesion: 0.38
Nodes (12): ICRR Horizontal Lockup (lockup-full.png), Divider Rule Separating Mark from Wordmark, Orientation-Variant Lockup Set (Horizontal / Stacked / Mark-Only), Letterspaced Serif Small-Caps Typography, Wordmark: INTERNATIONAL COLLEGIATE RESEARCH REVIEW, ICRR Stacked Lockup (lockup-stacked.png), ICRR Stacked Lockup, Reversed/White (lockup-stacked-white.png), Reversed (On-Dark) Logo Treatment (+4 more)

### Community 21 - "Author Profile and TOC"
Cohesion: 0.29
Nodes (7): note(msg), One Shadow in the Whole Design, Placeholder Toast Actions, Toast, tests/unit/tokens.test.ts, Storage buckets, Submissions and Email Flow

### Community 22 - "Architecture Decisions"
Cohesion: 0.21
Nodes (9): JournalAtAGlance(), AboutPage(), metadata, SECTIONS, getFacts, ProcessSteps(), getFacts(), EDITORIAL_COPY (+1 more)

### Community 23 - "Copy and Visual Constraints"
Cohesion: 0.33
Nodes (6): STEPS / TIMELINE / TOC_PREVIEW / FACTS / REQS / CHECKLIST, Copy rules, Pre-Launch Honesty in Copy, About Page Review-Policy Copy Constraint, Spec Copy Rules (two), Out of Scope

### Community 24 - "Design Tokens and Motion"
Cohesion: 0.43
Nodes (6): Colors, Design Tokens, Rules and dividers, Spacing & layout, Typography, globals.css Tokens, Reset, Keyframes, Component Classes

### Community 25 - "App Router Icons"
Cohesion: 0.12
Nodes (22): fromDb(), getAnnouncements, getChecklist, getDisciplines, getProcessSteps, getRequirements, getTickerLines, useDb() (+14 more)

### Community 26 - "Scroll Reveal Behavior"
Cohesion: 0.29
Nodes (7): 1. Top strip, 2. Masthead, 3. Nav — sticky, two variants at 860px, 4. Mobile drawer, 5. Footer, 6. Toast, Global chrome (every view)

### Community 27 - "Manuscript Upload Flow"
Cohesion: 0.08
Nodes (24): 10. Admin panel, 11. Submissions and email, 12. Images, 13. Copy rules, 14. Build phases, 15. Out of scope, 16. Open items, 1. What we are building (+16 more)

### Community 28 - "Deployment and Security Model"
Cohesion: 0.05
Nodes (45): Component (DCLogic subclass), Do Not Port the Prototype Runtime, ICRR Journal Design Handoff, No Border Radius Anywhere, Three Rule Treatments, State Management, Deviation from spec §14, File Structure (+37 more)

### Community 29 - "Route Map and UI Primitives"
Cohesion: 0.17
Nodes (10): FieldType, INBOX_STATUSES, InboxKey, PUBLISHED, SITE_CONFIG_FIELDS, SORT_ORDER, WRITABLE_TABLES, InboxItem (+2 more)

### Community 31 - "Design Audit Unit Test"
Cohesion: 0.09
Nodes (24): lato, libreBaskerville, metadata, size, robots(), getArticleBySlug, getArticlesByAuthor, getAuthorBySlug (+16 more)

### Community 34 - "Community 34"
Cohesion: 0.20
Nodes (9): Appointed Editorial Roles Implementation Plan, Global Constraints, Manual verification, Out of scope, Task 1: Data model — migration, schema, sources, seed, Task 2: The display helper, Task 3: Render the holder on the team page, Task 4: Appoint someone from the admin panel (+1 more)

### Community 36 - "Site Config Seed"
Cohesion: 0.20
Nodes (9): getEditorialRoles, getTeam, editorialRoleStatusSchema, roleStatusDisplay(), STATUS_COLOUR, getEditorialRoles, getTeam, metadata (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.09
Nodes (21): 1. The problem, 2. What we are building, 3. Data model, 4. The panel, 5. The content layer, 6. Empty tables, 7. Tests, 8. Build order (+13 more)

### Community 41 - "Next.js Config"
Cohesion: 0.50
Nodes (3): csp, nextConfig, SECURITY_HEADERS

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (11): About, Announcements, Archives, Article (template), Author profile, Authors, Current Issue, Home (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.25
Nodes (7): formatBytes(), Template, TemplateDownload, TemplateId, TEMPLATES, TemplatesDialog(), publicDir

### Community 56 - "Community 56"
Cohesion: 0.15
Nodes (21): ENTITIES, INBOX_TABLES, AdminDashboard(), counts(), Area, AREA_BY_ENTITY, AREA_BY_INBOX, AREA_LABELS (+13 more)

### Community 57 - "Community 57"
Cohesion: 0.12
Nodes (34): assertWritable(), coerce(), deleteAsset(), deleteRecord(), DOC_TYPES, IMAGE_TYPES, INBOX_STATUSES, moveRecord() (+26 more)

### Community 58 - "Community 58"
Cohesion: 0.12
Nodes (16): 1. The problem, 2. What we are building, 3. Data model, 4. Public page — `src/app/(site)/team/page.tsx`, 5. Admin — `src/lib/admin/entities.ts`, 6. Application guards — no change, 7. Tests, 8. Files touched (+8 more)

### Community 60 - "Community 60"
Cohesion: 0.16
Nodes (15): signOut(), AdminNav(), NavGroup, NavLink, AdminLayout(), EDITORIAL_COPY, inboxCounts(), metadata (+7 more)

### Community 62 - "Community 62"
Cohesion: 0.40
Nodes (5): ALLOWED_HEX, FILES, read(), readCopy(), ROUND_BY_DESIGN

### Community 63 - "Community 63"
Cohesion: 0.12
Nodes (15): assetUrl(), fillPattern(), nextStatusLabel(), reorder(), slugify(), standardLabel(), Entity, AssetInput() (+7 more)

### Community 69 - "Community 69"
Cohesion: 0.23
Nodes (8): getCurrentIssue, getTimeline, CurrentIssuePage(), metadata, ProductionTimeline(), TocPreview(), getTimeline(), getTocPreview()

### Community 71 - "Community 71"
Cohesion: 0.20
Nodes (9): About the Design Files, Fidelity, Files, Handoff: ICRR Journal Website, Overview, Routing, UI Primitives (Container, Eyebrow, PageHead, Button, Panel, Callout, ImageSlot), Tasks 7 to 16: The Ten Views (+1 more)

### Community 73 - "Community 73"
Cohesion: 0.16
Nodes (14): ANNOUNCEMENTS (three ticker strings), componentDidMount, componentDidUpdate, componentWillUnmount, _reveal, Animations, Continuous Announcement Ticker, Hover states (+6 more)

### Community 76 - "Community 76"
Cohesion: 0.15
Nodes (13): 5. Data model, `announcements`, `article_authors`, `articles`, `authors`, `disciplines`, `editorial_roles`, `issues` (+5 more)

## Ambiguous Edges - Review These
- `Copy rules` → `STEPS / TIMELINE / TOC_PREVIEW / FACTS / REQS / CHECKLIST`  [AMBIGUOUS]
  design-reference/ICRR Journal.dc.html · relation: conceptually_related_to
- `Brand Guidelines (ICRR).pdf` → `globals.css Tokens, Reset, Keyframes, Component Classes`  [AMBIGUOUS]
  design-reference/assets/Brand Guidelines (ICRR).pdf · relation: conceptually_related_to
- `Diagonal Reversed-Contrast Tile Pairing` → `Transparent-Background Asset Convention`  [AMBIGUOUS]
  design-reference/assets/icrr_mark.png · relation: conceptually_related_to

## Knowledge Gaps
- **341 isolated node(s):** `eslintConfig`, `csp`, `SECURITY_HEADERS`, `nextConfig`, `name` (+336 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Copy rules` and `STEPS / TIMELINE / TOC_PREVIEW / FACTS / REQS / CHECKLIST`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Brand Guidelines (ICRR).pdf` and `globals.css Tokens, Reset, Keyframes, Component Classes`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Diagonal Reversed-Contrast Tile Pairing` and `Transparent-Background Asset Convention`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `createSupabaseServiceClient()` connect `Community 57` to `Admin Server Actions`, `Forms and Toast System`, `Authors Browsing and Sitemap`, `Content Accessor Layer`, `Community 56`, `Community 60`, `Route Map and UI Primitives`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `isSupabaseConfigured()` connect `Forms and Toast System` to `Admin Server Actions`, `App Router Icons`, `Authors Browsing and Sitemap`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `FormResult` connect `Forms and Toast System` to `Authors Browsing and Sitemap`, `Content Accessor Layer`, `Community 57`, `Route Map and UI Primitives`, `Community 63`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `csp`, `SECURITY_HEADERS` to the rest of the system?**
  _346 weakly-connected nodes found - possible documentation gaps or missing edges._