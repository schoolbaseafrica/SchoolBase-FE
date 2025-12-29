"use client"

import Image from "next/image"
import { LogoSvg } from "../../public/svgs/logo-svg"
import { useSchoolStore } from "@/store/use-school-store"

interface LogoProps {
  size?: number
  iconColor?: string
  textColor?: string
  className?: string
  showName?: boolean
}

const Logo: React.FC<LogoProps> = ({
  size = 28,
  iconColor,
  textColor,
  className = "",
  showName = true,
}) => {
  const logo = useSchoolStore((state) => state.school.logo)
  const shortName = useSchoolStore((state) => state.school.shortName)
  const brand = useSchoolStore((state) => state.school.brand)

  const resolvedIconColor = iconColor ?? brand.primary
  const resolvedTextColor = textColor ?? brand.primary
  // Detect if logo URL is external (backend URL) - disable optimization for external images
  const isExternalLogo =
    logo.full?.startsWith("http://") || logo.full?.startsWith("https://")

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {logo.full ? (
        <Image
          src={logo.full}
          alt={`${shortName} logo`}
          width={size + 8}
          height={size + 8}
          className={`rounded-md object-contain size-${size + 8}`}
          unoptimized={isExternalLogo}
        />
      ) : (
        <LogoSvg
          width={size}
          height={size}
          color={resolvedIconColor}
          className="shrink-0"
        />
      )}

      {showName && (
        <span
          className="font-bold tracking-wider uppercase"
          style={{ color: resolvedTextColor, fontSize: size * 0.5 }}
        >
          {shortName}
        </span>
      )}
    </div>
  )
}

export default Logo

// import React from "react"
// import { LogoSvg } from "../../public/svgs/logo-svg"

// interface LogoProps {
//   size?: number
//   iconColor?: string
//   textColor?: string
//   className?: string
// }

// const Logo: React.FC<LogoProps> = () => {
//   return (
//     <div className="flex items-center">
//       <LogoSvg className="h-7 w-7" />

//       <span className="text-accent text-sm font-bold tracking-wider uppercase md:text-base">
//         schoolbase
//       </span>
//     </div>
//   )
// }

// export default Logo
