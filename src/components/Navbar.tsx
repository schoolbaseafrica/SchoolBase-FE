"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Logo from "./logo"

const Navbar = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Features", path: "/features" },
    { label: "Modules", path: "/modules" },
    { label: "About", path: "/about" },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-100 bg-[#fffbfc] py-4 lg:py-6">
      <div className="relative container flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Navigation - Centered */}
        <section className="absolute left-1/2 hidden -translate-x-1/2 gap-6 text-lg font-medium lg:flex lg:gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 transition-colors duration-200 ${isActive ? "text-accent" : "text-[#535353]"} hover:text-accent/70`}
              >
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </section>

        {/* Desktop Button */}
        <div className="hidden lg:block">
          <Link href="/contact-us">
            <Button variant="outline" className="">
              Consult Us
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-[#2D2D2D] transition-colors hover:text-[#535353] lg:hidden"
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
              className={`fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-[#fffbfc] shadow-xl transition-transform duration-300 ease-out lg:hidden ${
                isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-end px-4 py-6">
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 text-[#2D2D2D] transition-colors hover:text-[#535353]"
                    aria-label="Close menu"
                  >
                    <X className="size-6" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={closeMobileMenu}
                        className={`px-4 py-3 text-lg font-medium transition-colors ${isActive ? "text-[#2D2D2D]" : "text-[#535353]"} hover:bg-gray-50 hover:text-[#2D2D2D]`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                  <div className="mt-2 px-4">
                    <Link href="/contact-us">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={closeMobileMenu}
                      >
                        Consult Us
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
