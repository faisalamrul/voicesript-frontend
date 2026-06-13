import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const getFocusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))

    getFocusable()[0]?.focus()

    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    container.addEventListener('keydown', trap)
    return () => {
      container.removeEventListener('keydown', trap)
      previouslyFocused?.focus()
    }
  }, [])

  return ref
}
