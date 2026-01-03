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
      <p className="mb-6 text-gray-600">
        Your School Portal Has Been Successfully Created.
      </p>

      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-left">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Next Steps:</h2>
        <ul className="mb-4 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>School profile has been configured</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Super admin account created</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">→</span>
            <span>Log in as super admin to create admin accounts and manage your school</span>
          </li>
        </ul>
        <p className="text-xs text-gray-500">
          Note: Use the email and password you provided during setup to log in as super admin.
          You can create admin accounts from the super admin dashboard.
        </p>
      </div>

      <Button asChild className="w-full md:max-w-xs">
        <Link href="/super-admin/login">Log In as Super Admin</Link>
      </Button>
    </div>
  )
}
