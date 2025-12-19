"use client"

import { useSchoolStore } from "@/store/use-school-store"

export function FaqSection() {
  const faqs = useSchoolStore((state) => state.school.faqs) || []
  const copy = useSchoolStore((state) => state.school.sectionsContent)?.faq

  if (!faqs.length) return null

  return (
    <section id="faq" className="bg-white py-16">
      <div className="container space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {copy?.title ?? "Frequently Asked Questions"}
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            {copy?.subtitle ?? "Answers for parents and students."}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div
              key={`${item.question}-${idx}`}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
            >
              <h3 className="text-lg font-semibold">{item.question}</h3>
              <p className="mt-2 text-[var(--text-secondary)]">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
