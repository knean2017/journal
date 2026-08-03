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
  /*
   * Declared by hand against files in `public/` rather than left to the
   * `app/icon.png` convention.
   *
   * Google's one hard rule for the favicon it draws next to a search result is
   * that the URL stays stable between crawls, and the convention served it as
   * `/icon.png?icon.<hash>` with a hash that moves when the build does. These
   * paths never move. `/favicon.ico` is here because it 404'd before, and it is
   * still the address a crawler tries when it is not reading the tags.
   *
   * The sizes are the ordinary set rather than the 1000x1000 original, which
   * was valid but meant every browser tab downloaded a 24 KB file to draw 16
   * pixels of it.
   */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  },
  /*
   * The canonical here belongs to the homepage, which declares no metadata of
   * its own. Every other public page sets its own through `pageMetadata`,
   * because a page that does not inherits this one and tells search engines it
   * is a duplicate of the homepage.
   */
  alternates: {
    canonical: '/',
    types: { 'application/atom+xml': [{ url: '/feed.xml', title: SITE_NAME }] },
  },
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
