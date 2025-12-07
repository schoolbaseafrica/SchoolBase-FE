"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, Loader2Icon, Search, UserCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { useAssignTeachersToClassSubject } from "../../class-management/_hooks/use-classes"
import { useGetTeachers } from "../../teachers/_hooks/use-teachers"
import { SnakeUser as User } from "@/types/user"
import { toast } from "sonner"

interface AssignTeacherDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  classSubjectId: string
  subjectName: string
  className: string
  currentTeacher?: {
    id: string
    name: string
  }
}

export default function AssignTeacherDialog({
  open,
  setOpen,
  classSubjectId,
  subjectName,
  className,
  currentTeacher,
}: AssignTeacherDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch teachers based on search query
  const {
    data: teachersData,
    isLoading: isLoadingTeachers,
    isError: isErrorTeachers,
  } = useGetTeachers({
    is_active: true,
    search: debouncedSearch,
    limit: 3,
  })

  const assignMutation = useAssignTeachersToClassSubject()

  const topThreeTeachers = teachersData?.slice(0, 3)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Show dropdown when typing
  useEffect(() => {
    if (searchQuery.length >= 2 && !selectedTeacher) {
      setShowDropdown(true)
    }
  }, [searchQuery, selectedTeacher])

  return (
    <>
      <Dialog open={open && !showSuccessDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Assign Teacher</DialogTitle>
            <DialogDescription className="text-sm">
              Assign a teacher to {subjectName} for {className}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Teacher Info */}
            {currentTeacher && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="mb-1 text-xs text-gray-600">Current Teacher</p>
                <p className="text-sm font-medium text-gray-900">{currentTeacher.name}</p>
              </div>
            )}

            {/* Teacher Search Input */}
            <div className="relative">
              <label className="mb-2 block cursor-pointer text-sm font-medium text-gray-900">
                Search Teacher
              </label>
              <div className="relative">
                <Search className="text-text-secondary absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type teacher name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedTeacher(null)
                  }}
                  onFocus={() => {
                    if (searchQuery.length >= 2) {
                      setShowDropdown(true)
                    }
                  }}
                  className="h-11 pr-4 pl-9"
                  disabled={assignMutation.isPending}
                />
              </div>

              {/* Dropdown */}
              {showDropdown && searchQuery.length >= 2 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
                >
                  {isLoadingTeachers ? (
                    <div className="space-y-2 p-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isErrorTeachers ? (
                    <div className="p-3 text-center">
                      <p className="text-sm text-red-600">Failed to load teachers</p>
                    </div>
                  ) : topThreeTeachers?.length && topThreeTeachers.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      {topThreeTeachers.map((teacher: User) => (
                        <button
                          key={teacher.id}
                          onClick={() => handleSelectTeacher(teacher)}
                          className="flex w-full items-center gap-3 p-3 transition-colors hover:bg-gray-50"
                          type="button"
                        >
                          {teacher.photo_url ? (
                            <Image
                              src={teacher.photo_url}
                              alt={getTeacherName(teacher)}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                              <UserCircle className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {teacher.title} {getTeacherName(teacher)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {teacher.employment_id}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center">
                      <p className="text-sm text-gray-600">No teachers found</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Teacher Display */}
            {selectedTeacher && (
              <div className="rounded-lg border-2 border-green-500 bg-green-50 p-3">
                <p className="mb-2 text-xs text-green-700">Selected Teacher</p>
                <div className="flex items-center gap-3">
                  {selectedTeacher.photo_url ? (
                    <Image
                      src={selectedTeacher.photo_url}
                      alt={getTeacherName(selectedTeacher)}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-200">
                      <UserCircle className="h-7 w-7 text-green-700" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedTeacher.title} {getTeacherName(selectedTeacher)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedTeacher.employment_id}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hint Text */}
            {!selectedTeacher && searchQuery.length < 2 && (
              <p className="text-xs text-gray-500">
                Type at least 2 characters to search for teachers
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={assignMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignTeacher}
                disabled={!selectedTeacher || assignMutation.isPending}
                className="flex-1"
              >
                {assignMutation.isPending ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Teacher"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="size-10 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Teacher Assigned Successfully
            </h3>
            <p className="text-text-secondary mb-6 text-sm">
              {selectedTeacher?.title}{" "}
              {selectedTeacher && getTeacherName(selectedTeacher)} has been assigned to
              teach {subjectName} for {className}
            </p>
            <Button onClick={handleCloseSuccess} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )

  function getTeacherName(teacher: User) {
    if (teacher) {
      return `${teacher.first_name} ${teacher.last_name}`
    }
    return "Unknown Teacher"
  }

  function handleSelectTeacher(teacher: User) {
    setSelectedTeacher(teacher)
    const displayName = `${teacher.title ?? ""} ${getTeacherName(teacher)}`
    setSearchQuery(displayName.trim())
    setShowDropdown(false)
  }

  async function handleAssignTeacher() {
    if (!selectedTeacher) return

    try {
      await assignMutation.mutateAsync({
        class_subject_id: classSubjectId,
        teacher_id: selectedTeacher.id,
      })
      setShowSuccessDialog(true)
      setOpen(false)
    } catch (error) {
      console.error("Failed to assign teacher:", error)
      toast.error("Failed to assign teacher. Please try again.")
    }
  }

  function handleClose() {
    if (!assignMutation.isPending) {
      setOpen(false)
      resetForm()
    }
  }

  function handleCloseSuccess() {
    setShowSuccessDialog(false)
    resetForm()
  }

  function resetForm() {
    setSearchQuery("")
    setSelectedTeacher(null)
    setShowDropdown(false)
  }
}
