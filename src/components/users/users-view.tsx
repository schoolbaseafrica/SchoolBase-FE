"use client"

import { SnakeUser as User, UserType } from "@/types/user"
import { UsersTable } from "./users-table"
import { UsersGrid } from "./users-grid"
import { UsersToolbar } from "./users-toolbar"
import { Pagination } from "../ui/pagination"
import { useRouter } from "next/navigation"
import { UsersLoader } from "./users-loader"
import { UsersError } from "./users-error"

interface UsersViewProps {
  users: User[]
  userType: UserType

  isLoading?: boolean
  isError?: boolean
  error?: string

  // Controlled state (lifted up)
  searchQuery?: string
  statusFilter?: string
  currentPage?: number

  // Callbacks
  onSearchChange?: (query: string) => void
  onStatusFilterChange?: (status: string) => void
  onPageChange?: (page: number) => void

  pageSize?: number
  totalPages?: number
  totalItems?: number
  onAddUser?: () => void
  onToggleAdminAccess?: (user: User) => void
  ownerUserId?: string | null
}

export function UsersView({
  users,
  userType,
  searchQuery = "",
  statusFilter = "active",
  currentPage = 1,
  onSearchChange = () => {},
  onStatusFilterChange = () => {},
  onPageChange = () => {},
  isLoading = false,
  isError = false,
  error = "An unexpected error occurred.",
  pageSize = 20,
  totalPages,
  totalItems,
  onAddUser,
  onToggleAdminAccess,
  ownerUserId,
}: UsersViewProps) {
  const router = useRouter()
  const navigate = () => router.push(`/admin/${userType}/new`)

  return (
    <div className="mx-auto max-w-[1500px] p-4 sm:p-6 sm:pt-9">
      <UsersToolbar
        userType={userType}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onAddUser={onAddUser ?? navigate}
      />

      {isLoading ? (
        <UsersLoader userType={userType} />
      ) : isError ? (
        <UsersError
          errorMessage={error}
          userType={userType}
          reload={() => router.refresh()}
        />
      ) : (
        <>
          <div className="portal-reveal hidden md:block">
            <UsersTable
              users={users}
              userType={userType}
              currentPage={currentPage}
              itemsPerPage={pageSize}
              onToggleAdminAccess={onToggleAdminAccess}
              ownerUserId={ownerUserId}
            />
          </div>

          <div className="portal-reveal block md:hidden">
            <UsersGrid
              users={users}
              userType={userType}
              onToggleAdminAccess={onToggleAdminAccess}
              ownerUserId={ownerUserId}
            />
          </div>

          {users.length > 0 && (
            <Pagination
              itemName={userType}
              currentPage={currentPage}
              totalPages={totalPages || 1}
              totalItems={totalItems ?? users.length}
              onPageChange={onPageChange}
              className="mt-6"
            />
          )}

          {users.length === 0 && (
            <div className="portal-reveal rounded-[1.25rem] border border-[var(--portal-line)] bg-white px-6 py-16 text-center">
              <p className="text-muted-foreground">No {userType} found.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
