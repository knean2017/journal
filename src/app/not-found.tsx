import { SiteChrome } from '@/components/chrome/SiteChrome'
import { NotFoundBody } from '@/components/ui/NotFoundBody'

/**
 * An address matching no route at all. This renders above the (site) layout,
 * so it has to put the chrome around itself.
 */
export default function RootNotFound() {
  return (
    <SiteChrome>
      <NotFoundBody />
    </SiteChrome>
  )
}
