"use client"

import React from "react"
import Link from "next/link"
import { Mail, Phone, Home } from "lucide-react"
import Logo from "./logo"
// import SocialLinks from "./social-links"
import { usePathname } from "next/navigation"

const product = [
  { name: "Features", href: "/features" },
  { name: "About", href: "/about" },
  { name: "How it works", href: "/how-it-works" },
]
const support = [
  { name: "FAQs", href: "/faq" },
  { name: "Contact Us", href: "/contact-us" },
]

const Footer = () => {
  const pathname = usePathname()

  return (
    <footer className="bg-black text-white">
      <div className="container flex flex-col gap-6 py-8 lg:py-12">
        <section className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          <section className="flex w-full max-w-100 flex-col gap-5 lg:justify-center">
            <Link href="/">
              <div className="flex items-center gap-4">
                <Logo iconColor="white" textColor="white" size={40} />
              </div>
            </Link>
            <p className="text-lg leading-8 text-white/80 lg:text-xl">
              The Modern Way School Run In{" "}
              {pathname?.includes("ng") ? "Nigeria" : "Africa"}. Manage attendance,
              results, timetables, fees, and NFC, all in one place
            </p>

            {/* <SocialLinks /> */}
          </section>

          <section className="flex flex-col items-start gap-5 lg:w-auto lg:pt-10">
            <h3 className="text-lg font-bold lg:text-xl">Product</h3>
            <ul className="flex flex-col gap-4">
              {product.map((link) => (
                <li key={`${link.name}-${link.href}`}>
                  <Link href={link.href} className="hover:underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col items-start gap-5 lg:w-auto lg:pt-10">
            <h3 className="text-lg font-bold lg:text-xl">Support</h3>
            <ul className="flex flex-col gap-4">
              {support.map((link) => (
                <li key={`${link.name}-${link.href}`}>
                  <Link href={link.href} className="hover:underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col items-start gap-5 lg:w-auto lg:pt-10">
            <h3 className="text-lg font-bold lg:text-xl">Get in Touch</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3">
                <Mail size={20} className="shrink-0" />
                <a
                  href="mailto:openschoolportalhq@gmail.com"
                  className="wrap-break-word hover:text-white/90 hover:underline"
                >
                  openschoolportalhq@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="shrink-0" />
                <a href="tel:+2341234567890">+234 123 456 7890</a>
              </li>
              <li className="flex items-start gap-3">
                <Home size={20} className="mt-1 shrink-0" />
                <address className="wrap-break-word not-italic">
                  123 School Street, Lagos, Nigeria
                </address>
              </li>
            </ul>
          </section>
        </section>

        <section className="flex flex-col items-center justify-between border-t border-white/20 pt-6 md:flex-row md:items-center">
          <p className="text-[#fafafa]">Copyright &copy; {new Date().getFullYear()}</p>
          <div className="flex items-center gap-6 text-[#FAFAFA] [&_p]:cursor-pointer">
            <Link href="/terms">
              <p>Terms & Conditions</p>
            </Link>
            <Link href="/privacy">
              <p>Privacy Policy</p>
            </Link>
          </div>
        </section>
      </div>
    </footer>
  )
}

export default Footer
