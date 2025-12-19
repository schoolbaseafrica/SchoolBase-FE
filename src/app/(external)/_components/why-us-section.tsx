"use client"

import { useSchoolStore } from "@/store/use-school-store"

export function WhyUsSection() {
  const copy = useSchoolStore((state) => state.school.sectionsContent)?.whyUs

  if (!copy?.title && !copy?.subtitle) return null

  return (
    <section id="why-us" className="bg-gray-50 py-16">
      <div className="container space-y-3 text-center md:max-w-3xl">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          {copy?.title ?? "Why choose us"}
        </h2>
        <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
          {copy?.subtitle ??
            "From safety to academics and technology, everything is built to support your community."}
        </p>
      </div>
    </section>
  )
}
