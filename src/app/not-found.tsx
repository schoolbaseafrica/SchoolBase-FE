import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEF9FA] px-4 pt-[90px]">
      <Navbar />

      <section className="container grid grid-cols-1 items-center gap-5 align-middle lg:grid-cols-2 lg:gap-[76px]">
        {/* Image FIRST on mobile, SECOND on desktop */}
        <div className="relative order-1 flex justify-center lg:order-2">
          <Image
            src="/assets/images/not-found.png"
            alt="404 image"
            width={500}
            height={500}
          />
        </div>

        {/* Text SECOND on mobile, FIRST on desktop */}
        <div className="order-2 mx-auto flex max-w-[526px] flex-col gap-2 lg:order-1">
          <h2 className="text-primary text-center text-2xl font-bold lg:text-left lg:text-5xl">
            Ooops...
          </h2>
          <p className="text-center text-2xl lg:text-left lg:text-[64px]">
            Page not found
          </p>
          <p className="text-text-secondary text-center text-base lg:text-left">
            Don’t worry, we’re already searching for it. In the meantime, head back to
            safer grounds.
          </p>
          <div className="flex justify-center lg:justify-start">
            <Button asChild size={"lg"} className="mt-5 w-[226px] lg:mt-10">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
