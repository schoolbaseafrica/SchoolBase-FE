"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Logo from "./logo"
import { useSchoolStore } from "@/store/use-school-store"

const Navbar = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navItems = useSchoolStore((state) => state.school.navLinks).filter(
    (item) => item.href && item.label && item.href.trim() !== ""
  )
  const primaryNav = navItems.slice(0, 4)
  const ctaHref = "/login"
  const ctaLabel = "Login"
  const [activeHash, setActiveHash] = useState<string>(
    typeof window !== "undefined" ? window.location.hash || "#home" : "#home"
  )

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleNavClick = (href: string) => {
    if (href.startsWith("#")) {
      setActiveHash(href)
    }
    closeMobileMenu()
  }

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash || "#home")
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-white py-4 lg:py-6">
      <div className="relative container flex items-center justify-between">
        <Link href="/">
          <Logo size={32} />
        </Link>

        {/* Desktop Navigation - Centered */}
        <section className="absolute left-1/2 hidden -translate-x-1/2 gap-6 text-lg font-medium lg:flex lg:gap-10">
          {primaryNav.map((item) => {
            const isSectionLink = item.href.startsWith("#")
            const isActive =
              (isSectionLink && activeHash === item.href) ||
              (!isSectionLink && pathname === item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavClick(item.href)}
                className={`px-3 py-2 transition-colors duration-200 ${isActive ? "text-accent" : "text-[var(--text-secondary)]"} hover:text-accent/70`}
              >
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </section>

        {/* Desktop Button */}
        <div className="hidden lg:block">
          <Link href={ctaHref}>
            <Button variant="outline" className="">
              {ctaLabel}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-[var(--text-primary)] transition-colors hover:text-[var(--text-secondary)] lg:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
              onClick={closeMobileMenu}
            />
            <div
              className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-[var(--sidebar)] shadow-xl transition-transform duration-300 ease-out lg:hidden ${
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-end px-4 py-6">
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 text-[var(--text-primary)] transition-colors hover:text-[var(--text-secondary)]"
                    aria-label="Close menu"
                  >
                    <X className="size-6" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
                  {primaryNav.map((item) => {
                    const isSectionLink = item.href.startsWith("#")
                    const isActive =
                      (isSectionLink && activeHash === item.href) ||
                      (!isSectionLink && pathname === item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => handleNavClick(item.href)}
                        className={`px-4 py-3 text-lg font-medium transition-colors ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"} hover:bg-gray-50 hover:text-[var(--text-primary)]`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                  <div className="mt-2 px-4">
                    <Link href={ctaHref}>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={closeMobileMenu}
                      >
                        {ctaLabel}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
