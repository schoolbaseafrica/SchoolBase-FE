"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolStore } from "@/store/use-school-store"

export function GallerySection() {
  const gallery = useSchoolStore((state) => state.school.gallery)
  const schoolName = useSchoolStore((state) => state.school.shortName)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const copy = useSchoolStore((state) => state.school.sectionsContent)?.gallery

  return (
    <section id="gallery" className="bg-gray-50 py-16">
      <div className="container space-y-8">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {copy?.title ?? `Life at ${schoolName} School`}
          </h2>
          <p className="text-lg text-[var(--text-secondary)]">
            {copy?.subtitle ?? "Moments that shape our students every day."}
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
                {!loadedImages[key] && (
                  <Skeleton className="absolute inset-0 h-full w-full rounded-2xl bg-white/60" />
                )}
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={340}
                  height={240}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  onLoadingComplete={() =>
                    setLoadedImages((prev) => ({
                      ...prev,
                      [key]: true,
                    }))
                  }
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
