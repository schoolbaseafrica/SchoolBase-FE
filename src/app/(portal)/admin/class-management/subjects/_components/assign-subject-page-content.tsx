"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ItemLoader } from "../../../_components/sub-loader"
import { ItemsError } from "../../../_components/loading-error"
import AssignSubjectForm from "./assign-subject-form"
import AssignSubjectSuccess from "./assign-subject-success"
import NotFound from "@/app/not-found"
import { useGetSubject } from "../_hooks/use-subjects"
import { useGetClassesInfo } from "../../_hooks/use-classes"

export default function AssignSubjectPageContent() {
  const subject_id = useParams().subject_id as string
  const router = useRouter()
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const {
    data: subject,
    isLoading: isLoadingSubject,
    isError: isErrorSubject,
    error: errorSubject,
    refetch: refetchSubject,
  } = useGetSubject(subject_id)

  const {
    data: classesInfo,
    isLoading: isLoadingClasses,
    isError: isErrorClasses,
    error: errorClasses,
    refetch: refetchClasses,
  } = useGetClassesInfo()
  const classes = classesInfo && classesInfo.items
  const classItems =
    classes &&
    classes.flatMap((cls) =>
      cls.classes?.map((c) => {
        return {
          id: c.id,
          name: `${cls.name} ${c.arm ?? ""}`,
        }
      })
    )

  const isLoading = isLoadingSubject || isLoadingClasses
  const isError = isErrorSubject || isErrorClasses
  const error = errorSubject || errorClasses

  if (!subject_id) {
    return <NotFound />
  }

  return (
    <>
      {isLoading ? (
        <ItemLoader item="Classes" />
      ) : isError ? (
        <ItemsError
          item="Classes"
          reload={() => {
            refetchSubject()
            refetchClasses()
          }}
          errorMessage={error?.message || "An unexpected error occurred."}
        />
      ) : !subject ? (
        <ItemsError
          item="Subject"
          reload={refetchSubject}
          errorMessage="Subject not found"
        />
      ) : !classItems || classItems.length === 0 ? (
        <ItemsError
          item="Classes"
          reload={refetchClasses}
          errorMessage="No classes available"
        />
      ) : (
        <AssignSubjectForm
          subject={subject}
          classes={classItems}
          onSuccess={handleSuccess}
        />
      )}

      <AssignSubjectSuccess
        open={showSuccessDialog}
        setOpen={setShowSuccessDialog}
        onGoHome={handleGoHome}
      />
    </>
  )

  function handleSuccess() {
    setShowSuccessDialog(true)
  }

  function handleGoHome() {
    router.push("/admin/class-management/subjects")
  }
}
