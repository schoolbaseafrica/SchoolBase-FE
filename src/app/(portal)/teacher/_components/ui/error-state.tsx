"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Users, BookOpen } from "lucide-react"

interface ErrorStateProps {
  title: string
  message: string
  icon?: "alert" | "users" | "book"
  action?: React.ReactNode
}

export function ErrorState({ title, message, icon = "alert", action }: ErrorStateProps) {
  const IconComponent = {
    alert: AlertCircle,
    users: Users,
    book: BookOpen,
  }[icon]

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="flex flex-col items-center justify-center p-8">
        <IconComponent className="mb-4 h-12 w-12 text-red-400" />
        <h3 className="mb-2 text-lg font-semibold text-red-700">{title}</h3>
        <p className="mb-6 max-w-md text-center text-red-600">{message}</p>
        {action && action}
      </CardContent>
    </Card>
  )
}
