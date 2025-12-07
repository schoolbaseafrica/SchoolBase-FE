import { LogoSvg } from "../../public/svgs/logo-svg"

interface LogoProps {
  size?: number
  iconColor?: string
  textColor?: string
  className?: string
}

const Logo: React.FC<LogoProps> = ({
  size = 28,
  iconColor = "#DA3743",
  textColor = "#DA3743",
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoSvg width={size} height={size} color={iconColor} className="shrink-0" />

      <span
        className="font-bold tracking-wider uppercase"
        style={{ color: textColor, fontSize: size * 0.5 }}
      >
        schoolbase
      </span>
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
