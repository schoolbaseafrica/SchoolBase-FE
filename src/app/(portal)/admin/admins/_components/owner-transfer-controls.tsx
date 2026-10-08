"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

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
import { AdminsAPI } from "@/lib/admins"
import { extractErrorMessage } from "@/lib/error-handler"

export function OwnerTransferControls({ ownerId }: { ownerId: string }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const candidates = useQuery({
    queryKey: ["transfer-owner-candidates", search],
    queryFn: () =>
      AdminsAPI.getAll({ limit: 100, is_active: true, search: search || undefined }),
  })
  const transfer = useMutation({
    mutationFn: (id: string) => AdminsAPI.transferOwner(id),
    onSuccess: async () => {
      toast.success("School ownership transferred")
      setSelected(null)
      setConfirmOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["first-school-owner"] })
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  })

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <h3 className="font-medium">Transfer school ownership</h3>
      <p className="mt-1 text-sm text-slate-600">
        Choose an active admin. After transfer, only the new owner can manage admin access
        or transfer ownership again.
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setSelected(null)
          }}
          placeholder="Search active admins"
          aria-label="Search new owner"
          className="sm:max-w-72"
        />
        <Select
          value={selected?.id}
          onValueChange={(id) => {
            const admin = candidates.data?.data.find((item) => item.id === id)
            if (admin) setSelected({ id, name: `${admin.first_name} ${admin.last_name}` })
          }}
        >
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Choose a new owner" />
          </SelectTrigger>
          <SelectContent>
            {candidates.data?.data
              .filter((admin) => admin.id !== ownerId)
              .map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.first_name} {admin.last_name} · {admin.email}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          disabled={!selected || transfer.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          Transfer ownership
        </Button>
      </div>
      {candidates.isError && (
        <p className="mt-2 text-sm text-red-700">Unable to load eligible admins.</p>
      )}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer ownership to {selected?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm this decision with the school. Your account will immediately lose
              owner-only controls, and all active admins will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!selected || transfer.isPending}
              onClick={() => selected && transfer.mutate(selected.id)}
            >
              Confirm transfer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
