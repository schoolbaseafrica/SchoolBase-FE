"use client"

import React from "react"
import Link from "next/link"
import { Mail, Phone, Home, Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import Logo from "./logo"
import { usePathname } from "next/navigation"
import { useSchoolStore } from "@/store/use-school-store"

const socialIconMap = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
}

const Footer = () => {
  const pathname = usePathname()
  const school = useSchoolStore((state) => state.school)
  const navLinks = school.navLinks

  return (
    <footer className="bg-black text-white">
      <div className="container space-y-8 py-10 lg:space-y-12 lg:py-14">
        <section className="grid gap-10 lg:grid-cols-4">
          <section className="space-y-4">
            <Link href="/">
              <Logo iconColor="white" textColor="white" size={40} />
            </Link>
            <p className="text-white/80">{school.description}</p>
            <div className="flex items-center gap-4">
              {Object.entries(school.socials)
                .filter(([, value]) => Boolean(value))
                .map(([key, value]) => {
                  const Icon = socialIconMap[key as keyof typeof socialIconMap]
                  if (!Icon || !value) return null
                  return (
                    <Link
                      key={key}
                      href={value}
                      aria-label={key}
                      className="text-white/70 transition hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  )
                })}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold lg:text-xl">Quick links</h3>
            <ul className="space-y-3">
              {navLinks.slice(0, 3).map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="hover:text-white/80">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold lg:text-xl">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="hover:text-white/80">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#contact" className="hover:text-white/80">
                  Contact us
                </Link>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold lg:text-xl">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail size={20} className="mt-0.5 shrink-0" />
                <a
                  href={`mailto:${school.contact.email}`}
                  className="wrap-break-word hover:text-white/80 hover:underline"
                >
                  {school.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="shrink-0" />
                <a href={`tel:${school.contact.phone}`} className="hover:text-white/80">
                  {school.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Home size={20} className="mt-1 shrink-0" />
                <address className="wrap-break-word text-white/80 not-italic">
                  {school.contact.address}
                </address>
              </li>
            </ul>
          </section>
        </section>

        <section className="flex flex-col items-center justify-between border-t border-white/20 pt-6 text-sm text-white/80 md:flex-row md:items-center">
          <p>Copyright &copy; {new Date().getFullYear()}</p>
          <div className="flex items-center gap-6 [&_p]:cursor-pointer">
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
