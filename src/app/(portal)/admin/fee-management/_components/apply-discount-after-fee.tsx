"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FeesAPI } from "@/lib/fees"
import { useAcademicTermsForSession } from "../../class-management/_hooks/use-academic-term"
import { StudentFeeDiscount } from "../../students/_components/student-fee-discount"

export function ApplyDiscountAfterFee({
  feeId,
  sessionId,
  termId,
  onDone,
}: {
  feeId: string
  sessionId: string
  termId?: string
  onDone: () => void
}) {
  const [studentId, setStudentId] = useState("")
  const [selectedTermId, setSelectedTermId] = useState(termId ?? "")
  const [search, setSearch] = useState("")
  const {
    data: studentsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["fee-students", feeId],
    queryFn: () => FeesAPI.getFeeStudents(feeId),
  })
  const { data: terms } = useAcademicTermsForSession(termId ? undefined : sessionId)
  const students = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return (studentsResponse?.data?.data ?? [])
      .filter(
        (student) =>
          !query ||
          `${student.name} ${student.registration_number}`
            .toLocaleLowerCase()
            .includes(query)
      )
      .sort(
        (left, right) =>
          left.name.localeCompare(right.name, undefined, { sensitivity: "base" }) ||
          left.registration_number.localeCompare(right.registration_number)
      )
  }, [studentsResponse, search])

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h3 className="text-lg font-semibold">Fee saved. Apply a student discount</h3>
        <p className="text-sm text-gray-600">
          Choose a student assigned to this fee. Preview a code against their updated
          total bill, then confirm it. You can repeat this for other students or finish
          now.
        </p>
      </div>
      {!termId && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Term for this discount</label>
          <Select value={selectedTermId} onValueChange={setSelectedTermId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a term" />
            </SelectTrigger>
            <SelectContent>
              {(terms ?? []).map((term) => (
                <SelectItem key={term.id} value={term.id}>
                  {term.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium">Student</label>
        <Input
          placeholder="Search assigned students by name or ID"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setStudentId("")
          }}
        />
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading assigned students...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Could not load assigned students.</p>
        ) : students.length === 0 ? (
          <p className="text-sm text-gray-500">
            No assigned student matches this search.
          </p>
        ) : (
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} ({student.registration_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {studentId && selectedTermId && (
        <StudentFeeDiscount
          key={`${studentId}:${selectedTermId}`}
          studentId={studentId}
          sessionId={sessionId}
          termId={selectedTermId}
        />
      )}
      <Button type="button" variant="outline" onClick={onDone}>
        Done
      </Button>
    </div>
  )
}
