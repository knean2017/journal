import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { armReveal } from '@/lib/reveal'

type Entry = { isIntersecting: boolean; target: Element }
type ObservedCallback = (entries: Entry[], obs: { unobserve: (el: Element) => void }) => void

let observed: Element[] = []
let capturedCallback: ObservedCallback | null = null

class FakeIntersectionObserver {
  constructor(cb: ObservedCallback) {
    capturedCallback = cb
  }
  observe(el: Element) {
    observed.push(el)
  }
  unobserve(el: Element) {
    observed = observed.filter((o) => o !== el)
  }
  disconnect() {
    observed = []
  }
}

function makeElement(top: number): HTMLElement {
  const el = document.createElement('section')
  el.setAttribute('data-reveal', '')
  el.getBoundingClientRect = () => ({ top }) as DOMRect
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  observed = []
  capturedCallback = null
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('armReveal', () => {
  it('leaves above-the-fold elements fully visible and unobserved', () => {
    const el = makeElement(500)
    armReveal()
    expect(el.style.opacity).toBe('')
    expect(el.style.transform).toBe('')
    expect(observed).not.toContain(el)
  })

  it('treats exactly the 92% boundary as below the fold', () => {
    const el = makeElement(920)
    armReveal()
    expect(el.style.opacity).toBe('0')
    expect(observed).toContain(el)
  })

  it('hides and observes below-the-fold elements', () => {
    const el = makeElement(1500)
    armReveal()
    expect(el.style.opacity).toBe('0')
    expect(el.style.transform).toBe('translateY(20px)')
    expect(observed).toContain(el)
  })

  it('reveals an element when it intersects, then unobserves it', () => {
    const el = makeElement(1500)
    armReveal()
    capturedCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: (target) => {
        observed = observed.filter((o) => o !== target)
      },
    })
    expect(el.style.opacity).toBe('1')
    expect(el.style.transform).toBe('none')
    expect(el.style.transition).toBe('opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1)')
    expect(observed).not.toContain(el)
  })

  it('ignores non-intersecting entries', () => {
    const el = makeElement(1500)
    armReveal()
    capturedCallback?.([{ isIntersecting: false, target: el }], { unobserve: () => {} })
    expect(el.style.opacity).toBe('0')
  })

  it('returns a disconnect function that clears observation', () => {
    makeElement(1500)
    const disconnect = armReveal()
    disconnect()
    expect(observed).toHaveLength(0)
  })

  it('does nothing when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const el = makeElement(1500)
    expect(() => armReveal()).not.toThrow()
    expect(el.style.opacity).toBe('')
  })
})
