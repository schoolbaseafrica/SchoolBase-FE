"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useSchoolStore } from "@/store/use-school-store"

const imageLayout = [
  { className: "row-span-2", size: 460 },
  { className: "", size: 460 },
  { className: "", size: 460 },
]

export function HeroSection() {
  const hero = useSchoolStore((state) => state.school.hero)
  const name = useSchoolStore((state) => state.school.shortName)

  return (
    <section
      id="home"
      className="container grid gap-10 py-10 lg:grid-cols-2 lg:items-center lg:gap-14"
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

      <div className="grid grid-cols-2 gap-4 lg:gap-6">
        {hero.images.slice(0, 3).map((image, index) => (
          <div
            key={image.src}
            className={`relative overflow-hidden rounded-2xl bg-[var(--tint)] shadow-sm ${imageLayout[index]?.className || ""}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={imageLayout[index]?.size || 320}
              height={imageLayout[index]?.size || 320}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
