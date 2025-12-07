"use client"

import React from "react"

interface LoadingProps {
  size?: number
  color?: string
  text?: string
  showText?: boolean
}

export default function TimetableLoading({
  size = 60,
  color = "#DA3743",
  text = "Loading timetable...",
  showText = true,
}: LoadingProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-lg border border-[#E0E0E0] bg-white">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 140 140"
          className="animate-spin"
          style={{ animationDuration: "2s" }}
        >
          {/* Top-left rounded square */}
          <rect
            x="24"
            y="24"
            width="36"
            height="36"
            rx="6"
            ry="6"
            fill={color}
            opacity="0.9"
          />
          {/* Top-right rounded square */}
          <rect
            x="80"
            y="24"
            width="36"
            height="36"
            rx="6"
            ry="6"
            fill={color}
            opacity="0.9"
          />
          {/* Center circle */}
          <circle cx="70" cy="70" r="8" fill={color} opacity="1" />
          {/* Bottom-left rounded square */}
          <rect
            x="24"
            y="80"
            width="36"
            height="36"
            rx="6"
            ry="6"
            fill={color}
            opacity="0.9"
          />
          {/* Bottom-right rounded square */}
          <rect
            x="80"
            y="80"
            width="36"
            height="36"
            rx="6"
            ry="6"
            fill={color}
            opacity="0.9"
          />
        </svg>
      </div>
      {showText && <p className="text-primary animate-pulse font-medium">{text}</p>}
    </div>
  )
}
