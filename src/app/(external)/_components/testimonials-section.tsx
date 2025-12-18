"use client"

import Image from "next/image"
import { Quote } from "lucide-react"
import { useSchoolStore } from "@/store/use-school-store"

export function TestimonialsSection() {
  const testimonials = useSchoolStore((state) => state.school.testimonials)
  const schoolName = useSchoolStore((state) => state.school.shortName)

  return (
    <section id="testimonials" className="bg-white py-16">
      <div className="container space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">Testimonials</h2>
          <p className="text-lg text-[var(--text-secondary)]">
            What families love about {schoolName}.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
            >
              <Quote className="text-accent h-6 w-6" />
              <p className="flex-1 text-base leading-relaxed text-[var(--text-secondary)]">
                “{testimonial.quote}”
              </p>
              <div className="flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
