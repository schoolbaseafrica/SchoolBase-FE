"use client"

import { ItemLoader } from "../../../_components/sub-loader"
import { ItemsError } from "../../../_components/loading-error"
import EmptyState from "../../../_components/empty-state"
import { useGetSubjects } from "../_hooks/use-subjects"
import { useState, useMemo } from "react"
import SubjectManagement from "./subjects-list"
import { NewSubjectDialog, EditSubjectDialog } from "./new-subject-dialog"
import AddedSubjectSuccess from "./add-subject-success"
import { useRouter } from "next/navigation"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSubjectsStore } from "@/store/subjects-store"
import { useShallow } from "zustand/react/shallow"

export default function SubjectsPageContent() {
  const [currentPage, setCurrentPage] = useState(1)

  // 1. Fetch
  const { isError, error, refetch, isLoading: isQueryLoading } = useGetSubjects()

  // 2. Store Selection
  const { subjectsMap, subjectIds } = useSubjectsStore(
    useShallow((state) => ({
      subjectsMap: state.subjects,
      subjectIds: state.subjectIds,
    }))
  )

  // 3. Derived State (All subjects)
  const allSubjects = useMemo(
    () => subjectIds.map((id) => subjectsMap[id]).filter(Boolean),
    [subjectsMap, subjectIds]
  )

  // Client-side pagination logic
  const itemsPerPage = 10
  const totalItems = allSubjects.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const currentSubjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return allSubjects.slice(start, start + itemsPerPage)
  }, [allSubjects, currentPage])

  // Combine loading
  const isLoading = isQueryLoading && totalItems === 0

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editSubjectID, setEditSubjectID] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean | string>(false)

  const router = useRouter()

  function handleAddSubject() {
    setShowCreateDialog(true)
  }

  function handleEditSubject(subjectID: string) {
    setEditSubjectID(subjectID)
  }

  function handleAssignSubject(subjectID: string) {
    router.push(`/admin/class-management/subjects/${subjectID}/assign`)
  }

  return (
    <div className="p-5">
      <header className="flex flex-col justify-between gap-4 lg:flex-row">
        <DashboardTitle
          heading="Subjects"
          description="View, manage, or create subjects "
        />
        <Button
          size="lg"
          className="whitespace-nowrap"
          onClick={handleAddSubject}
        >
          <PlusIcon className="h-4 w-4" />
          Create Subject
        </Button>
      </header>

      <>
        {isLoading ? (
          <ItemLoader item="Subjects" />
        ) : isError ? (
          <ItemsError
            item="Subjects"
            reload={refetch}
            errorMessage={error?.message || "An unexpected error occurred."}
          />
        ) : !allSubjects || allSubjects.length === 0 ? (
          <EmptyState
            title="No Subjects Created yet"
            description="Add Subjects."
            buttonText="Add Subjects"
            buttonHref="/admin/subject-management/subject/new"
            buttonOnClick={handleAddSubject}
          />
        ) : (
          <SubjectManagement
            subjects={currentSubjects}
            onEditSubject={handleEditSubject}
            onAssignSubject={handleAssignSubject}
            currentPage={currentPage}
            totalPages={totalPages || 1}
            totalItems={totalItems}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        )}

        <NewSubjectDialog
          open={showCreateDialog}
          setOpen={setShowCreateDialog}
          onSuccess={setShowSuccessDialog}
        />

        <EditSubjectDialog
          open={!!editSubjectID}
          subjectID={editSubjectID as string}
          setOpen={() => setEditSubjectID(null)}
          onSuccess={setShowSuccessDialog}
        />

        <AddedSubjectSuccess
          open={!!showSuccessDialog}
          setOpen={setShowSuccessDialog}
          onNextAction={() => {
            handleAssignSubject(showSuccessDialog as string)
          }}
        />
      </>
    </div>
  )
}
