"use client"

import EmptyState from "../empty-state"
import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"
import { ItemLoader } from "../sub-loader"
import { ItemsError } from "../loading-error"
import ExistingClasses from "./existing-classes"
import { useClassesStore, selectClassItems } from "@/store/classes-store"
import { useShallow } from "zustand/react/shallow"
// import { useMemo } from "react"

const ClassesPageContent = () => {
  // 1. Fetch
  const { isError, error, refetch, isLoading: isQueryLoading } = useGetClassesInfo()

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
        <EmptyState
          title="No Classes Assigned yet"
          description="Add Classes to make the session active."
          buttonText="Add Classes"
          buttonHref="/admin/class-management/class/new"
        />
      ) : (
        // Render existing classes here when available
        <ExistingClasses classesData={classes} />
      )}
    </>
  )
}

export default ClassesPageContent
