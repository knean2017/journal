import Link from 'next/link'
import { requireAdmin } from '@/lib/admin/session'
import { adminPath } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

async function counts() {
  const supabase = createSupabaseServiceClient()

  const [submissions, unread, reviewers, editors, messages, articles, authors, issue] =
    await Promise.all([
      supabase.from('submissions').select('id', { count: 'exact', head: true }),
      supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      supabase
        .from('reviewer_applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('editor_applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase.from('authors').select('id', { count: 'exact', head: true }),
      supabase
        .from('issues')
        .select('volume, number, status_label')
        .eq('is_current', true)
        .maybeSingle(),
    ])

  return {
    submissions: submissions.count ?? 0,
    unread: unread.count ?? 0,
    reviewers: reviewers.count ?? 0,
    editors: editors.count ?? 0,
    messages: messages.count ?? 0,
    articles: articles.count ?? 0,
    authors: authors.count ?? 0,
    issue: issue.data,
  }
}

export default async function AdminDashboard() {
  await requireAdmin()
  const base = `/${adminPath()}`

  let stats: Awaited<ReturnType<typeof counts>> | null = null
  let error = ''
  try {
    stats = await counts()
  } catch (cause) {
    error = cause instanceof Error ? cause.message : 'Could not reach the database'
  }

  return (
    <>
      <h1 className="m-0 font-serif text-[28px] font-normal">Dashboard</h1>
      <div className="rule-double mt-5" />

      {error ? (
        <p className="mt-6 text-[14px] text-maroon">
          Could not reach the database: {error}. Check the Supabase environment variables.
        </p>
      ) : null}

      {stats ? (
        <>
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-5 mt-7">
            {[
              { label: 'New submissions', value: stats.unread, href: `${base}/submissions` },
              { label: 'Submissions total', value: stats.submissions, href: `${base}/submissions` },
              {
                label: 'New reviewer applications',
                value: stats.reviewers,
                href: `${base}/reviewers`,
              },
              {
                label: 'New editor applications',
                value: stats.editors,
                href: `${base}/editors`,
              },
              { label: 'New messages', value: stats.messages, href: `${base}/messages` },
              { label: 'Articles', value: stats.articles, href: `${base}/articles` },
              { label: 'Authors', value: stats.authors, href: `${base}/authors` },
            ].map((card) => (
              <Link key={card.label} href={card.href} className="border border-rule bg-cream p-5">
                <div className="eyebrow">{card.label}</div>
                <div className="font-serif text-[34px] mt-2 text-maroon">{card.value}</div>
              </Link>
            ))}
          </div>

          <div className="mt-8 border border-rule p-5 max-w-[520px]">
            <div className="eyebrow">Current issue</div>
            <div className="font-serif text-[19px] mt-2">
              {stats.issue
                ? `Volume ${stats.issue.volume}, Issue ${stats.issue.number} · ${stats.issue.status_label}`
                : 'No issue is marked current.'}
            </div>
            <Link
              href={`${base}/issues`}
              className="inline-block mt-3 text-[11.5px] tracking-[0.14em] uppercase font-bold border-b border-gold pb-[3px]"
            >
              Manage issues
            </Link>
          </div>
        </>
      ) : null}
    </>
  )
}
