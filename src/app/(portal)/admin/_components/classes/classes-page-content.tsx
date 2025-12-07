"use client"

import EmptyState from "../empty-state"
import { useGetClassesInfo } from "../../class-management/_hooks/use-classes"
import { ItemLoader } from "../sub-loader"
import { ItemsError } from "../loading-error"
import ExistingClasses from "./existing-classes"

const ClassesPageContent = () => {
  const { data: classesInfo, isLoading, isError, error, refetch } = useGetClassesInfo()
  const classes = classesInfo && classesInfo.items

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
