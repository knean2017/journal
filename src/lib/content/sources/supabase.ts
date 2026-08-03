import { cache } from 'react'
import { SUPABASE_URL } from '@/lib/supabase/env'
import { createSupabasePublicClient } from '@/lib/supabase/public'
import type {
  Announcement,
  Article,
  ArticleAuthor,
  Author,
  Discipline,
  EditorialRole,
  Issue,
  SiteConfig,
  TeamMember,
  TickerLine,
} from '../schema'

/**
 * Supabase content source.
 *
 * Reads run under RLS with the anon key, so this can only return rows the
 * public is allowed to see. Nothing here writes.
 *
 * Every reader is wrapped in React's `cache`, which collapses repeat calls
 * within one render. The site layout and the page it wraps both want the site
 * config, the current issue is picked out of the issue list, and an author's
 * publications are filtered out of the article list; without this each of
 * those is a second round trip to Postgres for a copy of what the render
 * already has.
 */

/** Bucket paths are stored bare; the public URL is derived, never stored. */
function mediaUrl(path: string | null, bucket = 'media'): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}

type DisciplineRow = {
  slug: string
  name: string
  blurb: string
  sort_order: number
}

type AuthorRow = {
  id: string
  slug: string
  name: string
  role: string
  affiliation: string
  department: string
  location: string
  orcid: string | null
  bio: string
  interests: string[]
  portrait_path: string | null
  disciplines: { slug: string; name: string } | null
}

type ArticleRow = {
  slug: string
  article_type: string
  title: string
  abstract: string
  keywords: string[]
  status: Article['status']
  status_label: string
  citation: string
  pdf_path: string | null
  page_start: number | null
  page_end: number | null
  received_on: string | null
  accepted_on: string | null
  published_on: string | null
  issues: { slug: string } | null
  disciplines: { slug: string; name: string } | null
  article_authors: {
    author_order: number
    affiliation_marker: string
    authors: { id: string; slug: string; name: string } | null
  }[]
}

const DISCIPLINE_SELECT = 'slug, name, blurb, sort_order'
/* Named rather than `*`: the row carries editorial columns no view reads. */
const ISSUE_SELECT = `slug, volume, number, status, status_label, publish_date,
  submissions_close, cover_path, description, is_current`
const AUTHOR_SELECT =
  'id, slug, name, role, affiliation, department, location, orcid, bio, interests, portrait_path, disciplines ( slug, name )'
const ARTICLE_SELECT = `slug, article_type, title, abstract, keywords, status, status_label,
  citation, pdf_path, page_start, page_end, received_on, accepted_on, published_on,
  issues ( slug ), disciplines ( slug, name ),
  article_authors ( author_order, affiliation_marker, authors ( id, slug, name ) )`

function toDiscipline(row: DisciplineRow): Discipline {
  return { slug: row.slug, name: row.name, blurb: row.blurb, sortOrder: row.sort_order }
}

function toAuthor(row: AuthorRow): Author {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    affiliation: row.affiliation,
    department: row.department,
    location: row.location,
    disciplineSlug: row.disciplines?.slug ?? '',
    disciplineName: row.disciplines?.name ?? '',
    orcid: row.orcid,
    bio: row.bio,
    interests: row.interests,
    portraitPath: mediaUrl(row.portrait_path),
  }
}

function toArticle(row: ArticleRow): Article {
  const authors: ArticleAuthor[] = row.article_authors
    .filter((link) => link.authors !== null)
    .sort((a, b) => a.author_order - b.author_order)
    .map((link) => ({
      authorId: link.authors!.id,
      authorName: link.authors!.name,
      authorSlug: link.authors!.slug,
      affiliationMarker: link.affiliation_marker,
      order: link.author_order,
    }))

  return {
    slug: row.slug,
    issueSlug: row.issues?.slug ?? null,
    disciplineSlug: row.disciplines?.slug ?? '',
    disciplineName: row.disciplines?.name ?? '',
    articleType: row.article_type,
    title: row.title,
    abstract: row.abstract,
    keywords: row.keywords,
    status: row.status,
    statusLabel: row.status_label,
    citation: row.citation,
    pdfPath: mediaUrl(row.pdf_path, 'article-pdfs'),
    pageStart: row.page_start,
    pageEnd: row.page_end,
    receivedOn: row.received_on,
    acceptedOn: row.accepted_on,
    publishedOn: row.published_on,
    authors,
  }
}

export const getConfig = cache(async (): Promise<SiteConfig> => {
  const supabase = createSupabasePublicClient()
  const { data, error } = await supabase.from('site_config').select('*').single()
  if (error || !data) throw new Error(`site_config unavailable: ${error?.message ?? 'no row'}`)

  return {
    deadline: data.deadline,
    expected: data.expected,
    showPreviewNotes: data.show_preview_notes,
    contactEmail: data.contact_email,
    issnStatus: data.issn_status,
  }
})

export const getDisciplines = cache(async (): Promise<Discipline[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase
    .from('disciplines')
    .select(DISCIPLINE_SELECT)
    .order('sort_order')
  return (data ?? []).map(toDiscipline)
})

export const getTeam = cache(async (): Promise<TeamMember[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase
    .from('team_members')
    .select('slug, name, role, duty, portrait_path, sort_order')
    .order('sort_order')

  return (data ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    role: row.role,
    duty: row.duty,
    portraitPath: mediaUrl(row.portrait_path),
    sortOrder: row.sort_order,
  }))
})

export const getEditorialRoles = cache(async (): Promise<EditorialRole[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase
    .from('editorial_roles')
    .select('title, status, status_label, holder_name, duty, sort_order')
    .order('sort_order')

  return (data ?? []).map((row) => ({
    title: row.title,
    status: row.status,
    statusLabel: row.status_label,
    holderName: row.holder_name,
    duty: row.duty,
    sortOrder: row.sort_order,
  }))
})

export const getAuthors = cache(async (): Promise<Author[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase.from('authors').select(AUTHOR_SELECT).order('name')
  return ((data ?? []) as unknown as AuthorRow[]).map(toAuthor)
})

export const getAuthorBySlug = cache(async (slug: string): Promise<Author | null> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase.from('authors').select(AUTHOR_SELECT).eq('slug', slug).maybeSingle()
  return data ? toAuthor(data as unknown as AuthorRow) : null
})

export const getIssues = cache(async (): Promise<Issue[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase
    .from('issues')
    .select(ISSUE_SELECT)
    .order('volume', { ascending: false })
    .order('number', { ascending: false })

  return (data ?? []).map((row) => ({
    slug: row.slug,
    volume: row.volume,
    number: row.number,
    status: row.status,
    statusLabel: row.status_label,
    publishDate: row.publish_date,
    submissionsClose: row.submissions_close,
    coverPath: mediaUrl(row.cover_path),
    description: row.description,
    isCurrent: row.is_current,
  }))
})

export const getCurrentIssue = cache(async (): Promise<Issue | null> => {
  const issues = await getIssues()
  return issues.find((issue) => issue.isCurrent) ?? null
})

export const getArticles = cache(async (): Promise<Article[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase.from('articles').select(ARTICLE_SELECT).order('sort_order')
  return ((data ?? []) as unknown as ArticleRow[]).map(toArticle)
})

export const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('slug', slug)
    .maybeSingle()
  return data ? toArticle(data as unknown as ArticleRow) : null
})

export const getArticlesByAuthor = cache(async (authorId: string): Promise<Article[]> => {
  const articles = await getArticles()
  return articles.filter((article) => article.authors.some((a) => a.authorId === authorId))
})

export const getAnnouncements = cache(async (): Promise<Announcement[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase
    .from('announcements')
    .select('slug, published_on, tag, title, blurb, body, cta_label, cta_href, sort_order')
    .order('sort_order')

  return (data ?? []).map((row) => ({
    slug: row.slug,
    publishedOn: row.published_on,
    tag: row.tag,
    title: row.title,
    blurb: row.blurb,
    body: row.body,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    sortOrder: row.sort_order,
  }))
})

export const getTickerLines = cache(async (): Promise<TickerLine[]> => {
  const supabase = createSupabasePublicClient()
  const { data } = await supabase
    .from('ticker_lines')
    .select('text, sort_order')
    .order('sort_order')

  return (data ?? []).map((row) => ({ text: row.text, sortOrder: row.sort_order }))
})
