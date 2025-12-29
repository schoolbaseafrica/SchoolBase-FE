import React from "react"

export default function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="128"
      height="128"
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Facebook icon"
      {...props}
    >
      {/* white rounded square */}
      <rect width="128" height="128" rx="14" ry="14" fill="#ffffff" />

      {/* black “0” path */}
      <path
        fill="#000000"
        d="M72.2 27H56.8c-8.5 0-15.4 6.9-15.4 15.4v14.6H30v17h11.4V101h17V74h13.3l2-17H58.4V44.1c0-2.8 2.3-5.1 5.1-5.1H72V27z"
      />
    </svg>
  )
}
