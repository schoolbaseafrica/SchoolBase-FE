"use client"

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
  const name = useSchoolStore((state) => state.school.shortName)

  return (
    <section
      id="home"
      className="container grid gap-10 py-12 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-20"
    >
      <div className="max-w-md space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl leading-tight font-bold text-balance sm:text-5xl">
            {hero.heading.replace("Study Bridge School", name)}
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">{hero.body}</p>
        </div>
        <Button asChild>
          <a href={hero.ctaHref}>{hero.ctaLabel}</a>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {hero.images.slice(0, 3).map((image, index) => (
          <div
            key={image.src}
            className={`relative overflow-hidden rounded-2xl bg-gray-50 shadow-md ${imageLayout[index]?.className || ""}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 50vw, 40vw"
              priority={imageLayout[index]?.priority}
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
