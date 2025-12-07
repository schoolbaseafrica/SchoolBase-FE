import React from "react"

export default function NotePad({
  stroke = "currentColor",
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="19"
      viewBox="0 0 17 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M14.3333 9.75V5C14.3333 3.59987 14.3333 2.8998 14.0609 2.36502C13.8212 1.89462 13.4387 1.51217 12.9683 1.27248C12.4335 1 11.7335 1 10.3333 1H5C3.59987 1 2.8998 1 2.36502 1.27248C1.89462 1.51217 1.51217 1.89462 1.27248 2.36502C1 2.8998 1 3.59987 1 5V13.6667C1 15.0668 1 15.7669 1.27248 16.3016C1.51217 16.772 1.89462 17.1545 2.36502 17.3942C2.8998 17.6667 3.59987 17.6667 5 17.6667H7.66667M9.33333 8.5H4.33333M6 11.8333H4.33333M11 5.16667H4.33333M9.75 15.1667L11.4167 16.8333L15.1667 13.0833"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
