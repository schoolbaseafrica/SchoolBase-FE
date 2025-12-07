import React from "react"

interface RedGridIconProps {
  width?: number
  height?: number
  className?: string
  color?: string
}

export const LogoSvg: React.FC<RedGridIconProps> = ({
  width = 100,
  height = 100,
  className = "",
  color = "#DA3743",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 140 140"
      className={className}
    >
      {/* Top-left rounded square */}
      <rect x="24" y="24" width="36" height="36" rx="6" ry="6" fill={color} />

      {/* Top-right rounded square */}
      <rect x="80" y="24" width="36" height="36" rx="6" ry="6" fill={color} />

      {/* Center circle */}
      <circle cx="70" cy="70" r="8" fill={color} />

      {/* Bottom-left rounded square */}
      <rect x="24" y="80" width="36" height="36" rx="6" ry="6" fill={color} />

      {/* Bottom-right rounded square */}
      <rect x="80" y="80" width="36" height="36" rx="6" ry="6" fill={color} />
    </svg>
  )
}
