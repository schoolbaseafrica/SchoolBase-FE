"use client"

import Image from "next/image"
import Link from "next/link"
import { useSchoolStore } from "@/store/use-school-store"
import { LogoSvg } from "../../../../public/svgs/logo-svg"

const SchoolLogo = () => {
  const logo = useSchoolStore((state) => state.school.logo)
  const shortName = useSchoolStore((state) => state.school.shortName)
  const brand = useSchoolStore((state) => state.school.brand)
  // Detect if logo URL is external (backend URL) - disable optimization for external images
  const isExternalLogo =
    logo.full?.startsWith("http://") || logo.full?.startsWith("https://")

  return (
    <Link href="/" className="mb-4 flex flex-col items-center text-center">
      {logo.full ? (
        <Image
          src={logo.full}
          alt={`${shortName} logo`}
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
          unoptimized={isExternalLogo}
        />
      ) : (
        <LogoSvg width={64} height={64} color={brand.primary} />
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
