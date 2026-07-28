import type { Metadata } from 'next'
import { Libre_Baskerville, Lato } from 'next/font/google'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
import '@/styles/globals.css'

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre-baskerville',
  display: 'swap',
})

/*
 * Every weight and style declared here is a separate file that gets preloaded
 * before the first paint, so the list is kept to what the design actually
 * draws. Lato black is not used anywhere; the heavy nav and eyebrow labels are
 * 700. Both italics stay: the hero sets one in the serif, and article
 * references set journal titles in the sans.
 */
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
  display: 'swap',
})

/**
 * The defaults every page inherits.
 *
 * `title.template` is why each page sets only its own name: "Submit" arrives
 * in a browser tab and a search result as "Submit | ICRR". `metadataBase` is
 * what turns the relative image path below into the absolute URL that a chat
 * app needs before it will draw a card.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}`,
    template: '%s | ICRR',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${libreBaskerville.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  )
}
