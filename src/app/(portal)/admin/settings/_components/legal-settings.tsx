import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, FileText } from "lucide-react"

interface DocumentItemProps {
  title: string
  href: string
}

const DocumentItem = ({ title, href }: DocumentItemProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:border-accent/40 hover:bg-accent/5 flex flex-col justify-between gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center"
    >
      <div className="flex items-start gap-4">
        <div className="bg-muted rounded-lg p-2">
          <FileText className="text-muted-foreground h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
        </div>
      </div>
      <span className="text-accent flex items-center justify-end gap-2 text-sm font-medium">
        <ExternalLink className="size-4" /> View
      </span>
    </a>
  )
}

export const LegalSettings = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Legal & Privacy</h2>
        <p className="text-muted-foreground">
          Review the published terms and public website privacy policy. Your school is
          responsible for its own student and staff data policies.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 px-6">
          <DocumentItem title="Terms of Service" href="https://schoolbase.africa/terms" />
          <DocumentItem
            title="Website Privacy Policy"
            href="https://schoolbase.africa/privacy"
          />
        </CardContent>
      </Card>
    </div>
  )
}
