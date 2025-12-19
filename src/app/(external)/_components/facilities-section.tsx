"use client"

import { useSchoolStore } from "@/store/use-school-store"
import { Building2 } from "lucide-react"

export function FacilitiesSection() {
  const facilities = useSchoolStore((state) => state.school.facilities) || []
  const copy = useSchoolStore((state) => state.school.sectionsContent)?.facilities

  if (!facilities.length) return null

  return (
    <section id="facilities" className="bg-gray-50 py-16">
      <div className="container space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {copy?.title ?? "Our Facilities"}
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            {copy?.subtitle ?? "Spaces that inspire learning and creativity."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {facilities.slice(0, 6).map((item, idx) => (
            <article
              key={`${item.title}-${idx}`}
              className="group rounded-2xl border border-transparent bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="text-accent mb-4 inline-flex rounded-xl bg-[var(--tint)] p-3">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
