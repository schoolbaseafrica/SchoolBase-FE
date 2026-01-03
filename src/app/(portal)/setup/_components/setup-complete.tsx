"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SetupCompleteNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEF9FA] px-4 pt-[90px]">
      <section className="container grid grid-cols-1 items-center gap-5 align-middle lg:grid-cols-2 lg:gap-[76px]">
        <div className="relative order-1 flex justify-center lg:order-2">
          <Image
            src="/assets/images/not-found.png"
            alt="Setup completed"
            width={500}
            height={500}
            loading="eager"
          />
        </div>

        <div className="order-2 mx-auto flex max-w-[526px] flex-col gap-3 lg:order-1">
          <h2 className="text-primary text-center text-2xl font-bold lg:text-left lg:text-5xl">
            Setup completed
          </h2>
          <p className="text-text-secondary text-center text-base lg:text-left">
            The setup for this school is already complete. You can visit the landing page
            or log in as a super admin to manage the portal.
          </p>
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/">Visit landing page</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/super-admin/login">Login as super admin</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
