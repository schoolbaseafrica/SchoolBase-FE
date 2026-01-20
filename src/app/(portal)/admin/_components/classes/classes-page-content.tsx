"use client"

import { useState } from "react"
import EmptyState from "../empty-state"
import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"
import { ItemLoader } from "../sub-loader"
import { ItemsError } from "../loading-error"
import ExistingClasses from "./existing-classes"
import { useClassesStore, selectClassItems } from "@/store/classes-store"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
import { Archive, RotateCcw } from "lucide-react"
// import { useMemo } from "react"

const ClassesPageContent = () => {
  const [showArchived, setShowArchived] = useState(false)

  // 1. Fetch - include archived if toggle is on
  // Use high limit to ensure all class arms are loaded (avoid pagination issues)
  const {
    isError,
    error,
    refetch,
    isLoading: isQueryLoading,
  } = useGetClassesInfo({
    includeArchived: showArchived,
    limit: 1000, // Get all classes/arms at once to avoid missing arms due to pagination
    page: 1,
  })

  // 2. Store selection
  const { classItems, isLoading: isStoreLoading } = useClassesStore(
    useShallow((state) => ({
      classItems: selectClassItems(state),
      isLoading: state.isLoading,
    }))
  )

  // No complex filtering logic here yet, passing direct items
  const classes = classItems

  // Combine loading states
  // We show loader if query is loading and we have no data yet
  const isLoading = (isQueryLoading || isStoreLoading) && classes.length === 0

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
            buttonText={showArchived ? undefined : "Add Classes"}
            buttonHref={showArchived ? undefined : "/admin/class-management/class/new"}
          />
        </>
      ) : (
        // Render existing classes here when available
        <ExistingClasses
          classesData={classes}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
        />
      )}
    </>
  )
}

export default ClassesPageContent
