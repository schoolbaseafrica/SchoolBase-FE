"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, ExternalLink, FileText } from "lucide-react"

interface DocumentItemProps {
  title: string
  lastUpdated: string
}

const DocumentItem = ({ title, lastUpdated }: DocumentItemProps) => {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-4">
        <div className="bg-muted rounded-lg p-2">
          <FileText className="text-muted-foreground h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 border text-sm text-[#535353] hover:border-2 hover:bg-white"
        >
          <ExternalLink className="h-4 w-4" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 border text-sm text-[#535353] hover:border-2 hover:bg-white"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  )
}

export const LegalSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Legal & Privacy</h2>
        <p className="text-muted-foreground">
          Review our terms, privacy policy, and legal documents.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 px-6">
          <DocumentItem title="Terms of Service" lastUpdated="January 2024" />
          <DocumentItem title="Privacy Policy" lastUpdated="January 2024" />
          <DocumentItem title="Data Processing Agreement" lastUpdated="January 2024" />
        </CardContent>
      </Card>
    </div>
  )
}
