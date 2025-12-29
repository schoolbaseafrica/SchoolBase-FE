"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"

interface InfoStateProps {
  title: string
  message: string
  variant?: "info" | "warning"
}

export function InfoState({ title, message, variant = "info" }: InfoStateProps) {
  const variantStyles = {
    info: "border-red-200 bg-red-50 text-red-500",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
  }

  return (
    <Card className={variantStyles[variant]}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold">{title}</h4>
            <p className="mt-1 text-sm">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
