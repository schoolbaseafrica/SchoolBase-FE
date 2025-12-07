"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GradingScale } from "@/types/result"

interface GradingScaleCardProps {
  gradingScale: GradingScale[]
}

export function GradingScaleCard({}: GradingScaleCardProps) {
  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="font-medium">
            <span className="text-yellow-600">Grading Scale:</span>A (80-100), B (70-79),
            C (60-69), D(50-59), E (40-49), F (0-39)
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  )
}
