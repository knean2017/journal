import { Footer } from '@/components/chrome/Footer'
import { Masthead } from '@/components/chrome/Masthead'
import { Nav } from '@/components/chrome/Nav'
import { RevealArmer } from '@/components/chrome/RevealArmer'
import { ToastProvider } from '@/components/chrome/ToastProvider'
import { TopStrip } from '@/components/chrome/TopStrip'
import { getConfig } from '@/lib/content'

/**
 * Masthead, nav and footer around a page.
 *
 * A component rather than only the (site) layout, because the not-found page
 * for an address that matches no route at all renders above that layout and
 * would otherwise arrive with no way back into the site.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const config = await getConfig()

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        <TopStrip />
        <Masthead />
        <Nav deadline={config.deadline} contactEmail={config.contactEmail} />
        <RevealArmer />
        <main className="flex-1">{children}</main>
        <Footer contactEmail={config.contactEmail} />
      </div>
    </ToastProvider>
  )
}
