"use client"

import { useSchoolStore } from "@/store/use-school-store"

export function AboutSection() {
  const copy = useSchoolStore((state) => state.school.sectionsContent)?.about

  if (!copy?.title && !copy?.subtitle) return null

  return (
    <section id="about" className="bg-white py-16">
      <div className="container space-y-3 text-center md:max-w-3xl">
        <h2 className="text-3xl font-semibold sm:text-4xl">
          {copy?.title ?? "About our school"}
        </h2>
        <p className="text-lg leading-relaxed text-[var(--text-secondary)]">
          {copy?.subtitle ??
            "We blend excellent teaching with the technology families expect every day."}
        </p>
      </div>
    </section>
  )
}
