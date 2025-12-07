import React from "react"

export default function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Instagram icon"
      {...props}
    >
      {/* white rounded square */}
      <rect width="128" height="128" rx="14" ry="14" fill="#ffffff" />

      {/* black Instagram icon */}
      <rect
        x="30"
        y="30"
        width="68"
        height="68"
        rx="17"
        fill="none"
        stroke="#000000"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="64"
        cy="64"
        r="16"
        fill="none"
        stroke="#000000"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="83" cy="45" r="5" fill="#000000" />
    </svg>
  )
}
