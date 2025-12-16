import type { Metadata } from "next"
import Footer from "@/components/Footer"
import NavBarWrapper from "@/components/navbar-wrapper"

export const metadata: Metadata = {
  description:
    "School Base streamlines attendance, grading, communication, and payments so schools can focus on learning.",
}

export default function ExternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBarWrapper />
      <main className="pt-16 md:pt-22 lg:pt-26">{children}</main>
      <Footer />
    </>
  )
}
