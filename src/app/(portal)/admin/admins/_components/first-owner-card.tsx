"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { AdminsAPI } from "@/lib/admins"
import { OwnerTransferControls } from "./owner-transfer-controls"
import { useAuthUser } from "@/hooks/use-auth-user"
import { extractErrorMessage } from "@/lib/error-handler"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function FirstOwnerCard() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [statusSearch, setStatusSearch] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState<{
    id: string
    name: string
    is_active: boolean
  } | null>(null)
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false)
  const viewer = useAuthUser()

  const owner = useQuery({
    queryKey: ["first-school-owner"],
    queryFn: () => AdminsAPI.getFirstOwner(),
  })
  const candidates = useQuery({
    queryKey: ["owner-candidates", search],
    queryFn: () =>
      AdminsAPI.getAll({ limit: 100, is_active: true, search: search || undefined }),
    enabled: owner.isSuccess && !owner.data.data.owner_user_id,
  })
  const assign = useMutation({
    mutationFn: (id: string) => AdminsAPI.assignFirstOwner(id),
    onSuccess: async () => {
      toast.success("School owner assigned")
      setSelected(null)
      await queryClient.invalidateQueries({ queryKey: ["first-school-owner"] })
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })
  const isOwner = Boolean(
    owner.data?.data.owner_user_id && owner.data.data.owner_user_id === viewer.data?.id
  )
  const admins = useQuery({
    queryKey: ["owner-admin-access", statusSearch],
    queryFn: () => AdminsAPI.getAll({ limit: 100, search: statusSearch || undefined }),
    enabled: isOwner,
  })
  const setAccess = useMutation({
    mutationFn: (admin: { id: string; is_active: boolean }) =>
      AdminsAPI.setAdminActive(admin.id, !admin.is_active),
    onSuccess: async () => {
      toast.success(selectedAdmin?.is_active ? "Admin deactivated" : "Admin reactivated")
      setSelectedAdmin(null)
      await queryClient.invalidateQueries({ queryKey: ["owner-admin-access"] })
      await queryClient.invalidateQueries({ queryKey: ["admins"] })
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  if (owner.isLoading) return null
  if (owner.isError) {
    return (
      <p className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unable to load school owner status.
      </p>
    )
  }

  const currentOwner = owner.data?.data
  if (currentOwner?.owner_user_id) {
    return (
      <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">School owner</h2>
        <p className="mt-1 text-sm text-slate-600">
          {currentOwner.first_name} {currentOwner.last_name} · {currentOwner.email}
        </p>
        {isOwner && (
          <>
            <h3 className="mt-5 font-medium">Admin access</h3>
            <p className="mt-1 text-sm text-slate-600">
              Deactivation ends current sessions. Reactivated admins must sign in again.
            </p>
            <Input
              className="mt-3 max-w-sm"
              value={statusSearch}
              onChange={(event) => setStatusSearch(event.target.value)}
              placeholder="Search admins"
              aria-label="Search admin access"
            />
            {admins.isError && (
              <p className="mt-2 text-sm text-red-700">Unable to load admins.</p>
            )}
            <div className="mt-3 space-y-2">
              {admins.data?.data.map((admin) => (
                <div
                  key={admin.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <span className="text-sm">
                    {admin.first_name} {admin.last_name} · {admin.email}
                    <span className="ml-2 text-slate-500">
                      {admin.is_active ? "Active" : "Inactive"}
                    </span>
                  </span>
                  {admin.id !== currentOwner.owner_user_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAdmin({
                          id: admin.id,
                          name: `${admin.first_name} ${admin.last_name}`,
                          is_active: admin.is_active,
                        })
                        setStatusConfirmOpen(true)
                      }}
                    >
                      {admin.is_active ? "Deactivate" : "Reactivate"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <AlertDialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {selectedAdmin?.is_active ? "Deactivate" : "Reactivate"}{" "}
                    {selectedAdmin?.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {selectedAdmin?.is_active
                      ? "Their existing access and refresh sessions will end immediately."
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
            <OwnerTransferControls ownerId={currentOwner.owner_user_id} />
          </>
        )}
      </section>
    )
  }

  return (
    <section className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-semibold text-slate-900">Assign the first school owner</h2>
      <p className="mt-1 text-sm text-slate-700">
        The school should choose an existing admin. The owner will control future admin
        deactivation and ownership transfer. This first assignment can only be made once.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search admins by name or email"
          aria-label="Search eligible admins"
          className="bg-white sm:max-w-72"
        />
        <Select
          value={selected?.id}
          onValueChange={(id) => {
            const admin = candidates.data?.data.find((item) => item.id === id)
            if (admin) setSelected({ id, name: `${admin.first_name} ${admin.last_name}` })
          }}
        >
          <SelectTrigger className="w-full bg-white sm:w-72">
            <SelectValue placeholder="Choose an admin" />
          </SelectTrigger>
          <SelectContent>
            {candidates.data?.data.map((admin) => (
              <SelectItem key={admin.id} value={admin.id}>
                {admin.first_name} {admin.last_name} · {admin.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={!selected || assign.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          Assign owner
        </Button>
      </div>
      {candidates.isError && (
        <p className="mt-2 text-sm text-red-700">Unable to load eligible admins.</p>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign {selected?.name} as school owner?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm this choice with the school. The owner will have authority over
              admin access, and this first assignment cannot be repeated. All admins will
              be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!selected || assign.isPending}
              onClick={() => selected && assign.mutate(selected.id)}
            >
              Confirm owner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
