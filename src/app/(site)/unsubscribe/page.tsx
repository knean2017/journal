import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHead } from '@/components/ui/PageHead'
import { unsubscribe } from '@/lib/subscribers/actions'
import { unsubscribeTokenSchema } from '@/lib/subscribers/unsubscribe'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  description: 'Stop receiving announcement emails from the International Collegiate Research Review.',
  // Never indexed. Every URL that reaches this page carries somebody's token,
  // and a crawled one would sit in a search index as a live credential.
  robots: { index: false, follow: false },
}

// The token is read per request and the row is looked up live, so nothing here
// may be prerendered or cached.
export const dynamic = 'force-dynamic'

/** The finished states, reached by redirect after the form is posted. */
const OUTCOMES: Record<string, { title: string; body: string }> = {
  done: {
    title: 'You have been taken off the list',
    body: 'You will not receive any more announcement emails. Nothing else about you changes, and anything you have submitted to the journal is unaffected.',
  },
  already: {
    title: 'You were already off the list',
    body: 'That link has been used before. You are not receiving announcement emails, and no further action is needed.',
  },
  unknown: {
    title: 'That link is not one of ours',
    body: 'It may have been copied incompletely, or the address may have been removed already. If you are still receiving announcements, write to us and we will take the address off by hand.',
  },
  invalid: {
    title: 'That link is incomplete',
    body: 'The address to unsubscribe was missing from the link. Open it again from the email, or write to us and we will take the address off by hand.',
  },
  error: {
    title: 'Something went wrong',
    body: 'We could not reach the list just now. Please try again in a few minutes, or write to us and we will take the address off by hand.',
  },
}

function Panel({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pb-[clamp(48px,8vw,88px)]">
      <div className="mt-8 max-w-[60ch] border border-rule bg-cream px-[clamp(20px,4vw,32px)] py-7">
        <h2 className="m-0 font-serif text-[22px] font-normal">{title}</h2>
        <p className="mt-3 mb-0 text-[15px] leading-[1.8] text-body">{body}</p>
        {children}
        <p className="mt-5 mb-0 text-[14px] leading-[1.8] text-body-muted">
          <Link href="/contact">Write to the journal</Link> if anything here looks wrong, or read{' '}
          <Link href="/privacy">what we hold and why</Link>.
        </p>
      </div>
    </div>
  )
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

  const state = one(params.state)
  const token = one(params.token)

  const head = (
    <PageHead
      eyebrow="Announcements"
      title="Unsubscribe"
      lead="Announcement emails are sent on your consent alone, and this is how you withdraw it."
      maxWidth="20ch"
    />
  )

  // A finished state, arrived at from the action below.
  if (state) {
    const outcome = OUTCOMES[state] ?? OUTCOMES.invalid
    return (
      <>
        {head}
        <Panel title={outcome.title} body={outcome.body} />
      </>
    )
  }

  const parsed = unsubscribeTokenSchema.safeParse(token ?? '')
  if (!parsed.success) {
    return (
      <>
        {head}
        <Panel title={OUTCOMES.invalid.title} body={OUTCOMES.invalid.body} />
      </>
    )
  }

  if (!isSupabaseConfigured()) {
    return (
      <>
        {head}
        <Panel title={OUTCOMES.error.title} body={OUTCOMES.error.body} />
      </>
    )
  }

  const supabase = createSupabaseServiceClient()
  const { data: row } = await supabase
    .from('newsletter_subscribers')
    .select('email, is_active')
    .eq('unsubscribe_token', parsed.data)
    .maybeSingle()

  if (!row) {
    return (
      <>
        {head}
        <Panel title={OUTCOMES.unknown.title} body={OUTCOMES.unknown.body} />
      </>
    )
  }

  if (!row.is_active) {
    return (
      <>
        {head}
        <Panel title={OUTCOMES.already.title} body={OUTCOMES.already.body} />
      </>
    )
  }

  /*
   * The confirmation step. A plain form posting to a server action, with no
   * client component anywhere on the page: an unsubscribe has to work in a mail
   * client's embedded browser with JavaScript off, which is exactly where these
   * links get opened.
   */
  return (
    <>
      {head}
      <Panel
        title="Stop receiving announcements?"
        body={`This will take ${row.email} off the announcement list. You can ask for announcements again at any time from the news page.`}
      >
        <form action={unsubscribe.bind(null, null)} className="mt-5">
          <input type="hidden" name="token" value={parsed.data} />
          <button type="submit" className="btn-base btn-maroon inline-block px-6 py-3">
            Unsubscribe this address
          </button>
        </form>
      </Panel>
    </>
  )
}
