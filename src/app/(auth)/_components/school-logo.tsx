import React from "react"
import Link from "next/link"
import Logo from "@/components/logo"

const SchoolLogo = () => {
  return (
    <div>
      <Link href="/">
        <div className="-gap-1.5 mb-8 flex flex-col items-center justify-center">
          <Logo size={40} />
        </div>
      </Link>
    </div>
  )
}

export default SchoolLogo
