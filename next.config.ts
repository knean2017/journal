import type { NextConfig } from 'next'

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

const isDev = process.env.NODE_ENV === 'development'

/** The Supabase project, which the browser talks to directly, or nothing. */
const supabaseOrigin = supabaseHost ? `https://${supabaseHost}` : ''

/*
 * Content Security Policy.
 *
 * Deliberately without a nonce. A nonce has to be minted per request, which
 * means every page becomes dynamic, and this site prerenders all fourteen
 * public pages specifically so they answer in single-digit milliseconds. The
 * trade is `unsafe-inline` on scripts, which Next needs for its own hydration
 * payload. That is worth stating plainly: this policy does not stop an
 * injected inline script. What it does stop is that script reaching anywhere,
 * because `default-src 'self'` leaves it nothing to talk to and nowhere to
 * send what it reads.
 *
 * The browser talks to Supabase directly in two places, so its origin is named
 * in `connect-src`: the admin login is an auth call, and a manuscript is
 * uploaded from the browser to storage rather than through a Server Action.
 */
const csp = [
  "default-src 'self'",
  // 'unsafe-eval' is React Refresh in development and is absent from a build.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Tailwind and Next both emit inline style attributes.
  "style-src 'self' 'unsafe-inline'",
  // next/font downloads Google's files at build time and serves them from here.
  "font-src 'self'",
  `img-src 'self' data: blob:${supabaseOrigin ? ` ${supabaseOrigin}` : ''}`,
  `connect-src 'self'${supabaseOrigin ? ` ${supabaseOrigin}` : ''}${isDev ? ' ws: wss:' : ''}`,
  // Nothing on this site is framed, and nothing frames this site.
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  // Stops an injected <base> silently repointing every relative URL.
  "base-uri 'self'",
  // Five forms post to Server Actions here and must post nowhere else.
  "form-action 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

/**
 * Sent with every response.
 *
 * `frame-ancestors` is the one that closes something real: without it the
 * admin login sits in an attacker's iframe, and an editor already holding a
 * session can be made to click through it. X-Frame-Options repeats it for
 * anything too old to read a CSP.
 */
const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send the full URL within the site, the origin only when leaving it.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The site asks for none of these, so nothing it loads may ask either.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
]

const nextConfig: NextConfig = {
  images: {
    // Storage-backed images come from the project's own Supabase host only.
    remotePatterns: supabaseHost
      ? [{ protocol: 'https' as const, hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
  experimental: {
    serverActions: {
      /*
       * The default is 1 MB, which rejected every cover image the editorial
       * office tried to upload. This covers the 8 MB ceiling that
       * lib/admin/actions.ts enforces on images.
       *
       * It is deliberately not 20 MB. The limit applies to every Server
       * Action including the public ones, and a large body is something an
       * unauthenticated caller can send. Manuscripts, the one genuinely large
       * upload, do not travel this way at all: they go straight from the
       * browser to storage. See lib/submissions/actions.ts.
       */
      bodySizeLimit: '10mb',
    },
  },

  // The version string tells a visitor nothing and tells a scanner something.
  poweredByHeader: false,

  async headers() {
    return [
      // Everything, including the admin, the feed, and the sitemap.
      { source: '/:path*', headers: SECURITY_HEADERS },

      /*
       * The brand lockups are the only images on a cold page that are not
       * placeholders, and they are identical on every view. Their filenames are
       * not content-hashed, so this is a day rather than a year, with a week of
       * stale-while-revalidate behind it: a replacement lockup is live for
       * everybody within a day and nobody waits on the network for it meanwhile.
       */
      {
        source: '/brand/:file*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default nextConfig
