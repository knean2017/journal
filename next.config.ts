import type { NextConfig } from 'next'

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null

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
}

export default nextConfig
