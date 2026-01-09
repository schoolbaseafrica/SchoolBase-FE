"use client"

import { useState } from "react"
import Image from "next/image"
import { Quote, User } from "lucide-react"
import { useSchoolStore } from "@/store/use-school-store"

// Default placeholder for testimonial avatars
const DEFAULT_AVATAR = "/assets/images/auth/user-icon.png"

export function TestimonialsSection() {
  const testimonials = useSchoolStore((state) => state.school.testimonials)
  const schoolName = useSchoolStore((state) => state.school.shortName)
  const brand = useSchoolStore((state) => state.school.brand)
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({})

  const handleAvatarError = (name: string) => {
    setAvatarErrors((prev) => ({ ...prev, [name]: true }))
  }

  // Use default avatar if original fails to load or is missing
  const getAvatarSrc = (avatarSrc: string, name: string) => {
    if (avatarErrors[name] || !avatarSrc) {
      return DEFAULT_AVATAR
    }
    return avatarSrc
  }

  // If no testimonials, don't render the section
  if (!testimonials || testimonials.length === 0) {
    return null
  }

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
          {testimonials.map((testimonial) => {
            const avatarSrc = getAvatarSrc(testimonial.avatar, testimonial.name)
            const hasError = avatarErrors[testimonial.name] || !testimonial.avatar
            
            return (
              <article
                key={testimonial.name}
                className="flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)]"
              >
                <Quote className="text-accent h-6 w-6" />
                <p className="flex-1 text-base leading-relaxed text-[var(--text-secondary)]">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  {hasError ? (
                    <div
                      className="size-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${brand.primary}20` }}
                    >
                      <User
                        className="size-6"
                        style={{ color: brand.primary }}
                      />
                    </div>
                  ) : (
                    <Image
                      src={avatarSrc}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-full object-cover"
                      onError={() => handleAvatarError(testimonial.name)}
                      unoptimized={avatarSrc.startsWith("/assets")}
                    />
                  )}
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
