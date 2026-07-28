/**
 * The site's own address, for canonical links, the sitemap, and the cards that
 * chat apps draw when somebody pastes a link. Those three need an absolute URL
 * and there is no way to derive one from inside a page that is prerendered.
 *
 * `NEXT_PUBLIC_SITE_URL` is the setting; `URL` is what Netlify puts in the
 * build environment on its own, so a Netlify deploy is usually right without
 * anybody doing anything. The last resort is localhost, which is deliberately
 * useless in production: a wrong absolute URL that looks plausible is far
 * harder to notice than one that obviously is not.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  'http://localhost:3000'
).replace(/\/+$/, '')

export const SITE_NAME = 'International Collegiate Research Review'

export const SITE_DESCRIPTION =
  'An independent, open-access journal publishing undergraduate and graduate research across five sections.'

/** Absolute URL for a site-relative path. */
export function absolute(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
