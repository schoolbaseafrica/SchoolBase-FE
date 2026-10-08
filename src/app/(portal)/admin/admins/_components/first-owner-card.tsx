"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ShieldCheck } from "lucide-react"

import { AdminsAPI } from "@/lib/admins"
import { OwnerTransferControls } from "./owner-transfer-controls"
import { useAuthUser } from "@/hooks/use-auth-user"
import { extractErrorMessage } from "@/lib/error-handler"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  const viewer = useAuthUser()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
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

  if (owner.isLoading) return null
  if (owner.isError) {
    return (
      <p className="mx-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Unable to load school owner status.
      </p>
    )
  }

  const currentOwner = owner.data?.data
  const isOwner = currentOwner?.owner_user_id === viewer.data?.id
  if (currentOwner?.owner_user_id) {
    return (
      <Card className="mx-4 mt-5 gap-0 py-0 sm:mx-6">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="bg-accent/10 text-accent rounded-xl p-2">
              <ShieldCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="font-semibold">School owner</h2>
              <p className="text-muted-foreground text-sm break-all">
                {currentOwner.first_name} {currentOwner.last_name} · {currentOwner.email}
              </p>
              {isOwner && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Manage admin access from the list below.
                </p>
              )}
            </div>
          </div>
          {isOwner && <OwnerTransferControls ownerId={currentOwner.owner_user_id} />}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-4 mt-5 border-amber-200 bg-amber-50 py-0 sm:mx-6">
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="font-semibold">Assign the first school owner</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            The school should choose an existing active admin. This first assignment can
            only be made once.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
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
              if (admin)
                setSelected({ id, name: `${admin.first_name} ${admin.last_name}` })
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
          <p className="text-sm text-red-700">Unable to load eligible admins.</p>
        )}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Assign {selected?.name} as school owner?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Confirm this choice with the school. The owner will control admin access,
                and this first assignment cannot be repeated.
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
      </CardContent>
    </Card>
  )
}
