"use client"

import { CreateAdminForm } from "./_components/create-admin-form"

export default function AdminsPage() {
  return (
    <div className="mb-10 w-full space-y-8 bg-white p-4 md:p-10">
      <div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Invite the first admin</h1>
        <p className="text-gray-600">
          During setup, send a one-time invitation to the school’s first admin. Remove the
          setup secret from Coolify after sending it. The school can assign its owner
          later.
        </p>
      </div>
      <div>
        <CreateAdminForm />
      </div>
    </div>
  )
}
