import { z } from 'zod'

export const siteConfigSchema = z.object({
  deadline: z.string(),
  expected: z.string(),
  showPreviewNotes: z.boolean(),
  contactEmail: z.string().email(),
  issnStatus: z.string(),
  heroImagePath: z.string().nullable(),
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
