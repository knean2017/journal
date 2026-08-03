/**
 * Who may see and change what, as data rather than as scattered checks.
 *
 * Everything here is pure and free of React, Next, and the database, so the
 * rules can be unit tested directly and the same answer is used by the
 * navigation, the pages, and the server actions.
 *
 * This matters more than it looks. Every admin write goes through the
 * service-role client, which bypasses row level security completely, so the
 * database will not refuse a write on anybody's behalf. These functions are the
 * whole control.
 */

export const STAFF_ROLES = [
  'administrator',
  'editor',
  'content_manager',
  'reviewer',
  'observer',
] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export const ACCESS_LEVELS = ['none', 'view', 'edit'] as const
export type AccessLevel = (typeof ACCESS_LEVELS)[number]

/**
 * The surfaces access is granted over.
 *
 * Grouped by what a person is doing rather than by table, because that is how
 * the panel is laid out and how an editor thinks about it. The eight content
 * entities collapse into three areas: the journal record, the outreach copy,
 * and the pages about the people running it.
 */
export const AREAS = [
  'dashboard',
  'submissions',
  'applications',
  'messages',
  'content.journal',
  'content.outreach',
  'content.people',
  'media',
  'settings',
  'people',
] as const

export type Area = (typeof AREAS)[number]

export type PermissionMatrix = Record<StaffRole, Record<Area, AccessLevel>>

/**
 * Where each area lives under the admin path, for the navigation and for
 * deciding where to land somebody who has no dashboard.
 *
 * The three content areas cover several pages each and point at the first of
 * them, which is only a landing place; the navigation still lists them all.
 */
export const AREA_PATHS: Record<Area, string> = {
  dashboard: '',
  submissions: 'submissions',
  applications: 'reviewers',
  messages: 'messages',
  'content.journal': 'issues',
  'content.outreach': 'announcements',
  'content.people': 'team',
  media: 'media',
  settings: 'config',
  people: 'people',
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  administrator: 'Administrator',
  editor: 'Editor',
  content_manager: 'Content manager',
  reviewer: 'Reviewer',
  observer: 'Observer',
}

export const ROLE_HELP: Record<StaffRole, string> = {
  administrator: 'Everything, including who else gets in. Cannot be reduced.',
  editor: 'Runs the journal: submissions, applications, and everything published.',
  content_manager: 'Announcements, the ticker, media, and the pages about the team.',
  reviewer: 'Reads manuscripts and moves them along. Sees nothing else.',
  observer: 'Can read the whole panel and change none of it.',
}

export const AREA_LABELS: Record<Area, { label: string; help: string }> = {
  dashboard: { label: 'Dashboard', help: 'The overview page and its counts.' },
  submissions: { label: 'Submissions', help: 'Manuscripts sent in by authors, and their files.' },
  applications: {
    label: 'Applications',
    help: 'People applying to review or to hold an editorial role.',
  },
  messages: { label: 'Messages', help: 'Anything sent through the contact form.' },
  'content.journal': {
    label: 'Journal content',
    help: 'Issues, articles, authors, and sections.',
  },
  'content.outreach': {
    label: 'News and ticker',
    help: 'Announcements and the lines that scroll on the home page.',
  },
  'content.people': {
    label: 'Team and roles',
    help: 'The core team and the editorial roles on the team page.',
  },
  media: { label: 'Media', help: 'Uploaded images and files.' },
  settings: { label: 'Site settings', help: 'Deadlines, contact address, ISSN status.' },
  people: {
    label: 'People and permissions',
    help: 'Who can get into this panel, and this grid itself.',
  },
}

/**
 * Where each thing the panel manages is gated.
 *
 * `saveRecord`, `moveRecord` and `deleteRecord` are generic over the entity
 * slug, so this one map gates all eight content types at once. An entity that
 * is missing here has no area, and the gate refuses it rather than waving it
 * through: a new entity added to ENTITIES without a line here is locked, not
 * open. `tests/unit/permissions.test.ts` fails in that case.
 */
const AREA_BY_ENTITY: Record<string, Area> = {
  issues: 'content.journal',
  articles: 'content.journal',
  authors: 'content.journal',
  disciplines: 'content.journal',
  announcements: 'content.outreach',
  ticker: 'content.outreach',
  team: 'content.people',
  roles: 'content.people',
}

const AREA_BY_INBOX: Record<string, Area> = {
  reviewers: 'applications',
  editors: 'applications',
  messages: 'messages',
}

export function areaForEntity(slug: string): Area | null {
  return AREA_BY_ENTITY[slug] ?? null
}

export function areaForInbox(key: string): Area | null {
  return AREA_BY_INBOX[key] ?? null
}

/**
 * The starting matrix, and the fallback for any cell the database has no row
 * for. Editable from the panel; this is only where everyone begins.
 */
export const DEFAULT_MATRIX: PermissionMatrix = {
  administrator: {
    dashboard: 'edit',
    submissions: 'edit',
    applications: 'edit',
    messages: 'edit',
    'content.journal': 'edit',
    'content.outreach': 'edit',
    'content.people': 'edit',
    media: 'edit',
    settings: 'edit',
    people: 'edit',
  },
  editor: {
    dashboard: 'view',
    submissions: 'edit',
    applications: 'edit',
    messages: 'edit',
    'content.journal': 'edit',
    'content.outreach': 'edit',
    'content.people': 'edit',
    media: 'edit',
    settings: 'none',
    people: 'none',
  },
  content_manager: {
    dashboard: 'view',
    submissions: 'none',
    applications: 'none',
    messages: 'edit',
    'content.journal': 'none',
    'content.outreach': 'edit',
    'content.people': 'edit',
    media: 'edit',
    settings: 'none',
    people: 'none',
  },
  reviewer: {
    dashboard: 'none',
    submissions: 'edit',
    applications: 'none',
    messages: 'none',
    'content.journal': 'none',
    'content.outreach': 'none',
    'content.people': 'none',
    media: 'none',
    settings: 'none',
    people: 'none',
  },
  observer: {
    dashboard: 'view',
    submissions: 'view',
    applications: 'view',
    messages: 'view',
    'content.journal': 'view',
    'content.outreach': 'view',
    'content.people': 'view',
    media: 'view',
    settings: 'view',
    people: 'none',
  },
}

const RANK: Record<AccessLevel, number> = { none: 0, view: 1, edit: 2 }

/**
 * What a role may do in an area.
 *
 * The administrator is answered before the matrix is consulted, and always with
 * `edit`. The grid is editable from the panel, so without this an administrator
 * could clear their own row, save it, and lock every last person out of the
 * panel with no way back in through the interface. The people page renders that
 * row fixed for the same reason; this is the half that cannot be worked around.
 */
export function levelFor(matrix: PermissionMatrix, role: StaffRole, area: Area): AccessLevel {
  if (role === 'administrator') return 'edit'
  return matrix[role]?.[area] ?? DEFAULT_MATRIX[role][area]
}

export function can(
  matrix: PermissionMatrix,
  role: StaffRole,
  area: Area,
  need: 'view' | 'edit',
): boolean {
  return RANK[levelFor(matrix, role, area)] >= RANK[need]
}

/**
 * Where to send someone after they sign in.
 *
 * A reviewer has no dashboard, so landing them there would greet them with a
 * refusal on every sign-in. Areas are checked in the order they are declared,
 * which puts the dashboard first for everyone who has it.
 */
export function firstAllowedArea(matrix: PermissionMatrix, role: StaffRole): Area | null {
  return AREAS.find((area) => can(matrix, role, area, 'view')) ?? null
}

function isRole(value: string): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value)
}

function isArea(value: string): value is Area {
  return (AREAS as readonly string[]).includes(value)
}

function isLevel(value: unknown): value is AccessLevel {
  return typeof value === 'string' && (ACCESS_LEVELS as readonly string[]).includes(value)
}

/**
 * A complete matrix built from whatever partial set of rows the database holds.
 *
 * Rows are stored one per role and area, so a cell that has never been saved,
 * or an area added to the code after the table was seeded, simply has no row.
 * Those fall back to the default rather than to `edit`: a gap in the data must
 * never read as permission. Unknown roles and areas are dropped, so a leftover
 * row from a renamed area cannot grant anything.
 */
export function withDefaults(stored: unknown): PermissionMatrix {
  const matrix = structuredClone(DEFAULT_MATRIX)
  if (!stored || typeof stored !== 'object') return matrix

  for (const [role, areas] of Object.entries(stored as Record<string, unknown>)) {
    if (!isRole(role) || !areas || typeof areas !== 'object') continue

    for (const [area, level] of Object.entries(areas as Record<string, unknown>)) {
      if (!isArea(area) || !isLevel(level)) continue
      matrix[role][area] = level
    }
  }

  return matrix
}
