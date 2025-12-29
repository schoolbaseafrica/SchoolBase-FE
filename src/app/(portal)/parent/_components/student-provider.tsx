"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useGetParentStudents } from "../_hooks/use-parent-students"
import { Student } from "@/lib/parents/client"
import { NoStudentLinkedModal } from "./no-assigned-student-modal"

interface StudentContextParams {
  studentID?: string
  selectedStudent?: Student
  students: Student[]
  setSelectedStudentID: (id: string) => void
  isLoading: boolean
}

const StudentContext = createContext<StudentContextParams | null>(null)

export const StudentProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: students, isLoading, error } = useGetParentStudents()

  // Ensure students is always an array
  const studentsArray = Array.isArray(students) ? students : []

  const [_selectedID, setSelectedID] = useState<string | undefined>(undefined)

  // Ensure selectedID is always defined if students exist
  // This prevents the Select component from switching between controlled/uncontrolled
  const selectedID =
    _selectedID ?? (studentsArray.length > 0 ? studentsArray[0].id : undefined)

  // Modal visibility - only show if not loading and actually no students
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Only show modal if loading is complete AND there are truly no students
    // Don't show modal while still loading
    if (isLoading) {
      setShowModal(false)
      return
    }

    // After loading completes, check if we have students
    const is404 = error?.message?.includes("not found") || error?.message?.includes("404")
    const hasNoStudents = studentsArray.length === 0

    if (hasNoStudents || is404) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [isLoading, studentsArray.length, error])

  // Auto-select first student when students are loaded
  useEffect(() => {
    if (studentsArray.length > 0 && !_selectedID) {
      setSelectedID(studentsArray[0].id)
    }
  }, [studentsArray, _selectedID])

  function handleSelectStudent(studentID: string) {
    setSelectedID(studentID)
  }

  const data = {
    studentID: selectedID,
    selectedStudent: studentsArray.find((s) => s.id === selectedID),
    students: studentsArray,
    setSelectedStudentID: handleSelectStudent,
    isLoading,
  }

  return (
    <StudentContext.Provider value={data}>
      {children}

      {/* Modal appears when no students assigned */}
      <NoStudentLinkedModal open={showModal} onClose={() => setShowModal(false)} />
    </StudentContext.Provider>
  )
}

export const useParentStudents = () => {
  const context = useContext(StudentContext)
  if (!context) {
    throw new Error("useParentStudents must be used within a SetupStepProvider")
  }
  return context
}
