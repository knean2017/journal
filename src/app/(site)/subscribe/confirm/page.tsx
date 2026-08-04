import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHead } from '@/components/ui/PageHead'
import { confirmSubscription } from '@/lib/subscribers/actions'
import { unsubscribeTokenSchema } from '@/lib/subscribers/unsubscribe'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export const metadata: Metadata = {
  title: 'Confirm your announcement emails',
  description: 'Confirm the address that asked for announcements from the journal.',
  // Every URL that reaches this page carries a live token.
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const OUTCOMES: Record<string, { title: string; body: string }> = {
  done: {
    title: 'You are on the list',
    body: 'The address is confirmed. You will get our calls for papers and issue announcements, at most one message a month, and every one of them carries a link to stop.',
  },
  already: {
    title: 'That address was already confirmed',
    body: 'Nothing more to do. You are on the announcement list, and every message we send carries a link to come off it.',
  },
  unknown: {
    title: 'That link is not one of ours',
    body: 'It may have been copied incompletely. Ask for announcements again from the news page and we will send a fresh link.',
  },
  invalid: {
    title: 'That link is incomplete',
    body: 'The confirmation code was missing from the link. Ask for announcements again from the news page and we will send a fresh one.',
  },
  error: {
    title: 'Something went wrong',
    body: 'We could not reach the list just now. Please try the link again in a few minutes.',
  },
}

function Panel({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pb-[clamp(48px,8vw,88px)]">
      <div className="mt-8 max-w-[60ch] border border-rule bg-cream px-[clamp(20px,4vw,32px)] py-7">
        <h2 className="m-0 font-serif text-[22px] font-normal">{title}</h2>
        <p className="mt-3 mb-0 text-[15px] leading-[1.8] text-body">{body}</p>
        {children}
        <p className="mt-5 mb-0 text-[14px] leading-[1.8] text-body-muted">
          Read <Link href="/privacy">what we hold and why</Link>, or{' '}
          <Link href="/news">go back to the news</Link>.
        </p>
      </div>
    </div>
  )
}

export default async function ConfirmPage({
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
      title="Confirm your address"
      lead="One step, so that nobody is put on this list by somebody else typing their address."
      maxWidth="22ch"
    />
  )

  const panel = (key: string) => (
    <>
      {head}
      <Panel title={OUTCOMES[key].title} body={OUTCOMES[key].body} />
    </>
  )

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
  if (!parsed.success) return panel('invalid')
  if (!isSupabaseConfigured()) return panel('error')

  const supabase = createSupabaseServiceClient()
  const { data: row } = await supabase
    .from('newsletter_subscribers')
    .select('email, confirmed_at')
    .eq('confirm_token', parsed.data)
    .maybeSingle()

  if (!row) return panel('unknown')
  if (row.confirmed_at) return panel('already')

  return (
    <>
      {head}
      <Panel
        title="Add this address to the list?"
        body={`Confirming adds ${row.email} to the announcement list. At most one message a month, and every one carries a link to come off it.`}
      >
        <form action={confirmSubscription.bind(null, null)} className="mt-5">
          <input type="hidden" name="token" value={parsed.data} />
          <button type="submit" className="btn-base btn-maroon inline-block px-6 py-3">
            Confirm this address
          </button>
        </form>
      </Panel>
    </>
  )
}
