import React from "react"

export default function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      fill="#fff"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="X icon"
      {...props}
    >
      {/* black rounded square */}
      <rect width="128" height="128" rx="14" ry="14" fill="#fff" />

      {/* white X logo */}
      <path
        fill="#000"
        d="M95.5 35.8L73.9 62.3l24.6 29.9h-17L64.3 71.4 44.6 92.2H32.5l23.3-26.6L33.5 35.8h17.4l14.8 19.6 17.4-19.6h12.4zM90.3 87.2h6.9L50.5 40.9h-7.4L90.3 87.2z"
      />
    </svg>
  )
}
