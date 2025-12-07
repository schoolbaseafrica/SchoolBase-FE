import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import DashboardTitle from "@/components/dashboard/dashboard-title"
import AssignStudentsPageContent from "@/app/(portal)/admin/_components/classes/assign-student-page-content"

export default function AssignSubjectPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="lg:mx-5">
        <div className="flex items-start gap-4">
          {/* Back Button */}
          <Button asChild variant="ghost" size="icon" className="bg-gray-100">
            <Link href="/admin/class-management/subjects">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
          </Button>

          {/* Header */}
          <DashboardTitle
            heading="Assign Student"
            description="Assign students to this class"
          />
        </div>

        <AssignStudentsPageContent />
      </div>
    </div>
  )
}
