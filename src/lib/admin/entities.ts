export type FieldType =
  | 'text'
  | 'textarea'
  | 'boolean'
  | 'number'
  | 'date'
  | 'tags'
  | 'image'
  | 'pdf'
  | 'discipline'
  | 'issue'
  | 'select'
  | 'slug'

export type Field = {
  name: string
  label: string
  type: FieldType
  help?: string
  options?: { value: string; label: string }[]
  required?: boolean
  /**
   * Tucked into the "Advanced" panel at the foot of the form. For values the
   * panel works out on its own and an editor should not have to think about,
   * but must still be able to correct.
   */
  advanced?: boolean
  /**
   * `slug` only. The fields it is built from, and the shape it takes, as a
   * pattern rather than a function: field definitions cross into a client
   * component as props, where a function cannot be serialised.
   */
  from?: string[]
  pattern?: string
  /**
   * `slug` only, and only where the record has a public page of its own. The
   * path its address hangs off, which is also what tells the form to warn that
   * changing it breaks existing links.
   */
  urlPrefix?: string
  /** `text` only. The select whose standard wording this field follows. */
  followsStatus?: string
}

export type Entity = {
  slug: string
  table: string
  label: string
  plural: string
  /** Column shown as the row title in the list. */
  titleColumn: string
  /**
   * A row title assembled from several columns, for records with no single
   * column worth reading. `{column}` placeholders, filled from the row.
   */
  titleTemplate?: string
  /** Extra columns shown beside the title. */
  listColumns: string[]
  /** Shown as a thumbnail in the list, when the row has one. */
  thumbnailColumn?: string
  orderBy: { column: string; ascending: boolean }
  fields: Field[]
  /** False for tables the admin may edit but not add to or remove from. */
  canCreate: boolean
  canDelete: boolean
}

const SORT_ORDER: Field = {
  name: 'sort_order',
  label: 'Position in the list',
  type: 'number',
  help: 'Set by the up and down arrows on the list page. Lower numbers come first.',
  advanced: true,
}

const PUBLISHED: Field = {
  name: 'is_published',
  label: 'Show on the website',
  type: 'boolean',
  help: 'Turn this off to keep working on it. Nobody but you can see it until it is back on.',
}

/** The web address field, which the panel writes for you. */
function slugField(options: {
  from: string[]
  pattern: string
  urlPrefix?: string
  noun: string
}): Field {
  return {
    name: 'slug',
    label: options.urlPrefix ? 'Web address' : 'Internal name',
    type: 'slug',
    required: true,
    from: options.from,
    pattern: options.pattern,
    urlPrefix: options.urlPrefix,
    help: options.urlPrefix
      ? `Written for you from the ${options.noun}. Every ${options.noun} needs its own.`
      : `Written for you from the ${options.noun}. It never appears on the website; it only keeps this record apart from the others.`,
    advanced: !options.urlPrefix,
  }
}

export const ENTITIES: Entity[] = [
  {
    slug: 'team',
    table: 'team_members',
    label: 'Team member',
    plural: 'Team',
    titleColumn: 'name',
    listColumns: ['role'],
    thumbnailColumn: 'portrait_path',
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'role', label: 'Job title', type: 'text', required: true },
      {
        name: 'duty',
        label: 'What they do',
        type: 'textarea',
        required: true,
        help: 'A sentence or two, shown under their name on the team page.',
      },
      { name: 'portrait_path', label: 'Photo', type: 'image' },
      slugField({ from: ['name'], pattern: '{name}', noun: 'name' }),
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
      {
        name: 'title',
        label: 'Role',
        type: 'text',
        required: true,
        help: 'For example "Section Editor, Humanities".',
      },
      {
        name: 'status',
        label: 'Is it open?',
        type: 'select',
        required: true,
        options: [
          { value: 'recruiting', label: 'Recruiting' },
          { value: 'pending', label: 'Appointment pending' },
          { value: 'appointed', label: 'Appointed' },
        ],
        help: 'Only roles set to Recruiting can be applied for.',
      },
      {
        name: 'duty',
        label: 'What the role covers',
        type: 'textarea',
        required: true,
        help: 'Shown on the team page and on the application form.',
      },
      {
        name: 'holder_name',
        label: 'Who holds it',
        type: 'text',
        help: 'Shown on the team page beside the role. Leave empty unless the status is Appointed.',
      },
      {
        name: 'status_label',
        label: 'Wording shown on the site',
        type: 'text',
        required: true,
        followsStatus: 'status',
        help: 'Follows the setting above until you change it. Then it stays as you wrote it.',
        advanced: true,
      },
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
    thumbnailColumn: 'portrait_path',
    orderBy: { column: 'name', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      slugField({
        from: ['name'],
        pattern: '{name}',
        urlPrefix: '/authors/',
        noun: 'name',
      }),
      { name: 'role', label: 'Job title', type: 'text', required: true },
      { name: 'affiliation', label: 'University or college', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'location', label: 'Where they are based', type: 'text' },
      { name: 'discipline_id', label: 'Section', type: 'discipline' },
      {
        name: 'orcid',
        label: 'ORCID',
        type: 'text',
        help: 'The researcher ID, in the form 0000-0000-0000-0000. Leave empty if you do not have it.',
      },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'bio', label: 'Biography', type: 'textarea' },
      {
        name: 'interests',
        label: 'Research interests',
        type: 'tags',
        help: 'One per line. Each becomes its own tag on the profile.',
      },
      {
        name: 'portrait_path',
        label: 'Photo',
        type: 'image',
        /*
         * The journal takes school-age authors, so some of these are children.
         * Left empty the profile draws the same placeholder every unfilled slot
         * draws, which is why no separate switch exists for this: a photo not
         * uploaded is a photo not published, and the alternative was storing a
         * flag recording that a named author is a minor.
         */
        help: 'Leave empty for authors under 18. Everything else on the profile still publishes.',
      },
      PUBLISHED,
    ],
  },
  {
    slug: 'issues',
    table: 'issues',
    label: 'Issue',
    plural: 'Issues',
    titleColumn: 'slug',
    titleTemplate: 'Volume {volume}, Issue {number}',
    listColumns: ['status_label'],
    thumbnailColumn: 'cover_path',
    orderBy: { column: 'volume', ascending: false },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'volume', label: 'Volume', type: 'number', required: true },
      { name: 'number', label: 'Issue number', type: 'number', required: true },
      {
        name: 'status',
        label: 'Where it has got to',
        type: 'select',
        required: true,
        options: [
          { value: 'in_preparation', label: 'In preparation' },
          { value: 'published', label: 'Published' },
        ],
      },
      { name: 'publish_date', label: 'Publication date', type: 'date' },
      { name: 'submissions_close', label: 'Submissions close', type: 'date' },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        help: 'A line about the issue, shown on the archives page.',
      },
      { name: 'cover_path', label: 'Cover image', type: 'image' },
      {
        name: 'is_current',
        label: 'This is the current issue',
        type: 'boolean',
        help: 'Only one issue can be current. Ticking this unticks whichever one was.',
      },
      {
        name: 'status_label',
        label: 'Wording shown on the site',
        type: 'text',
        required: true,
        followsStatus: 'status',
        help: 'Follows the setting above until you change it. Then it stays as you wrote it, which is how an issue in preparation can read "Scheduled".',
        advanced: true,
      },
      slugField({
        from: ['volume', 'number'],
        pattern: 'volume-{volume}-issue-{number}',
        noun: 'volume and issue number',
      }),
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
      slugField({
        from: ['title'],
        pattern: '{title}',
        urlPrefix: '/articles/',
        noun: 'title',
      }),
      { name: 'issue_id', label: 'Issue', type: 'issue' },
      { name: 'discipline_id', label: 'Section', type: 'discipline' },
      {
        name: 'article_type',
        label: 'Kind of article',
        type: 'text',
        help: 'For example "Research article" or "Review".',
      },
      { name: 'abstract', label: 'Abstract', type: 'textarea' },
      {
        name: 'keywords',
        label: 'Keywords',
        type: 'tags',
        help: 'One per line. Each becomes its own tag on the article.',
      },
      {
        name: 'status',
        label: 'Where it has got to',
        type: 'select',
        required: true,
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'under_review', label: 'Under review' },
          { value: 'published', label: 'Published' },
        ],
      },
      { name: 'pdf_path', label: 'PDF', type: 'pdf' },
      { name: 'page_start', label: 'First page', type: 'number' },
      { name: 'page_end', label: 'Last page', type: 'number' },
      { name: 'received_on', label: 'Received', type: 'date' },
      { name: 'accepted_on', label: 'Accepted', type: 'date' },
      { name: 'published_on', label: 'Published on', type: 'date' },
      {
        name: 'citation',
        label: 'How to cite it',
        type: 'text',
        help: 'The full citation line, in the journal house style.',
      },
      {
        name: 'status_label',
        label: 'Wording shown on the site',
        type: 'text',
        required: true,
        followsStatus: 'status',
        help: 'Follows the setting above until you change it. Then it stays as you wrote it.',
        advanced: true,
      },
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
      { name: 'published_on', label: 'Date', type: 'date', required: true },
      {
        name: 'tag',
        label: 'Label',
        type: 'text',
        required: true,
        help: 'The small word above the headline, for example "Call for papers".',
      },
      {
        name: 'blurb',
        label: 'Short summary',
        type: 'textarea',
        help: 'One or two lines, shown on the home page and in the list.',
      },
      { name: 'body', label: 'Full text', type: 'textarea' },
      {
        name: 'cta_label',
        label: 'Button text',
        type: 'text',
        help: 'Leave empty for no button.',
      },
      {
        name: 'cta_href',
        label: 'Button goes to',
        type: 'text',
        help: 'A page on this site, written from the slash: /submit, /contact, /reviewers/apply.',
      },
      slugField({ from: ['title'], pattern: '{title}', noun: 'title' }),
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
      {
        name: 'text',
        label: 'Line',
        type: 'text',
        required: true,
        help: 'One of the lines that scrolls along the bottom of the home page.',
      },
      { name: 'is_active', label: 'Show on the website', type: 'boolean' },
      SORT_ORDER,
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
      {
        name: 'blurb',
        label: 'What it covers',
        type: 'textarea',
        required: true,
        help: 'Shown on the home page and used to describe the section on the forms.',
      },
      slugField({ from: ['name'], pattern: '{name}', noun: 'name' }),
      SORT_ORDER,
    ],
  },

  /*
   * The copy that describes how the journal runs. These five used to be fixed
   * in src/lib/content/seed/process.ts, which made correcting a timeline date a
   * deploy. Their tables start empty and the pages that show them hide a block
   * with nothing in it, so an entity here is the only way any of them appears.
   */
  {
    slug: 'timeline',
    table: 'timeline_entries',
    label: 'Timeline entry',
    plural: 'Production timeline',
    titleColumn: 'title',
    listColumns: ['when_label'],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'title', label: 'Milestone', type: 'text', required: true },
      {
        name: 'when_label',
        label: 'When',
        type: 'text',
        required: true,
        help: 'Written the way it should read, and not always a date: "Now", "2–3 weeks", "15 Sept 2026".',
      },
      {
        name: 'body',
        label: 'Note',
        type: 'textarea',
        required: true,
        help: 'The line under the milestone on the current issue page.',
      },
      {
        name: 'is_reached',
        label: 'Milestone reached',
        type: 'boolean',
        help: 'Fills the dot on the rail. Tick it as the issue passes each stage.',
      },
      SORT_ORDER,
    ],
  },
  {
    slug: 'process-steps',
    table: 'process_steps',
    label: 'Process step',
    plural: 'Publication process',
    titleColumn: 'title',
    listColumns: ['time_label'],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      { name: 'title', label: 'Step', type: 'text', required: true },
      {
        name: 'time_label',
        label: 'How long it takes',
        type: 'text',
        required: true,
        help: 'Shown beside the step number, for example "Day 1" or "Weeks 1–3".',
      },
      {
        name: 'body',
        label: 'What happens',
        type: 'textarea',
        required: true,
        help: 'One sentence. The journal reviews what it publishes; do not name a review model beyond that, and do not promise authors feedback.',
      },
      {
        name: 'step_label',
        label: 'Number',
        type: 'text',
        required: true,
        help: 'The numeral in the box. Text rather than a number, because it is a label and never counted.',
        advanced: true,
      },
      SORT_ORDER,
    ],
  },
  {
    slug: 'facts',
    table: 'journal_facts',
    label: 'Fact',
    plural: 'Journal at a glance',
    titleColumn: 'key',
    listColumns: ['value'],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      {
        name: 'key',
        label: 'Label',
        type: 'text',
        required: true,
        help: 'The left column of the panel on the about page, for example "Founded".',
      },
      { name: 'value', label: 'Value', type: 'text', required: true },
      SORT_ORDER,
    ],
  },
  {
    slug: 'requirements',
    table: 'submission_requirements',
    label: 'Requirement',
    plural: 'Submission requirements',
    titleColumn: 'key',
    listColumns: ['value'],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      {
        name: 'key',
        label: 'Requirement',
        type: 'text',
        required: true,
        help: 'The short label, for example "Length" or "File format".',
      },
      { name: 'value', label: 'What is required', type: 'textarea', required: true },
      SORT_ORDER,
    ],
  },
  {
    slug: 'checklist',
    table: 'submission_checklist',
    label: 'Checklist item',
    plural: 'Submission checklist',
    titleColumn: 'text',
    listColumns: [],
    orderBy: { column: 'sort_order', ascending: true },
    canCreate: true,
    canDelete: true,
    fields: [
      {
        name: 'text',
        label: 'Item',
        type: 'textarea',
        required: true,
        help: 'One line of the "Before you submit" list, written as something the author confirms.',
      },
      SORT_ORDER,
    ],
  },
]

export const SITE_CONFIG_FIELDS: Field[] = [
  {
    name: 'deadline',
    label: 'Submission deadline',
    type: 'text',
    required: true,
    help: 'Written the way it should read, for example "30 August 2026".',
  },
  {
    name: 'expected',
    label: 'Publication date',
    type: 'text',
    required: true,
    help: 'Written the way it should read, for example "15 September 2026".',
  },
  {
    name: 'contact_email',
    label: 'Contact email',
    type: 'text',
    required: true,
    help: 'Where the contact page and every form tells people to write.',
  },
  { name: 'issn_status', label: 'ISSN status', type: 'text' },
  /*
   * No home page main image. The band that showed it is gone, so the uploader
   * would have taken a photograph and put it nowhere. The column stays behind
   * in case the band comes back.
   */
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
  'editor_applications',
  'contact_messages',
  // Neither is edited from the panel; both may be deleted from it.
  'newsletter_subscribers',
  'announcement_sends',
])

/**
 * Tables that arrive from public forms. The admin may triage them, never edit
 * their content, so they are handled by setInboxStatus rather than the generic
 * record editor.
 */
export const INBOX_TABLES = {
  reviewers: { table: 'reviewer_applications', label: 'Reviewer applications' },
  editors: { table: 'editor_applications', label: 'Editor applications' },
  messages: { table: 'contact_messages', label: 'Messages' },
} as const

export type InboxKey = keyof typeof INBOX_TABLES

/**
 * The three states anything in an inbox can be in. Declared once: the row that
 * sets a status and the filter that searches by one have to agree on the
 * wording, or a list quietly filters on a value nothing is ever set to.
 */
export const INBOX_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
]
