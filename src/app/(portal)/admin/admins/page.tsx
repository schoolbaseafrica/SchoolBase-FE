"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { UsersView } from "@/components/users/users-view"
import { useGetAdminsPage } from "./_hooks/use-admins"
import { useAdminsStore } from "@/store/admins-store"
import { useShallow } from "zustand/react/shallow"
import { useRouter } from "next/navigation"
import { FirstOwnerCard } from "./_components/first-owner-card"
import { AdminsAPI } from "@/lib/admins"
import { useAuthUser } from "@/hooks/use-auth-user"
import { extractErrorMessage } from "@/lib/error-handler"
import type { SnakeUser } from "@/types/user"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const viewer = useAuthUser()
  const [selectedAdmin, setSelectedAdmin] = useState<SnakeUser | null>(null)
  const owner = useQuery({
    queryKey: ["first-school-owner"],
    queryFn: () => AdminsAPI.getFirstOwner(),
  })
  const isOwner = Boolean(
    owner.data?.data.owner_user_id && owner.data.data.owner_user_id === viewer.data?.id
  )
  const setAccess = useMutation({
    mutationFn: (admin: SnakeUser) =>
      AdminsAPI.setAdminActive(admin.id, !admin.is_active),
    onSuccess: async () => {
      toast.success(selectedAdmin?.is_active ? "Admin deactivated" : "Admin reactivated")
      setSelectedAdmin(null)
      await queryClient.invalidateQueries({ queryKey: ["admins"] })
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })
  const { filters } = useAdminsStore(
    useShallow((state) => ({
      filters: state.filters,
    }))
  )

  const setFilters = useAdminsStore((state) => state.setFilters)

  const admins = useGetAdminsPage({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    is_active: filters.isActive,
  })

  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  const handleSearchChange = (search: string) => {
    setFilters({ search, page: 1 })
  }

  const handleStatusFilterChange = (status: string) => {
    setFilters({
      isActive: status === "active" ? true : status === "inactive" ? false : undefined,
      page: 1,
    })
  }

  const handleAddAdmin = () => {
    // Redirect to user configuration page with invite tab
    router.push("/admin/user-configuration?tab=invite")
  }

  const currentStatusFilter =
    filters.isActive === true ? "active" : filters.isActive === false ? "inactive" : "all"

  return (
    <>
      <FirstOwnerCard />
      <UsersView
        isLoading={admins.isLoading}
        isError={admins.isError}
        error={admins.error?.message}
        users={admins.data?.data ?? []}
        userType="admins"
        searchQuery={filters.search}
        statusFilter={currentStatusFilter}
        currentPage={filters.page}
        pageSize={filters.limit}
        totalPages={admins.data?.total_pages ?? 1}
        totalItems={admins.data?.total ?? 0}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onPageChange={handlePageChange}
        onAddUser={handleAddAdmin}
        onToggleAdminAccess={isOwner ? setSelectedAdmin : undefined}
        ownerUserId={owner.data?.data.owner_user_id}
      />
      <AlertDialog
        open={!!selectedAdmin}
        onOpenChange={(open) => !open && setSelectedAdmin(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAdmin?.is_active ? "Deactivate" : "Reactivate"}{" "}
              {selectedAdmin?.first_name} {selectedAdmin?.last_name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAdmin?.is_active
                ? "Their current sessions will end immediately."
                : "They can sign in again with their existing credentials."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={setAccess.isPending}
              onClick={() => selectedAdmin && setAccess.mutate(selectedAdmin)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
