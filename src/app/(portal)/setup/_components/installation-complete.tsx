import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function InstallationComplete() {
  return (
    <div className="px-2 py-5 text-center md:p-12">
      <div className="mb-6 flex justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full">
          <Image
            src="/assets/icons/verify.svg"
            alt="Success"
            width={100}
            height={100}
            className="w-full object-contain"
          />
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-semibold text-gray-900">Installation Complete</h1>
      <p className="mb-12 text-gray-600">
        Your School Portal Has Been Successfully Created.
      </p>

      <Button asChild className="w-full md:max-w-xs">
        <Link href="/super-admin/login">Visit School Portal</Link>
      </Button>
    </div>
  )
}
