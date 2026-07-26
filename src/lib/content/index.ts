import {
  announcementSchema,
  articleSchema,
  authorSchema,
  disciplineSchema,
  editorialRoleSchema,
  issueSchema,
  siteConfigSchema,
  teamMemberSchema,
  tickerLineSchema,
} from './schema'
import type {
  Announcement,
  Article,
  Author,
  Discipline,
  EditorialRole,
  Fact,
  Issue,
  ProcessStep,
  Requirement,
  SiteConfig,
  TeamMember,
  TickerLine,
  TimelineEntry,
  TocPreviewEntry,
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

/**
 * The only content API the rest of the app may import.
 *
 * Every accessor is async so the Supabase implementation can replace these
 * bodies with queries and no call site has to change.
 */

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

export async function getProcessSteps(): Promise<ProcessStep[]> {
  return processSteps
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  return timeline
}

export async function getTocPreview(): Promise<TocPreviewEntry[]> {
  return tocPreview
}

export async function getFacts(): Promise<Fact[]> {
  return facts
}

export async function getRequirements(): Promise<Requirement[]> {
  return requirements
}

export async function getChecklist(): Promise<string[]> {
  return checklist
}

export * from './schema'
