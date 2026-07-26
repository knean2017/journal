'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { armReveal } from '@/lib/reveal'

/** Scrolls to top and re-arms the scroll reveal on every navigation. */
export function RevealArmer() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
    return armReveal()
  }, [pathname])

  return null
}
