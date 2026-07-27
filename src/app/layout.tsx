import type { Metadata } from 'next'
import { Libre_Baskerville, Lato } from 'next/font/google'
import '@/styles/globals.css'

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-libre-baskerville',
  display: 'swap',
})

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'International Collegiate Research Review',
  description:
    'An independent, open-access journal publishing undergraduate and graduate research across five sections.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${libreBaskerville.variable} ${lato.variable}`}>
      <body>{children}</body>
    </html>
  )
}
