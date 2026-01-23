"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useSchoolStore } from "@/store/use-school-store"

const imageLayout = [
  {
    className: "row-span-2 h-[300px] sm:h-[400px] lg:h-[536px]",
    priority: true,
  },
  {
    className: "h-[142px] sm:h-[192px] lg:h-[260px]",
  },
  {
    className: "h-[142px] sm:h-[192px] lg:h-[260px]",
  },
]

export function HeroSection() {
  const hero = useSchoolStore((state) => state.school.hero)
  const schoolName = useSchoolStore((state) => state.school.name)
  const shortName = useSchoolStore((state) => state.school.shortName)
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({})

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  // Use images directly from store (which already includes defaults from defaultSchoolProfile)
  // Filter out empty/invalid images, but keep the structure
  const validImages = (hero.images || []).filter(img => img?.src && img.src.trim() !== "")
  
  // Take first 3 valid images from store (store already has defaults if no custom images)
  const imagesToDisplay = validImages.slice(0, 3)
  
  // If we have fewer than 3 images, pad with the last image to maintain layout
  while (imagesToDisplay.length < 3 && imagesToDisplay.length > 0) {
    imagesToDisplay.push(imagesToDisplay[imagesToDisplay.length - 1])
  }
  
  // Use image src if available and no error
  const getImageSrc = (imageSrc: string, index: number) => {
    if (imageErrors[index] || !imageSrc || imageSrc.trim() === "") {
      return null
    }
    return imageSrc
  }

  return (
    <section
      id="home"
      className="container grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-20"
    >
      <div className="max-w-md space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl leading-tight font-bold text-balance sm:text-5xl">
            {hero.heading.replace("Study Bridge School", schoolName)}
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">{hero.body}</p>
        </div>
        <Button asChild>
          <a href={hero.ctaHref}>{hero.ctaLabel}</a>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {imagesToDisplay.map((image, index) => {
          const imageSrc = getImageSrc(image.src, index)
          // Skip rendering if no valid image source
          if (!imageSrc) {
            return null
          }
          return (
            <div
              key={`${image.src}-${index}`}
              className={`relative overflow-hidden rounded-2xl bg-gray-50 shadow-md ${imageLayout[index]?.className || ""}`}
            >
              <Image
                src={imageSrc}
                alt={image.alt || "School image"}
                fill
                sizes="(max-width: 768px) 50vw, 40vw"
                priority={imageLayout[index]?.priority}
                className="object-cover transition-transform duration-500 hover:scale-105"
                onError={() => handleImageError(index)}
                unoptimized={imageSrc.startsWith("/landing/") || imageSrc.startsWith("/assets/")}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
