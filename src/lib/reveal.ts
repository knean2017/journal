const TRANSITION = 'opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)'
const ROOT_MARGIN = '0px 0px -12% 0px'
const FOLD_RATIO = 0.92

/**
 * Fades `[data-reveal]` sections up as they enter the viewport.
 *
 * Returns a disconnect function. Elements already within 92% of the viewport
 * height on arrival are skipped entirely and never hidden, so nothing above
 * the fold flashes blank.
 */
export function armReveal(root: ParentNode = document): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {}

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const target = entry.target as HTMLElement
        target.style.transition = TRANSITION
        target.style.opacity = '1'
        target.style.transform = 'none'
        obs.unobserve(target)
      })
    },
    { rootMargin: ROOT_MARGIN },
  )

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight * FOLD_RATIO) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(20px)'
    observer.observe(el)
  })

  return () => observer.disconnect()
}
