"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { VirtualClassroomAPI } from "@/lib/virtual-classroom"
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

interface Props {
  classroomId: string
  activePage: string
  onPageChange: (pageKey: string) => void
  canManage: boolean
  participants: Array<{ socketId: string; name: string }>
}

const key = (classroomId: string) => ["classroom-whiteboard-pages", classroomId]

export function ClassroomBoardBar({
  classroomId,
  activePage,
  onPageChange,
  canManage,
  participants,
}: Props) {
  const queryClient = useQueryClient()
  const pages = useQuery({
    queryKey: key(classroomId),
    queryFn: () => VirtualClassroomAPI.getWhiteboardPages(classroomId),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: key(classroomId) })

  const createPage = async () => {
    const title = window.prompt("Name the new whiteboard page")?.trim()
    if (!title) return
    try {
      const page = await VirtualClassroomAPI.createWhiteboardPage(classroomId, title)
      await refresh()
      onPageChange(page.pageKey)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create page")
    }
  }

  const renamePage = async () => {
    const page = pages.data?.find((item) => item.pageKey === activePage)
    if (!page) return
    const title = window.prompt("Rename whiteboard page", page.title)?.trim()
    if (!title || title === page.title) return
    try {
      await VirtualClassroomAPI.renameWhiteboardPage(classroomId, activePage, title)
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not rename page")
    }
  }

  const deletePage = async () => {
    if (activePage === "main") return
    if (!window.confirm("Delete this whiteboard page and its saved content?")) return
    try {
      await VirtualClassroomAPI.deleteWhiteboardPage(classroomId, activePage)
      onPageChange("main")
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete page")
    }
  }

  const move = async (direction: -1 | 1) => {
    const current = pages.data ?? []
    const index = current.findIndex((page) => page.pageKey === activePage)
    const target = index + direction
    if (index < 0 || target < 0 || target >= current.length) return
    const reordered = [...current]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    try {
      await VirtualClassroomAPI.reorderWhiteboardPages(
        classroomId,
        reordered.map((page) => page.pageKey)
      )
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reorder pages")
    }
  }

  return (
    <div className="flex min-h-12 items-center gap-2 border-b bg-white px-3 py-2">
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
        {(pages.data ?? []).map((page) => (
          <Button
            key={page.pageKey}
            size="sm"
            variant={page.pageKey === activePage ? "default" : "outline"}
            onClick={() => onPageChange(page.pageKey)}
            className="shrink-0"
          >
            {page.title}
          </Button>
        ))}
      </div>
      <div
        className="hidden items-center -space-x-2 sm:flex"
        title={`${participants.length} connected`}
      >
        {participants.slice(0, 4).map((participant) => (
          <span
            key={participant.socketId}
            title={participant.name}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-[10px] font-semibold text-white"
          >
            {participant.name
              .split(" ")
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </span>
        ))}
        {participants.length === 0 && <Users className="h-4 w-4 text-slate-400" />}
      </div>
      {canManage && (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => move(-1)}
            title="Move page left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => move(1)}
            title="Move page right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={renamePage} title="Rename page">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={deletePage}
            disabled={activePage === "main"}
            title="Delete page"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={createPage}>
            <Plus className="mr-1 h-4 w-4" /> Page
          </Button>
        </div>
      )}
    </div>
  )
}

export function CollaborationCursors({
  cursors,
}: {
  cursors: Array<{ socketId: string; name: string; x: number; y: number }>
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
      {cursors.map((cursor) => (
        <div
          key={cursor.socketId}
          className="absolute transition-[left,top] duration-75"
          style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
        >
          <div className="h-0 w-0 border-x-[6px] border-t-[12px] border-x-transparent border-t-red-600" />
          <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] text-white shadow">
            {cursor.name}
          </span>
        </div>
      ))}
    </div>
  )
}
