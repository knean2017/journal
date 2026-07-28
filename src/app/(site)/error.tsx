'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { PageHead } from '@/components/ui/PageHead'

/**
 * The last resort when a page throws. It has to be a client component and it
 * has to be able to render on its own, so it uses nothing that reads content.
 *
 * The digest is the only handle on what went wrong: Next replaces the real
 * message in production so that a stack trace never reaches a browser, and
 * logs the two together on the server. Showing it here is what lets somebody
 * reporting the problem say which error they hit.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <PageHead
        eyebrow="Something went wrong"
        title="This page did not load"
        lead="The fault is ours, not yours. Trying again often works, because most of what breaks here is a passing failure to reach the database."
        maxWidth="22ch"
      />

      <section className="max-w-[1180px] mx-auto px-[clamp(18px,5vw,40px)] pt-9 pb-4">
        <div className="flex gap-[14px] flex-wrap">
          <button type="button" onClick={reset} className="btn-base btn-maroon">
            Try again
          </button>
          <Link href="/" className="btn-base btn-outline">
            Go to the home page
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-7 mb-0 text-[13px] leading-[1.75] text-body-muted">
            If you write to us about this, quote reference{' '}
            <strong className="text-ink">{error.digest}</strong>.
          </p>
        ) : null}
      </section>
    </>
  )
}
