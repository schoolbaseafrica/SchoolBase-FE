"use client"

import { ItemLoader } from "../../../_components/sub-loader"
import { ItemsError } from "../../../_components/loading-error"
import EmptyState from "../../../_components/empty-state"
import { useGetSubjects } from "../_hooks/use-subjects"
import { useState } from "react"
import SubjectManagement from "./subjects-list"
import { NewSubjectDialog, EditSubjectDialog } from "./new-subject-dialog"
import AddedSubjectSuccess from "./add-subject-success"
import { useRouter } from "next/navigation"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SubjectsPageContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const {
    data: subjectsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSubjects({
    page: currentPage,
  })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editSubjectID, setEditSubjectID] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean | string>(false)
  const { data: subjects, pagination } = subjectsData || {}
  const router = useRouter()

  return (
    <div className="p-5">
      <header className="flex flex-col justify-between gap-4 lg:flex-row">
        <DashboardTitle
          heading="Subjects"
          description="View, manage, or create subjects "
        />
        <Button
          className="flex h-12 w-full items-center gap-2 lg:w-90"
          onClick={handleAddSubject}
        >
          <PlusIcon />
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
        ) : !subjects || subjects.length === 0 ? (
          <EmptyState
            title="No Subjects Created yet"
            description="Add Subjects."
            buttonText="Add Subjects"
            buttonHref="/admin/subject-management/subject/new"
            buttonOnClick={handleAddSubject}
          />
        ) : (
          <SubjectManagement
            subjects={subjects}
            onEditSubject={handleEditSubject}
            onAssignSubject={handleAssignSubject}
            currentPage={currentPage || 1}
            totalPages={pagination?.total_pages || 1}
            totalItems={pagination?.total || 0}
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

  function handleAddSubject() {
    setShowCreateDialog(true)
  }

  function handleEditSubject(subjectID: string) {
    setEditSubjectID(subjectID)
  }

  function handleAssignSubject(subjectID: string) {
    router.push(`/admin/class-management/subjects/${subjectID}/assign`)
  }
}
