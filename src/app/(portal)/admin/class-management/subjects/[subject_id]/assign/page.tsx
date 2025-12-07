import { Button } from "@/components/ui/button"
import { ChevronLeftIcon } from "lucide-react"
import Link from "next/link"
import AssignSubjectPageContent from "../../_components/assign-subject-page-content"

export default function AssignSubjectPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-start gap-4">
        {/* Back Button */}
        <Button asChild variant="ghost" size="icon" className="bg-gray-100">
          <Link href="/admin/class-management/subjects">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Assign Subject</h2>
          <p className="text-text-secondary mt-1 text-sm">
            Assign subject to respective classes
          </p>
        </header>
      </div>

      <AssignSubjectPageContent />
    </div>
  )
}
