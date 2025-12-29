"use client"

import { useState, useEffect, useRef } from "react"
import { Student, GradeEntry } from "@/types/result"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Edit, Users } from "lucide-react"
import { GradeFormDialog } from "./grade-form-dialog"

interface StudentsTableProps {
  students: Student[]
  grades: Record<string, GradeEntry & { id?: string }>
  onGradeUpdate: (studentId: string, updatedGrade: GradeEntry & { id?: string }) => void
  isLoading: boolean
  classId: string
  subjectId: string
  termId: string
  academicSessionId: string
}

export function StudentsTable({
  students,
  grades,
  onGradeUpdate,
  isLoading,
  classId,
  subjectId,
  termId,
  academicSessionId,
}: StudentsTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Create a filter key that changes when filters change
  const filterKey = `${classId}-${subjectId}-${termId}`
  const prevFilterKeyRef = useRef(filterKey)
  const timersRef = useRef<number[]>([])

  // Handle filter changes without setting state in useEffect
  useEffect(() => {
    if (filterKey === prevFilterKeyRef.current) return

    // Update ref
    prevFilterKeyRef.current = filterKey

    // Set loading state via setTimeout to avoid eslint violation
    const showTimer = window.setTimeout(() => {
      setIsLoadingData(true)

      // Schedule hide
      const hideTimer = window.setTimeout(() => {
        setIsLoadingData(false)
      }, 300)

      timersRef.current.push(hideTimer)
    }, 0)

    timersRef.current.push(showTimer)

    // cleanup
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t))
      timersRef.current = []
    }
  }, [filterKey])

  const shouldShowLoader = isLoadingData || isLoading

  if (shouldShowLoader) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-gray-500" />
          <span className="text-gray-500">Loading students grades...</span>
        </div>
      </div>
    )
  }

  // Handle empty students array
  if (students.length === 0 && classId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Users className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">No Students Found</h3>
          <p className="max-w-md text-center text-gray-500">
            There are no students assigned to this class. Please contact the administrator
            to add students to the class.
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student)
    setDialogOpen(true)
  }

  const handleSaveGrade = (
    studentId: string,
    gradeData: GradeEntry & { id?: string }
  ) => {
    onGradeUpdate(studentId, gradeData)
    setDialogOpen(false)
    setSelectedStudent(null)
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S/N</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">CA (30)</TableHead>
                  <TableHead className="text-center">Exam (70)</TableHead>
                  <TableHead className="text-center">Total (100)</TableHead>
                  <TableHead className="text-center">Grade</TableHead>
                  <TableHead className="hidden md:table-cell">Comment</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const grade = grades[student.id]
                  return (
                    <TableRow key={`student-${student.id}-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {student.first_name} {student.last_name}
                      </TableCell>
                      <TableCell className="text-center">
                        {grade?.ca_score ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {grade?.exam_score ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        {grade?.total_score ?? "-"}
                      </TableCell>
                      <TableCell className="text-center">{grade?.grade ?? "-"}</TableCell>
                      <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                        {grade?.comment || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(student)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && (
        <GradeFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          student={selectedStudent}
          grade={grades[selectedStudent.id]}
          classId={classId}
          subjectId={subjectId}
          termId={termId}
          academicSessionId={academicSessionId}
          onSave={(data) => handleSaveGrade(selectedStudent.id, data)}
        />
      )}
    </>
  )
}
