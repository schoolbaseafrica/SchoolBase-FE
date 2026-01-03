"use client"

import { useSchoolStore } from "@/store/use-school-store"
import { getLandingIcon } from "@/lib/landing-icons"

export function FeaturesSection() {
  const features = useSchoolStore((state) => state.school.features) || []
  const copy = useSchoolStore((state) => state.school.sectionsContent)?.features

  if (!features.length) return null

  return (
    <section id="features" className="bg-white py-16">
      <div className="container space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {copy?.title ?? "Why families choose us"}
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            {copy?.subtitle ?? "A modern learning experience built for your community."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.slice(0, 6).map((item, idx) => {
            const Icon = getLandingIcon(item.icon)
            return (
              <article
                key={`${item.title}-${idx}`}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="text-accent mb-4 inline-flex rounded-xl bg-[var(--tint)] p-3">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
