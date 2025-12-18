"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

interface SubjectsEmptyStateProps {
  className?: string
}

export function SubjectsEmptyState({ className = "" }: SubjectsEmptyStateProps) {
  return (
    <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
          <div className="flex-1">
            <h4 className="font-semibold text-yellow-700">No Subjects Assigned</h4>
            <p className="mt-1 text-sm text-yellow-600">
              You are not assigned to teach any subjects in this class. Please contact the
              administrator or select a different class.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
