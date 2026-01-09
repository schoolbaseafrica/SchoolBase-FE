"use client"

import { useState } from "react"
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
  const [imageError, setImageError] = useState(false)

  const resolvedIconColor = iconColor ?? brand.primary
  const resolvedTextColor = textColor ?? brand.primary
  
  // Default logo fallback
  const defaultLogo = "/assets/logo.png"
  const logoToUse = logo.full || defaultLogo
  
  // Detect if logo URL is external (backend URL) - disable optimization for external images
  const isExternalLogo =
    logoToUse?.startsWith("http://") || logoToUse?.startsWith("https://")
  const isUsingDefault = !logo.full || logoToUse === defaultLogo

  // Use SVG fallback if image fails to load or no logo URL provided
  const useSvgFallback = imageError || !logoToUse

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {useSvgFallback ? (
        <LogoSvg
          width={size}
          height={size}
          color={resolvedIconColor}
          className="shrink-0"
        />
      ) : (
        <Image
          src={logoToUse}
          alt={`${shortName} logo`}
          width={size + 8}
          height={size + 8}
          className={`rounded-md object-contain`}
          style={{ width: size + 8, height: size + 8 }}
          unoptimized={isExternalLogo || isUsingDefault}
          onError={() => setImageError(true)}
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
