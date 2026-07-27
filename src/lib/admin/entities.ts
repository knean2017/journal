export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'boolean'
  | 'number'
  | 'date'
  | 'tags'
  | 'image'
  | 'pdf'
  | 'discipline'
  | 'issue'
  | 'select'

export type Field = {
  name: string
  label: string
  type: FieldType
  help?: string
  options?: { value: string; label: string }[]
  required?: boolean
}

export type Entity = {
  slug: string
  table: string
  label: string
  plural: string
  /** Column shown as the row title in the list. */
  titleColumn: string
  /** Extra columns shown beside the title. */
  listColumns: string[]
  orderBy: { column: string; ascending: boolean }
  fields: Field[]
  /** False for tables the admin may edit but not add to or remove from. */
  canCreate: boolean
  canDelete: boolean
}

const SORT_ORDER: Field = {
  name: 'sort_order',
  label: 'Order',
  type: 'number',
  help: 'Lower numbers appear first.',
}

const PUBLISHED: Field = {
  name: 'is_published',
  label: 'Published',
  type: 'boolean',
  help: 'Unpublished rows are invisible to the public and unreadable by the API.',
}

export const ENTITIES: Entity[] = [
  {
    slug: 'team',
    table: 'team_members',
    label: 'Team member',
    plural: 'Team',
    titleColumn: 'name',
    listColumns: ['role'],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true, help: 'Lowercase, hyphenated.' },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'duty', label: 'Duty', type: 'textarea', required: true },
      { name: 'portrait_path', label: 'Portrait', type: 'image' },
      SORT_ORDER,
      PUBLISHED,
    ],
  },
  {
    slug: 'roles',
    table: 'editorial_roles',
    label: 'Editorial role',
    plural: 'Editorial roles',
    titleColumn: 'title',
    listColumns: ['status_label'],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'pending', label: 'Appointment pending' },
          { value: 'recruiting', label: 'Recruiting' },
        ],
      },
      {
        name: 'status_label',
        label: 'Status label',
        type: 'text',
        required: true,
        help: 'The words shown on the page, e.g. "Appointment pending".',
      },
      { name: 'duty', label: 'Duty', type: 'textarea', required: true },
      SORT_ORDER,
    ],
  },
  {
    slug: 'authors',
    table: 'authors',
    label: 'Author',
    plural: 'Authors',
    titleColumn: 'name',
    listColumns: ['affiliation'],
    orderBy: { column: 'name', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'text', required: true },
      { name: 'affiliation', label: 'Affiliation', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'discipline_id', label: 'Section', type: 'discipline' },
      { name: 'orcid', label: 'ORCID', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'bio', label: 'Biography', type: 'textarea' },
      { name: 'interests', label: 'Research interests', type: 'tags', help: 'One per line.' },
      { name: 'portrait_path', label: 'Portrait', type: 'image' },
      PUBLISHED,
    ],
  },
  {
    slug: 'issues',
    table: 'issues',
    label: 'Issue',
    plural: 'Issues',
    titleColumn: 'slug',
    listColumns: ['status_label'],
    orderBy: { column: 'volume', ascending: false },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'volume', label: 'Volume', type: 'number', required: true },
      { name: 'number', label: 'Number', type: 'number', required: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'in_preparation', label: 'In preparation' },
          { value: 'published', label: 'Published' },
        ],
      },
      { name: 'status_label', label: 'Status label', type: 'text', required: true },
      { name: 'publish_date', label: 'Publish date', type: 'date' },
      { name: 'submissions_close', label: 'Submissions close', type: 'date' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'cover_path', label: 'Cover', type: 'image' },
      {
        name: 'is_current',
        label: 'Current issue',
        type: 'boolean',
        help: 'Only one issue can be current. Setting this clears the others.',
      },
    ],
  },
  {
    slug: 'articles',
    table: 'articles',
    label: 'Article',
    plural: 'Articles',
    titleColumn: 'title',
    listColumns: ['status_label'],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'issue_id', label: 'Issue', type: 'issue' },
      { name: 'discipline_id', label: 'Section', type: 'discipline' },
      { name: 'article_type', label: 'Type', type: 'text' },
      { name: 'abstract', label: 'Abstract', type: 'textarea' },
      { name: 'keywords', label: 'Keywords', type: 'tags', help: 'One per line.' },
      { name: 'body', label: 'Body', type: 'richtext' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'under_review', label: 'Under review' },
          { value: 'published', label: 'Published' },
        ],
      },
      { name: 'status_label', label: 'Status label', type: 'text', required: true },
      { name: 'citation', label: 'Citation', type: 'text' },
      { name: 'pdf_path', label: 'PDF', type: 'pdf' },
      { name: 'page_start', label: 'First page', type: 'number' },
      { name: 'page_end', label: 'Last page', type: 'number' },
      { name: 'received_on', label: 'Received', type: 'date' },
      { name: 'accepted_on', label: 'Accepted', type: 'date' },
      { name: 'published_on', label: 'Published on', type: 'date' },
      SORT_ORDER,
    ],
  },
  {
    slug: 'announcements',
    table: 'announcements',
    label: 'Announcement',
    plural: 'Announcements',
    titleColumn: 'title',
    listColumns: ['published_on', 'tag'],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'published_on', label: 'Date', type: 'date', required: true },
      { name: 'tag', label: 'Tag', type: 'text', required: true },
      { name: 'blurb', label: 'Blurb', type: 'textarea' },
      { name: 'body', label: 'Body', type: 'textarea' },
      { name: 'cta_label', label: 'Link label', type: 'text' },
      { name: 'cta_href', label: 'Link target', type: 'text', help: 'A site path, e.g. /submit' },
      SORT_ORDER,
      PUBLISHED,
    ],
  },
  {
    slug: 'ticker',
    table: 'ticker_lines',
    label: 'Ticker line',
    plural: 'Home ticker',
    titleColumn: 'text',
    listColumns: [],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'text', label: 'Line', type: 'text', required: true },
      SORT_ORDER,
      { name: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  {
    slug: 'disciplines',
    table: 'disciplines',
    label: 'Section',
    plural: 'Sections',
    titleColumn: 'name',
    listColumns: [],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'blurb', label: 'Blurb', type: 'textarea', required: true },
      SORT_ORDER,
    ],
  },
]

export const SITE_CONFIG_FIELDS: Field[] = [
  { name: 'deadline', label: 'Submission deadline', type: 'text', required: true },
  { name: 'expected', label: 'Publication date', type: 'text', required: true },
  { name: 'contact_email', label: 'Contact email', type: 'text', required: true },
  { name: 'issn_status', label: 'ISSN status', type: 'text' },
  { name: 'hero_image_path', label: 'Home hero image', type: 'image' },
  {
    name: 'show_preview_notes',
    label: 'Show design-preview banners',
    type: 'boolean',
    help: 'Turn off once the placeholder authors and article template are replaced.',
  },
]

export function findEntity(slug: string): Entity | undefined {
  return ENTITIES.find((entity) => entity.slug === slug)
}

/** Allowlist. The generic actions refuse any table not named here. */
export const WRITABLE_TABLES = new Set([
  ...ENTITIES.map((entity) => entity.table),
  'site_config',
  'submissions',
  'reviewer_applications',
  'contact_messages',
])

/**
 * Tables that arrive from public forms. The admin may triage them, never edit
 * their content, so they are handled by setInboxStatus rather than the generic
 * record editor.
 */
export const INBOX_TABLES = {
  reviewers: { table: 'reviewer_applications', label: 'Reviewer applications' },
  messages: { table: 'contact_messages', label: 'Messages' },
} as const

export type InboxKey = keyof typeof INBOX_TABLES
