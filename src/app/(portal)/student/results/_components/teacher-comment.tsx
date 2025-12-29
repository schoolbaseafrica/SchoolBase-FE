"use client"

import { Grade } from "@/types/result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeacherCommentProps {
  results: Grade[]
}

export function TeacherComment({ results }: TeacherCommentProps) {
  // Get the first non-empty comment, or show a default message
  const comment =
    results.find((r) => r.comment)?.comment ||
    "No teacher comments available for this term."

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Class Teacher Comment</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{comment}</p>
      </CardContent>
    </Card>
  )
}
