"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api/client"

type InactivePerson = {
  id: string
  role: "student" | "parent" | "teacher"
  first_name: string
  last_name: string
  email: string
}

export default function OwnerInactivePeoplePage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<InactivePerson | null>(null)
  const [confirmation, setConfirmation] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const people = useQuery({
    queryKey: ["owner-inactive-people", page, search],
    queryFn: () =>
      apiFetch<{
        data: { items: InactivePerson[]; total: number; page: number; page_size: number }
      }>(
        `/users/owner/inactive-people?page=${page}&search=${encodeURIComponent(search)}`
      ),
  })
  const erase = useMutation({
    mutationFn: (person: InactivePerson) =>
      apiFetch(`/users/owner/inactive-people/${person.role}/${person.id}/deidentify`, {
        method: "POST",
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["owner-inactive-people"] })
      toast.success("Profile de-identified")
      setSelected(null)
      setConfirmation("")
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Could not de-identify profile"
      ),
  })
  const filtered = people.data?.data.items ?? []
  const total = people.data?.data.total ?? 0
  const pageSize = people.data?.data.page_size ?? 50

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/owner">
          <ArrowLeft className="size-4" /> School overview
        </Link>
      </Button>
      <div className="rounded-[1.5rem] border border-[var(--portal-line)] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="bg-accent/10 text-accent flex size-11 shrink-0 items-center justify-center rounded-xl">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <p className="portal-section-label">School owner</p>
            <h1 className="mt-1 text-2xl font-semibold">Inactive people</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
              De-identify an inactive profile while keeping linked school history. This
              removes the person’s name, contact details, login credentials, photo
              reference, and school ID from their profile. Historical school records
              remain and may still contain details recorded at the time. The profile will
              leave this list and cannot be restored.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-[var(--portal-line)] bg-white p-5 shadow-sm">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
            setSearch(searchInput.trim())
          }}
        >
          <div className="min-w-64 flex-1">
            <label htmlFor="inactive-search" className="text-sm font-medium">
              Find an inactive person
            </label>
            <Input
              id="inactive-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name or email"
              className="mt-2 max-w-md"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        {people.isLoading && (
          <p className="text-muted-foreground mt-5 text-sm">Loading inactive people…</p>
        )}
        {people.isError && (
          <p className="text-destructive mt-5 text-sm">
            {"Could not load this owner-only list. Check your access and try again."}
          </p>
        )}
        {!people.isLoading && !people.isError && filtered.length === 0 && (
          <p className="text-muted-foreground mt-5 text-sm">
            No matching inactive people.
          </p>
        )}
        <ul className="mt-5 divide-y divide-[var(--portal-line)]">
          {filtered.map((person) => (
            <li
              key={`${person.role}-${person.id}`}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {person.first_name} {person.last_name}
                </p>
                <p className="text-muted-foreground text-sm break-all">
                  {person.email} · {person.role}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelected(person)
                  setConfirmation("")
                }}
              >
                De-identify
              </Button>
            </li>
          ))}
        </ul>
        {total > pageSize && (
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--portal-line)] pt-4">
            <p className="text-muted-foreground text-sm">
              Page {page} of {Math.ceil(total / pageSize)} · {total} people
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * pageSize >= total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      <AlertDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null)
            setConfirmation("")
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>De-identify this profile?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected?.first_name} {selected?.last_name} will lose their identifying
              profile details and sign-in access. Linked school history will remain. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label htmlFor="erase-confirm" className="text-sm font-medium">
            Type the email to confirm
          </label>
          <Input
            id="erase-confirm"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            autoComplete="off"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={erase.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!selected || confirmation !== selected.email || erase.isPending}
              onClick={(event) => {
                event.preventDefault()
                if (selected) erase.mutate(selected)
              }}
            >
              {erase.isPending ? "De-identifying…" : "De-identify profile"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
