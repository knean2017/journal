/**
 * Pushes the repo's seed content into Supabase.
 *
 * Idempotent: every table is upserted on its natural key, so running this twice
 * changes nothing. Safe against a populated database, but it will overwrite
 * edits made in the admin panel to any row it owns.
 *
 *   npm run seed
 */
import { createClient } from '@supabase/supabase-js'

import { config } from '../src/lib/content/seed/config'
import { disciplines } from '../src/lib/content/seed/disciplines'
import { team } from '../src/lib/content/seed/team'
import { editorialRoles } from '../src/lib/content/seed/roles'
import { authors } from '../src/lib/content/seed/authors'
import { issues } from '../src/lib/content/seed/issues'
import { articles } from '../src/lib/content/seed/articles'
import { announcements } from '../src/lib/content/seed/announcements'
import { tickerLines } from '../src/lib/content/seed/ticker'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

/** '30 September 2026' -> '2026-09-30'. Returns null for anything unparseable. */
function toDate(value: string | null): string | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10)
}

function check(label: string, error: { message: string } | null) {
  if (error) {
    console.error(`  ${label} failed: ${error.message}`)
    process.exitCode = 1
  } else {
    console.log(`  ${label}`)
  }
}

async function main() {
  console.log('Seeding ICRR content...')

  check(
    'site_config',
    (
      await supabase.from('site_config').upsert(
        {
          id: true,
          deadline: config.deadline,
          expected: config.expected,
          show_preview_notes: config.showPreviewNotes,
          contact_email: config.contactEmail,
          issn_status: config.issnStatus,
        },
        { onConflict: 'id' },
      )
    ).error,
  )

  check(
    'disciplines',
    (
      await supabase.from('disciplines').upsert(
        disciplines.map((d) => ({
          slug: d.slug,
          name: d.name,
          blurb: d.blurb,
          sort_order: d.sortOrder,
        })),
        { onConflict: 'slug' },
      )
    ).error,
  )

  check(
    'team_members',
    (
      await supabase.from('team_members').upsert(
        team.map((t) => ({
          slug: t.slug,
          name: t.name,
          role: t.role,
          duty: t.duty,
          sort_order: t.sortOrder,
          is_published: true,
        })),
        { onConflict: 'slug' },
      )
    ).error,
  )

  // editorial_roles has no natural key, so replace wholesale.
  await supabase.from('editorial_roles').delete().not('id', 'is', null)
  check(
    'editorial_roles',
    (
      await supabase.from('editorial_roles').insert(
        editorialRoles.map((r) => ({
          title: r.title,
          status: r.status,
          status_label: r.statusLabel,
          duty: r.duty,
          sort_order: r.sortOrder,
        })),
      )
    ).error,
  )

  const { data: disciplineRows } = await supabase.from('disciplines').select('id, slug')
  const disciplineId = new Map((disciplineRows ?? []).map((row) => [row.slug, row.id]))

  check(
    'authors',
    (
      await supabase.from('authors').upsert(
        authors.map((a) => ({
          slug: a.slug,
          name: a.name,
          role: a.role,
          affiliation: a.affiliation,
          department: a.department,
          location: a.location,
          discipline_id: disciplineId.get(a.disciplineSlug) ?? null,
          orcid: a.orcid,
          bio: a.bio,
          interests: a.interests,
          is_published: true,
        })),
        { onConflict: 'slug' },
      )
    ).error,
  )

  check(
    'issues',
    (
      await supabase.from('issues').upsert(
        issues.map((i) => ({
          slug: i.slug,
          volume: i.volume,
          number: i.number,
          status: i.status,
          status_label: i.statusLabel,
          publish_date: toDate(i.publishDate),
          submissions_close: toDate(i.submissionsClose),
          description: i.description,
          is_current: i.isCurrent,
        })),
        { onConflict: 'slug' },
      )
    ).error,
  )

  const { data: issueRows } = await supabase.from('issues').select('id, slug')
  const issueId = new Map((issueRows ?? []).map((row) => [row.slug, row.id]))

  check(
    'articles',
    (
      await supabase.from('articles').upsert(
        articles.map((a, index) => ({
          slug: a.slug,
          issue_id: a.issueSlug ? (issueId.get(a.issueSlug) ?? null) : null,
          discipline_id: disciplineId.get(a.disciplineSlug) ?? null,
          article_type: a.articleType,
          title: a.title,
          abstract: a.abstract,
          keywords: a.keywords,
          status: a.status,
          status_label: a.statusLabel,
          citation: a.citation,
          sort_order: index + 1,
        })),
        { onConflict: 'slug' },
      )
    ).error,
  )

  const { data: articleRows } = await supabase.from('articles').select('id, slug')
  const articleId = new Map((articleRows ?? []).map((row) => [row.slug, row.id]))
  const { data: authorRows } = await supabase.from('authors').select('id, slug')
  const authorId = new Map((authorRows ?? []).map((row) => [row.slug, row.id]))

  const links = articles.flatMap((article) =>
    article.authors
      .map((link) => ({
        article_id: articleId.get(article.slug),
        author_id: authorId.get(link.authorSlug),
        author_order: link.order,
        affiliation_marker: link.affiliationMarker,
      }))
      .filter((row) => row.article_id && row.author_id),
  )

  check(
    'article_authors',
    (await supabase.from('article_authors').upsert(links, { onConflict: 'article_id,author_id' }))
      .error,
  )

  check(
    'announcements',
    (
      await supabase.from('announcements').upsert(
        announcements.map((a) => ({
          slug: a.slug,
          published_on: toDate(a.publishedOn),
          tag: a.tag,
          title: a.title,
          blurb: a.blurb,
          body: a.body,
          cta_label: a.ctaLabel,
          cta_href: a.ctaHref,
          sort_order: a.sortOrder,
          is_published: true,
        })),
        { onConflict: 'slug' },
      )
    ).error,
  )

  await supabase.from('ticker_lines').delete().not('id', 'is', null)
  check(
    'ticker_lines',
    (
      await supabase
        .from('ticker_lines')
        .insert(tickerLines.map((t) => ({ text: t.text, sort_order: t.sortOrder, is_active: true })))
    ).error,
  )

  console.log(process.exitCode ? 'Finished with errors.' : 'Done.')
}

void main()
