"use client"

import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function UnavailablePage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="max-w-lg text-center">
        <p className="text-accent text-sm font-semibold tracking-[0.18em] uppercase">
          SchoolBase
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-950">
          The school website is temporarily unavailable
        </h1>
        <p className="mt-4 leading-7 text-gray-600">
          We could not reach the school service. The school and its information are safe.
          Please check your connection and try again shortly.
        </p>
        <Button className="mt-7" onClick={() => router.push("/")}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </main>
  )
}
