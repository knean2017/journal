'use server'

import { redirect } from 'next/navigation'
import { unsubscribeTokenSchema } from './unsubscribe'
import { text } from '@/lib/form-result'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

/**
 * Takes an address off the announcement list.
 *
 * A POST, never a GET, which is why the page renders a button rather than
 * acting on arrival. Mail clients, link scanners, and corporate security
 * gateways fetch the URLs in a message before anybody opens it; an unsubscribe
 * that happened on GET would take people off the list who never clicked
 * anything, and they would never know.
 *
 * Not rate limited. The token is a v4 uuid and is the entire credential, so
 * there is nothing to brute force, and a limiter here would refuse real people
 * trying again after a failure, the wrong side to err on for the one action
 * the law requires to work.
 *
 * The outcome travels back as a query parameter rather than in the rendered
 * response, so the address is never put in a URL, a browser history entry, or
 * a referrer header.
 */
export async function unsubscribe(_previous: unknown, form: FormData): Promise<void> {
  const parsed = unsubscribeTokenSchema.safeParse(text(form, 'token'))
  if (!parsed.success) redirect('/unsubscribe?state=invalid')

  if (!isSupabaseConfigured()) redirect('/unsubscribe?state=error')

  const supabase = createSupabaseServiceClient()

  /*
   * Conditional on `is_active`, so following the link a second time updates
   * nothing and the timestamp keeps saying when they actually left rather than
   * when they last clicked. An empty result is therefore two different things,
   * which the select afterwards tells apart.
   */
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', parsed.data)
    .eq('is_active', true)
    .select('id')

  if (error) {
    console.error('[unsubscribe] failed:', error)
    redirect('/unsubscribe?state=error')
  }

  if (data && data.length > 0) redirect('/unsubscribe?state=done')

  // Nothing was updated: either already off the list, or no such token.
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .eq('unsubscribe_token', parsed.data)
    .maybeSingle()

  redirect(existing ? '/unsubscribe?state=already' : '/unsubscribe?state=unknown')
}

/**
 * Completes a subscription: the step that turns a typed address into a
 * mailable one.
 *
 * POST for the same reason as the unsubscribe above. A confirmation that
 * happened on GET would be completed by the mail scanner that fetched the link
 * before the recipient saw it, which would confirm addresses nobody agreed to
 * and defeat the entire point of asking.
 *
 * `confirmed_at` is set only here. No admin page, seed, or import writes it.
 */
export async function confirmSubscription(_previous: unknown, form: FormData): Promise<void> {
  const parsed = unsubscribeTokenSchema.safeParse(text(form, 'token'))
  if (!parsed.success) redirect('/subscribe/confirm?state=invalid')

  if (!isSupabaseConfigured()) redirect('/subscribe/confirm?state=error')

  const supabase = createSupabaseServiceClient()

  /*
   * Conditional on `confirmed_at` being unset, so a link followed twice leaves
   * the original timestamp alone. That timestamp is the record of when consent
   * was given, and refreshing it on every click would lose the only date worth
   * keeping.
   */
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ confirmed_at: new Date().toISOString(), is_active: true, unsubscribed_at: null })
    .eq('confirm_token', parsed.data)
    .is('confirmed_at', null)
    .select('id')

  if (error) {
    console.error('[confirm] failed:', error)
    redirect('/subscribe/confirm?state=error')
  }

  if (data && data.length > 0) redirect('/subscribe/confirm?state=done')

  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id')
    .eq('confirm_token', parsed.data)
    .maybeSingle()

  redirect(existing ? '/subscribe/confirm?state=already' : '/subscribe/confirm?state=unknown')
}
