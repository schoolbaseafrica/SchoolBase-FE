"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Video, Plus, Search } from "lucide-react"
import { MeetingsAPI, Meeting } from "@/lib/meetings"
import { NewFeatureBadge } from "@/components/ui/new-feature-badge"

export function MeetingsPage({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [roles, setRoles] = useState<string[]>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([])
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([])
  const [search, setSearch] = useState("")
  const [choices, setChoices] = useState<Awaited<
    ReturnType<typeof MeetingsAPI.invitees>
  > | null>(null)

  const load = async () => {
    try {
      setMeetings(await MeetingsAPI.list())
      setError("")
    } catch {
      setError("Could not load meetings. Try refreshing the page.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])
  useEffect(() => {
    if (search.trim().length < 2) {
      setChoices(null)
      return
    }
    let active = true
    const timer = setTimeout(() => {
      void MeetingsAPI.invitees(search)
        .then((result) => {
          if (active) setChoices(result)
        })
        .catch(() => {
          if (active) setChoices(null)
        })
    }, 250)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search])

  const create = async () => {
    setError("")
    if (
      !title.trim() ||
      !startsAt ||
      !endsAt ||
      (!roles.length && !users.length && !classes.length)
    ) {
      setError("Add a title, time, and at least one audience.")
      return
    }
    setCreating(true)
    try {
      await MeetingsAPI.create({
        title,
        description,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        audienceRoles: roles,
        audienceUserIds: users.map((item) => item.id),
        audienceClassIds: classes.map((item) => item.id),
      })
      setTitle("")
      setDescription("")
      setStartsAt("")
      setEndsAt("")
      setRoles([])
      setUsers([])
      setClasses([])
      await load()
    } catch {
      setError(
        "Meeting could not be created. Check the time and invitees, then try again."
      )
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[var(--primary)] uppercase">
            School communication
          </p>
          <h1 className="mt-1 text-3xl font-semibold">
            Meetings <NewFeatureBadge className="ml-1 align-middle" />
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Scheduled video meetings for invited members of your school.
          </p>
        </div>
        <Video className="h-8 w-8 text-[var(--primary)]" />
      </header>
      {admin && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Schedule a meeting</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium">
              Title
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={160}
              />
            </label>
            <label className="text-sm font-medium">
              Description
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
            </label>
            <label className="text-sm font-medium">
              Starts
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </label>
            <label className="text-sm font-medium">
              Ends
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </label>
          </div>
          <p className="mt-5 text-sm font-medium">Invite groups</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRoles(["ADMIN", "TEACHER", "PARENT", "STUDENT"])}
              className="rounded-full border px-4 py-2 text-sm"
            >
              Whole school
            </button>
            {["ADMIN", "TEACHER", "PARENT", "STUDENT"].map((role) => (
              <button
                key={role}
                type="button"
                aria-pressed={roles.includes(role)}
                onClick={() =>
                  setRoles(
                    roles.includes(role)
                      ? roles.filter((item) => item !== role)
                      : [...roles, role]
                  )
                }
                className={`rounded-full border px-4 py-2 text-sm ${roles.includes(role) ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "bg-white"}`}
              >
                All {role.toLowerCase()}s
              </button>
            ))}
          </div>
          <label className="mt-5 block text-sm font-medium">
            Invite named people or classes
            <span className="mt-1 flex items-center gap-2 rounded-xl border px-3">
              <Search className="h-4 w-4" />
              <input
                className="w-full py-2 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people or classes"
              />
            </span>
          </label>
          <p className="text-muted-foreground mt-1 text-xs">
            A class invitation includes its active students, their parents, and assigned
            class teachers.
          </p>
          {choices && (
            <div className="mt-2 max-h-48 overflow-auto rounded-xl border p-2 text-sm">
              {choices.users.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  className="block w-full rounded-lg px-2 py-1 text-left hover:bg-gray-50"
                  onClick={() => {
                    setUsers((old) =>
                      old.some((item) => item.id === user.id) ? old : [...old, user]
                    )
                    setSearch("")
                  }}
                >
                  {user.name} · {user.role.join(", ")}
                </button>
              ))}
              {choices.classes.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="block w-full rounded-lg px-2 py-1 text-left hover:bg-gray-50"
                  onClick={() => {
                    setClasses((old) =>
                      old.some((entry) => entry.id === item.id) ? old : [...old, item]
                    )
                    setSearch("")
                  }}
                >
                  Class: {item.name}
                </button>
              ))}
            </div>
          )}
          {(users.length > 0 || classes.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {users.map((user) => (
                <button
                  type="button"
                  key={user.id}
                  onClick={() => setUsers(users.filter((item) => item.id !== user.id))}
                  className="rounded-full border px-3 py-1 text-sm"
                >
                  {user.name} ×
                </button>
              ))}
              {classes.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    setClasses(classes.filter((entry) => entry.id !== item.id))
                  }
                  className="rounded-full border px-3 py-1 text-sm"
                >
                  {item.name} ×
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            disabled={creating}
            onClick={() => void create()}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Creating…" : "Create meeting"}
          </button>
        </section>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Your meetings</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading meetings…</p>
        ) : meetings.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border bg-white p-6 text-sm">
            No meetings scheduled for you yet.
          </p>
        ) : (
          meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`${pathname}/${meeting.id}`}
              className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:border-[var(--primary)] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{meeting.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {new Date(meeting.startsAt).toLocaleString()} –{" "}
                    {new Date(meeting.endsAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full border px-3 py-1 text-xs capitalize">
                  {meeting.status}
                </span>
              </div>
              {meeting.description && (
                <p className="text-muted-foreground mt-3 text-sm">
                  {meeting.description}
                </p>
              )}
            </Link>
          ))
        )}
      </section>
    </main>
  )
}
