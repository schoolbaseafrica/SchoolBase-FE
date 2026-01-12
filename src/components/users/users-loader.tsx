"use client"

import { UsersTableSkeleton } from "./users-table-skeleton"
import { UserType } from "@/types/user"

export function UsersLoader({ userType }: { userType: string }) {
  return (
    <div className="p-4 sm:p-6">
      <UsersTableSkeleton userType={userType as UserType} rows={10} />
    </div>
  )
}
