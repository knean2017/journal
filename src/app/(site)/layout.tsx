import { SiteChrome } from '@/components/chrome/SiteChrome'
import { JsonLd } from '@/components/seo/JsonLd'
import { getConfig } from '@/lib/content'
import { journalSchema, resolveIssn } from '@/lib/seo'

/**
 * Every public page under this layout is prerendered and then refreshed on a
 * timer, because none of them vary by visitor. Five minutes is the ceiling on
 * how stale a page can go, not the usual wait: the admin calls
 * `revalidatePath('/', 'layout')` on save, so an edit shows up at once.
 */
export const revalidate = 300

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfig()

  /*
   * The journal described once, here, rather than on each page: it is the
   * record every article's own markup points back at, and it is what lets a
   * search engine read the site as one publication instead of fifteen
   * unrelated documents. The ISSN joins it the day registration completes,
   * with no further change.
   */
  return (
    <SiteChrome>
      <JsonLd data={journalSchema({ issn: resolveIssn(config.issnStatus) })} />
      {children}
    </SiteChrome>
  )
}
