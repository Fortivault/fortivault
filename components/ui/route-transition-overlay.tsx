"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"

function isInternalHref(href: string) {
  try {
    if (href.startsWith("/")) return true
    const url = new URL(href, typeof window !== "undefined" ? window.location.href : "http://localhost")
    return url.origin === (typeof window !== "undefined" ? window.location.origin : url.origin)
  } catch {
    return false
  }
}

export function RouteTransitionOverlay() {
  const pathname = usePathname()
  const [active, setActive] = useState(false)
  const deactivateTimer = useRef<number | null>(null)

  // When the pathname changes, fade out overlay smoothly
  useEffect(() => {
    if (!active) return
    if (deactivateTimer.current) window.clearTimeout(deactivateTimer.current)
    deactivateTimer.current = window.setTimeout(() => setActive(false), 250) // allow a short fade
    return () => {
      if (deactivateTimer.current) window.clearTimeout(deactivateTimer.current)
    }
  }, [pathname, active])

  // Capture clicks on internal links/buttons and show overlay immediately
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return
      if (e.button !== 0) return // only left click
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return // new tab, etc.

      let el = e.target as HTMLElement | null
      while (el && !(el instanceof HTMLAnchorElement)) {
        el = el.parentElement
      }
      const anchor = el as HTMLAnchorElement | null
      if (anchor && anchor.getAttribute) {
        const href = anchor.getAttribute("href") || ""
        const target = anchor.getAttribute("target")
        if (href && !href.startsWith("#") && (!target || target === "_self") && isInternalHref(href)) {
          // Show overlay; Next.js will intercept and perform SPA navigation
          setActive(true)
        }
      }
    }

    window.addEventListener("click", onClick, true) // capture phase for snappy feedback
    return () => window.removeEventListener("click", onClick, true)
  }, [])

  const overlayClasses = useMemo(
    () =>
      `fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        active ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`,
    [active],
  )

  return (
    <div className={overlayClasses} aria-hidden={!active} aria-live="polite">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      <div className="relative rounded-full p-4 bg-card shadow-xl border">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  )
}
