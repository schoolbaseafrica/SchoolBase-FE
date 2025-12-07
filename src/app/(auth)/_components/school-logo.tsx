import React from "react"
import Image from "next/image"
import Link from "next/link"

const SchoolLogo = () => {
  return (
    <div>
      <Link href="/">
        <div className="-gap-1.5 mb-8 flex flex-col items-center justify-center">
          <Image src="/assets/logo.svg" alt="School Base Logo" width={50} height={50} />
          <span className="text-accent text-sm font-bold tracking-wider uppercase">
            school base
          </span>
        </div>
      </Link>
    </div>
  )
}

export default SchoolLogo
