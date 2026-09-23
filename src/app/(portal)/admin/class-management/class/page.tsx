import DashboardTitle from "@/components/dashboard/dashboard-title"
import ClassesPageContent from "../../_components/classes/classes-page-content"
import { AcademicPeriodSelector } from "../../_components/academic-period-selector"

const ClassesPage = () => {
  return (
    <div className="bg-[#FAFAFA] px-2 pt-4 lg:px-4">
      {/* empty state */}
      <div className="p-5">
        <DashboardTitle heading="Classes" description="View, manage, or create classes" />
        <AcademicPeriodSelector sessionOnly />

        <ClassesPageContent />
      </div>
    </div>
  )
}

export default ClassesPage
