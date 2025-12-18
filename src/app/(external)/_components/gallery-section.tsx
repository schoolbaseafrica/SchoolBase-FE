"use client"

import Image from "next/image"
import { useSchoolStore } from "@/store/use-school-store"

export function GallerySection() {
  const gallery = useSchoolStore((state) => state.school.gallery)
  const schoolName = useSchoolStore((state) => state.school.shortName)

  return (
    <section id="gallery" className="bg-gray-50 py-16">
      <div className="container space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Life at {schoolName} School
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            Moments that shape our students every day.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {gallery.map((item, index) => {
            const key = `${item.src}-${index}`
            return (
              <figure
                key={key}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={340}
                  height={240}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <figcaption className="sr-only">{item.alt}</figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
