"use client"

import { Button } from "@/components/ui/button"
import { useSchoolStore } from "@/store/use-school-store"

export function CtaSection() {
  const cta = useSchoolStore((state) => state.school.cta)

  return (
    <section className="mx-auto max-w-6xl py-14">
      <div className="container">
        <div className="bg-accent rounded-3xl px-8 py-12 text-white shadow-lg sm:px-12 lg:px-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="space-y-3">
              <h3 className="text-3xl font-semibold lg:text-4xl">{cta.heading}</h3>
              <p className="text-lg text-white/90">{cta.body}</p>
            </div>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <a href={cta.ctaHref}>{cta.ctaLabel}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
