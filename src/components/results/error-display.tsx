"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  variant?: "destructive" | "default"
}

export function ErrorDisplay({
  title = "Error",
  message,
  onRetry,
  variant = "destructive",
}: ErrorDisplayProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-red-50 p-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mb-4 text-gray-600">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  )
}
