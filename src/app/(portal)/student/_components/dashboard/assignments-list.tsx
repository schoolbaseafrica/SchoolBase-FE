"use client"

import { Dot } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Assignment {
  title: string
  subject: string
  dueDate: string
  status: string
}

interface AssignmentsListProps {
  assignments: Assignment[]
  isLoading?: boolean
}

export function AssignmentsList({ assignments, isLoading }: AssignmentsListProps) {
  const router = useRouter()

  const handleGoToAssignments = () => {
    router.push("/student/assignments")
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold text-gray-800">Assignments</h2>
        {assignments.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-sm"
            onClick={handleGoToAssignments}
          >
            View All
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="py-4 text-center">
            <p className="mb-2 text-gray-500">No assignments at this time</p>
            <Button variant="outline" size="sm" onClick={handleGoToAssignments}>
              Go to Assignments
            </Button>
          </div>
        ) : (
          assignments.map((assignment, index) => (
            <div key={index} className="grid grid-cols-[2fr_60fr_15fr] p-3">
              <Dot />
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium text-gray-800">{assignment.title}</div>
                  <div className="text-sm text-gray-600">{assignment.subject}</div>
                </div>
              </div>
              <div>
                <span className="text-xs font-medium text-red-600">
                  {assignment.dueDate}
                </span>
                <p className="mt-1 text-xs text-gray-500">Status: {assignment.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
