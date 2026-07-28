import type { MetadataRoute } from 'next'
import { absolute } from '@/lib/site'

/**
 * Everything public is open to crawlers.
 *
 * The editorial office is deliberately not named here. Its address is
 * configurable precisely so that it is not advertised, and a `Disallow` line
 * is a published list of the paths worth trying. The admin keeps crawlers out
 * the way that actually works: every page under it carries `noindex`, and
 * every one of them requires a session anyway. `/admin` is listed only because
 * it is the internal tree, which answers 404 to the outside world regardless.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/admin' }],
    sitemap: absolute('/sitemap.xml'),
  }
}
