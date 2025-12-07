"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
import { useEffect, useState } from "react"
import ActiveSessionGuard from "../../session/_components/active-session-required"
import { useCreateSubject, useGetSubject, useUpdateSubject } from "../_hooks/use-subjects"
import { AlertCircleIcon } from "lucide-react"

export function NewSubjectDialog({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onSuccess: (subject: string) => void
}) {
  const [formData, setFormData] = useState({
    // department: "",
    subjectName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createSubject = useCreateSubject().mutateAsync
  const [error, setError] = useState("")

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">New Subject</DialogTitle>
            <DialogDescription className="text-sm">
              Add a new subject to your school curriculum.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Department Select */}
            {/* <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Department
              </label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, department: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            {!!error && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircleIcon className="size-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Subject Name Input */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Subject Name
              </label>
              <Input
                type="text"
                placeholder="Enter Subject name, eg Biology"
                value={formData.subjectName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subjectName: e.target.value }))
                }
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleCreateSubject}
              disabled={isSubmitting || !formData.subjectName}
              className="w-full"
            >
              {isSubmitting ? "Creating..." : "Create Subject"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {open && <ActiveSessionGuard />}
    </>
  )

  async function handleCreateSubject() {
    setIsSubmitting(true)
    try {
      const createdSubject = await createSubject({ name: formData.subjectName })
      // Reset form
      setFormData({ subjectName: "" })
      onSuccess(createdSubject?.data?.data?.id || "")
      setOpen(false)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }
}

export function EditSubjectDialog({
  open,
  subjectID,
  setOpen,
  onSuccess,
}: {
  open: boolean
  subjectID: string
  setOpen: (open: boolean) => void
  onSuccess: (subject: string) => void
}) {
  const { data: subjectData, isLoading, isError } = useGetSubject(subjectID)
  const updateSubject = useUpdateSubject(subjectID).mutateAsync
  const [formData, setFormData] = useState({
    subjectName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoading && subjectData) {
      console.log("Subject Data:", subjectData)
      setFormData({
        subjectName: subjectData.name,
      })
    }
  }, [subjectData, isLoading])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Subject</DialogTitle>
            <DialogDescription className="text-sm">
              Update the subject details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Department Select */}
            {/* <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Department
              </label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, department: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            {/* Subject Name Input */}
            {isLoading ? (
              <div className="animate-pulse">Loading subject data...</div>
            ) : null}
            {!!error && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircleIcon className="size-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                Subject Name
              </label>
              <Input
                type="text"
                placeholder="Enter Subject name, eg Biology"
                value={formData.subjectName}
                disabled={isLoading || isError}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subjectName: e.target.value }))
                }
                className="w-full"
              />
            </div>
            {isError && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircleIcon className="size-4" />
                <p className="text-sm">Failed to load subject data. Please try again.</p>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleUpdateSubject}
              disabled={isSubmitting || !formData.subjectName}
              className="w-full"
            >
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {open && <ActiveSessionGuard />}
    </>
  )

  async function handleUpdateSubject() {
    setIsSubmitting(true)
    try {
      await updateSubject({ name: formData.subjectName })

      // Reset form
      setFormData({ subjectName: "" })
      setOpen(false)
      onSuccess(formData.subjectName)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }
}
