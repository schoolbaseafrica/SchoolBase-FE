"use client"

import { useState } from "react"
import Image from "next/image"
import { useSchoolStore } from "@/store/use-school-store"

// Default placeholder image for gallery
// Using the Study Bridge default landing page image
const DEFAULT_GALLERY_IMAGE = "/assets/Hero-img (2).png"

export function GallerySection() {
  const gallery = useSchoolStore((state) => state.school.gallery)
  const schoolName = useSchoolStore((state) => state.school.shortName)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  // Use default image if original fails to load or is missing
  const getImageSrc = (imageSrc: string, index: number) => {
    if (imageErrors[index] || !imageSrc) {
      return DEFAULT_GALLERY_IMAGE
    }
    return imageSrc
  }

  // If no gallery items, don't render the section
  if (!gallery || gallery.length === 0) {
    return null
  }

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
                  src={getImageSrc(item.src, index)}
                  alt={item.alt || "Gallery image"}
                  width={340}
                  height={240}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  onError={() => handleImageError(index)}
                  unoptimized={getImageSrc(item.src, index).startsWith("/assets")}
                />
                <figcaption className="sr-only">{item.alt || "Gallery image"}</figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
