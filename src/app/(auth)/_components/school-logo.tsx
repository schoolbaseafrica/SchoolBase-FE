"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSchoolStore } from "@/store/use-school-store"
import { LogoSvg } from "../../../../public/svgs/logo-svg"

const SchoolLogo = () => {
  const logo = useSchoolStore((state) => state.school.logo)
  const shortName = useSchoolStore((state) => state.school.shortName)
  const brand = useSchoolStore((state) => state.school.brand)
  const [imageError, setImageError] = useState(false)
  
  // Default logo fallback
  const defaultLogo = "/assets/logo.png"
  
  // Detect if logo URL is external (backend URL) - disable optimization for external images
  const isExternalLogo =
    logo.full?.startsWith("http://") || logo.full?.startsWith("https://")
  
  // Use logo if available and no error, otherwise use default or SVG
  const logoToUse = logo.full && !imageError ? logo.full : defaultLogo
  const useSvgFallback = imageError || !logo.full || logoToUse === defaultLogo

  return (
    <Link href="/" className="mb-4 flex flex-col items-center text-center">
      {useSvgFallback ? (
        <LogoSvg width={64} height={64} color={brand.primary} />
      ) : (
        <Image
          src={logoToUse}
          alt={`${shortName} logo`}
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
          unoptimized={isExternalLogo || useSvgFallback}
          onError={() => setImageError(true)}
        />
      )}
      <span
        className="text-sm font-bold tracking-wider uppercase"
        style={{ color: brand.primary }}
      >
        {shortName}
      </span>
    </Link>
  )
}

export default SchoolLogo
