"use client"

import { CreateAdminForm } from "./_components/create-admin-form"

export default function AdminsPage() {
  return (
    <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
      <div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Create Admin Account</h1>
        <p className="text-gray-600">
          Create a new admin account. The admin will receive an email with their login credentials.
        </p>
      </div>
      <div>
        <CreateAdminForm />
      </div>
    </div>
  )
}
