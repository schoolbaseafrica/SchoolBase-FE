"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import EmptyState from "../empty-state"
import { ClassesAPI, type ClassItem } from "@/lib/classes"
import { ItemLoader } from "../sub-loader"
import { ItemsError } from "../loading-error"
import ExistingClasses from "./existing-classes"
import { Button } from "@/components/ui/button"
import { Archive, RotateCcw } from "lucide-react"
import { useAcademicPeriod } from "@/hooks/use-academic-period"
// import { useMemo } from "react"

const ClassesPageContent = () => {
  const [showArchived, setShowArchived] = useState(false)
  const period = useAcademicPeriod("admin-classes")
  const isCurrentSession = period.sessionId === period.activeSession?.id

  // Each API page contains arm rows before grouping. Fetch every page and merge
  // groups locally so no class is cut off at a page boundary.
  const {
    data: classes = [],
    isError,
    error,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["classes", "management", showArchived, period.sessionId],
    queryFn: async () => {
      const grouped = new Map<string, ClassItem>()
      let page = 1
      let hasNext = true
      while (hasNext) {
        const response = await ClassesAPI.getAll({
          includeArchived: showArchived,
          limit: 100,
          page,
          session_id: period.sessionId,
        })
        for (const item of response.data.items) {
          const key = `${item.academicSession.id}:${item.name}`
          const existing = grouped.get(key)
          if (existing) existing.classes.push(...item.classes)
          else grouped.set(key, { ...item, classes: [...item.classes] })
        }
        hasNext = page * 100 < response.data.pagination.total
        page += 1
      }
      return Array.from(grouped.values())
    },
    enabled: !!period.sessionId,
  })

  const toggleButton = (
    <Button
      variant="outline"
      onClick={() => setShowArchived(!showArchived)}
      className="flex items-center gap-2"
    >
      {showArchived ? (
        <>
          <RotateCcw className="size-4" />
          Show Active
        </>
      ) : (
        <>
          <Archive className="size-4" />
          Show Archived
        </>
      )}
    </Button>
  )

  return (
    <>
      {isLoading ? (
        <ItemLoader item="Classes" />
      ) : isError ? (
        <ItemsError
          item="Classes"
          reload={refetch}
          errorMessage={error?.message || "An unexpected error occurred."}
        />
      ) : !classes || classes.length === 0 ? (
        <>
          {/* Toggle button for empty state */}
          <div className="mb-6 flex items-center justify-end">{toggleButton}</div>
          <EmptyState
            title={showArchived ? "No Archived Classes" : "No Classes Assigned yet"}
            description={
              showArchived
                ? "There are no archived classes."
                : "Add Classes to make the session active."
            }
            buttonText={showArchived || !isCurrentSession ? undefined : "Add Classes"}
            buttonHref={
              showArchived || !isCurrentSession
                ? undefined
                : "/admin/class-management/class/new"
            }
          />
        </>
      ) : (
        // Render existing classes here when available
        <ExistingClasses
          classesData={classes}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
          isCurrentSession={isCurrentSession}
        />
      )}
    </>
  )
}

export default ClassesPageContent
