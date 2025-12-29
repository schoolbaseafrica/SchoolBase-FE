"use client"

import { LucideIcon } from "lucide-react"
import { FileText } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  action?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileText,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
      <div className="mx-auto max-w-md">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gray-100 p-4">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mb-6 text-gray-600">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}
