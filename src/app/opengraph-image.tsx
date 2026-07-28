import { ImageResponse } from 'next/og'
import { SITE_DESCRIPTION } from '@/lib/site'

/**
 * The card a chat app or a search result draws for a link to this site.
 *
 * Drawn rather than photographed: the brand lockup is a transparent PNG, and
 * transparency comes out black in most clients. This is the journal's own
 * palette at the 1200x630 every platform expects.
 *
 * No custom font is loaded. Fetching the served woff2 at build time works
 * until it does not, and a broken build over a social card is a bad trade.
 */
export const alt = 'International Collegiate Research Review'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#5D1D21',
          color: '#F7F4EF',
          padding: '72px 80px',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#C0A265',
            fontWeight: 700,
          }}
        >
          Open access · Est. 2026
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 28,
            fontSize: 78,
            lineHeight: 1.12,
            letterSpacing: -1,
          }}
        >
          <span>International Collegiate</span>
          <span>Research Review</span>
        </div>

        <div style={{ display: 'flex', width: 132, height: 4, background: '#C0A265', marginTop: 36 }} />

        <div
          style={{
            marginTop: 32,
            fontSize: 27,
            lineHeight: 1.5,
            color: '#F7F4EF',
            opacity: 0.82,
            maxWidth: 880,
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
    ),
    size,
  )
}
