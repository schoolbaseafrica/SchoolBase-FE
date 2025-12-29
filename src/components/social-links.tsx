import React from "react"
import Link from "next/link"
import FacebookIcon from "../../public/svgs/facebook-icon"
import XIcon from "../../public/svgs/x-icon"
import InstagramIcon from "../../public/svgs/instagram-icon"

const SocialLinks = () => {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="#"
        // href="https://www.facebook.com/share/17MGU2hVmP/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FacebookIcon className="size-7 fill-white text-white transition-transform duration-300 hover:scale-110 active:scale-95" />
      </Link>
      <Link
        href="#"
        // href="https://www.instagram.com/schoolbase.ng?igsh=MXRxczAxcWszcWNsMQ=="
        target="_blank"
        rel="noopener noreferrer"
      >
        <InstagramIcon className="size-7 text-white transition-transform duration-300 hover:scale-110 active:scale-95" />
      </Link>
      {/* <Linkedin className="size-5 text-white" /> */}
      <Link
        href="#"
        // href="https://x.com/school_baseng?t=YPepx9_DRCqqo5dh0DeEbQ&s=09"
        target="_blank"
        rel="noopener noreferrer"
      >
        <XIcon className="size-7 fill-white text-white transition-transform duration-300 ease-out hover:scale-110 active:scale-95" />
      </Link>
    </div>
  )
}

export default SocialLinks
