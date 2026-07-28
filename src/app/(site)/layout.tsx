import { SiteChrome } from '@/components/chrome/SiteChrome'

/**
 * Every public page under this layout is prerendered and then refreshed on a
 * timer, because none of them vary by visitor. Five minutes is the ceiling on
 * how stale a page can go, not the usual wait: the admin calls
 * `revalidatePath('/', 'layout')` on save, so an edit shows up at once.
 */
export const revalidate = 300

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>
}
