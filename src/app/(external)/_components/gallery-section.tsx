"use client"

import Image from "next/image"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useSchoolStore } from "@/store/use-school-store"

export function GallerySection() {
  const gallery = useSchoolStore((state) => state.school.gallery)
  const schoolName = useSchoolStore((state) => state.school.shortName)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const copy = useSchoolStore((state) => state.school.sectionsContent)?.gallery
  const galleryFallbacks = [
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561402/why-choose-4_eq1btu.jpg",
      alt: "Campus exterior",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561401/why-choose-1_elwhbe.jpg",
      alt: "Library study",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561401/user-2_alnxyc.jpg",
      alt: "Creative arts session",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561401/user-4_rrzym7.jpg",
      alt: "Science lab activity",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561400/user-3_p8vypo.jpg",
      alt: "School grounds",
    },
    {
      src: "https://res.cloudinary.com/ds6nd4lbj/image/upload/v1767561349/about-2_pfwabt.jpg",
      alt: "Library corner",
    },
  ]

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
            const fallback = galleryFallbacks[index % galleryFallbacks.length]
            const src = failedImages[key] ? fallback.src : item.src
            const alt = failedImages[key] ? fallback.alt : item.alt
            return (
              <figure
                key={key}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm"
              >
                {!loadedImages[key] && (
                  <Skeleton className="absolute inset-0 h-full w-full rounded-2xl bg-white/60" />
                )}
                <Image
                  src={src}
                  alt={alt}
                  width={340}
                  height={240}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  onError={() =>
                    setFailedImages((prev) => ({
                      ...prev,
                      [key]: true,
                    }))
                  }
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
