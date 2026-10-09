"use client"

import { useEffect, useRef } from "react"

export function PortalScrollMotion() {
  const anchor = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const shell = anchor.current?.closest<HTMLElement>(".portal-shell")
    if (!shell || !window.IntersectionObserver) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target as HTMLElement
          element.dataset.visible = "true"
          observer.unobserve(element)
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    )

    const observed = new WeakSet<Element>()
    const register = (root: ParentNode) => {
      if (
        root instanceof HTMLElement &&
        root.matches(".portal-reveal") &&
        !observed.has(root)
      ) {
        observed.add(root)
        observer.observe(root)
      }
      for (const element of root.querySelectorAll<HTMLElement>(".portal-reveal")) {
        if (observed.has(element)) continue
        observed.add(element)
        observer.observe(element)
      }
    }

    register(shell)
    shell.dataset.portalMotion = "true"
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) register(node)
        }
      }
    })
    mutations.observe(shell, { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      observer.disconnect()
      delete shell.dataset.portalMotion
    }
  }, [])

  return <span ref={anchor} className="sr-only" aria-hidden="true" />
}
