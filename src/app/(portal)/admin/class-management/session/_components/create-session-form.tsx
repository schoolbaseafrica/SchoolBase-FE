"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlert } from "lucide-react"
import { useEffect, useState } from "react"

import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import DateField from "./date-field"
import { SuccessModal } from "@/components/dashboard/success-modal"

import { sessionFormSchema, SessionFormData } from "../_schemas/session-form-schema"
import { parseDate } from "../_utils/date"
import { useCreateAcademicSession } from "../_hooks/use-session"
import { AcademicSession, AcademicSessionAPI } from "@/lib/academic-session"
import { AcademicTermAPI } from "@/lib/academic-term"

const CreateSessionForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("id")
  const isEdit = Boolean(sessionId)

  // Fetch session data if editing
  const [session, setSession] = useState<AcademicSession | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(isEdit)

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const { mutate: createMutate, isPending: createPending } = useCreateAcademicSession()

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      terms: {
        first_term: { startDate: "", endDate: "" },
        second_term: { startDate: "", endDate: "" },
        third_term: { startDate: "", endDate: "" },
      },
      description: "",
    },
    mode: "onChange",
  })

  // Get term dates helper
  const getTermDates = (sessionData: AcademicSession, termName: string) => {
    const term = sessionData?.terms?.find((t) =>
      t.name.toLowerCase().includes(termName.toLowerCase())
    )
    return term
      ? { startDate: term.startDate, endDate: term.endDate }
      : { startDate: "", endDate: "" }
  }

  const isArchived = session?.status === "Archived"

  // Fetch session data on mount if editing
  useEffect(() => {
    if (sessionId) {
      setIsLoadingSession(true)
      AcademicSessionAPI.getOne(sessionId)
        .then((data) => {
          setSession(data)
          // Update form with fetched data
          reset({
            description: data.description ?? "",
            terms: {
              first_term: getTermDates(data, "first"),
              second_term: getTermDates(data, "second"),
              third_term: getTermDates(data, "third"),
            },
          })
        })
        .catch(() => {
          toast.error("Failed to load session data")
        })
        .finally(() => {
          setIsLoadingSession(false)
        })
    }
  }, [sessionId, reset])

  const [start, end] = watch(["terms.first_term.startDate", "terms.third_term.endDate"])
  const academicSession =
    start && end
      ? `${parseDate(start).getFullYear()} / ${parseDate(end).getFullYear()}`
      : "_ _ _ _ / _ _ _ _"

  const onSubmit = async (data: SessionFormData) => {
    if (isEdit && session) {
      try {
        const promises = []

        // Update description if changed
        if (data.description !== session.description) {
          promises.push(
            AcademicSessionAPI.update(session.id, {
              description: data.description,
            })
          )
        }

        // Update each term if dates changed
        const termUpdates = [
          { name: "first", data: data.terms.first_term },
          { name: "second", data: data.terms.second_term },
          { name: "third", data: data.terms.third_term },
        ]

        termUpdates.forEach(({ name, data: termData }) => {
          const existingTerm = session.terms?.find((t) =>
            t.name.toLowerCase().includes(name)
          )

          if (
            existingTerm &&
            (existingTerm.startDate !== termData.startDate ||
              existingTerm.endDate !== termData.endDate)
          ) {
            promises.push(
              AcademicTermAPI.update(existingTerm.id!, {
                startDate: termData.startDate,
                endDate: termData.endDate,
              })
            )
          }
        })

        await Promise.all(promises)
        setShowSuccessModal(true)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update session.")
      }
    } else {
      createMutate(
        {
          description: data.description,
          terms: data.terms,
        },
        {
          onSuccess: () => {
            setShowSuccessModal(true)
          },
          onError: (error) => {
            toast.error(
              error instanceof Error ? error.message : "Failed to create session."
            )
          },
        }
      )
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    router.push("/admin/class-management/session")
  }

  // Show loading state while fetching session data
  if (isLoadingSession) {
    return (
      <div className="animate-onrender min-h-[calc(100vh-70px)] p-4 pb-10 lg:p-10">
        <DashboardTitle heading="Edit Session" description="Manage academic session" />
        <div className="mt-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-gray-600">Loading session data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show message for archived sessions
  if (isArchived) {
    return (
      <div className="animate-onrender min-h-[calc(100vh-70px)] p-4 pb-10 lg:p-10">
        <DashboardTitle heading="Edit Session" description="Manage academic session" />

        <div className="mt-8 flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 p-6">
          <CircleAlert className="h-6 w-6 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-900">Cannot Edit Archived Session</h3>
            <p className="text-sm text-amber-800">
              This academic session has been archived and can no longer be edited.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/class-management/session")}
          >
            Back to Sessions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="animate-onrender min-h-[calc(100vh-70px)] p-4 pb-10 lg:p-10">
        <DashboardTitle
          heading={isEdit ? "Edit Session" : "Create Session"}
          description="Manage academic session"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-8">
          <div>
            <label className="text-sm font-medium">Academic Year</label>
            <div className="mt-1 flex h-10 items-center rounded-md border bg-[#EEEEEE] px-3 text-[#666]">
              {academicSession}
            </div>
          </div>

          {/* FIRST TERM */}
          <div className="grid gap-4 lg:grid-cols-2">
            <DateField
              name="terms.first_term.startDate"
              label="First Term Start Date"
              register={register}
              error={errors.terms?.first_term?.startDate}
            />
            <DateField
              name="terms.first_term.endDate"
              label="First Term End Date"
              register={register}
              error={errors.terms?.first_term?.endDate}
            />
          </div>

          {/* SECOND TERM */}
          <div className="grid gap-4 lg:grid-cols-2">
            <DateField
              name="terms.second_term.startDate"
              label="Second Term Start Date"
              register={register}
              error={errors.terms?.second_term?.startDate}
            />
            <DateField
              name="terms.second_term.endDate"
              label="Second Term End Date"
              register={register}
              error={errors.terms?.second_term?.endDate}
            />
          </div>

          {/* THIRD TERM */}
          <div className="grid gap-4 lg:grid-cols-2">
            <DateField
              name="terms.third_term.startDate"
              label="Third Term Start Date"
              register={register}
              error={errors.terms?.third_term?.startDate}
            />
            <DateField
              name="terms.third_term.endDate"
              label="Third Term End Date"
              register={register}
              error={errors.terms?.third_term?.endDate}
            />
          </div>

          <div>
            <label>Description</label>
            <Textarea {...register("description")} className="min-h-[120px]" />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/class-management/session")}
              disabled={isSubmitting || createPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting || createPending}>
              {isSubmitting || createPending ? "Saving..." : isEdit ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        title={isEdit ? "Session Updated!" : "Session Created!"}
        message={
          isEdit
            ? "The academic session has been updated successfully."
            : "The academic session has been created successfully."
        }
        actionLabel="Back to Sessions"
        onAction={handleSuccessModalClose}
      />
    </>
  )
}

export default CreateSessionForm
