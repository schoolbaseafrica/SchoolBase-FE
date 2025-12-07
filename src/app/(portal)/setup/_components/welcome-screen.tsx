import { Button } from "@/components/ui/button"
import { DatabaseIcon, ListChecksIcon, SchoolIcon, ShieldUserIcon } from "lucide-react"

interface StepItemProps {
  icon: React.ReactNode
  label: string
  index: number
}

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="p-2 md:p-12">
      <h1 className="animate-onrender mb-3 text-center text-3xl font-semibold text-gray-900">
        Welcome to SchoolBase
      </h1>
      <p className="mb-8 text-center text-gray-600">
        Follow the steps to complete the set up process for your school&apos;s new portal.
      </p>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Installation Steps</h2>
        <div className="rounded-xl border border-gray-300">
          <StepItem
            icon={<ListChecksIcon className="h-5 w-5" />}
            label="Prerequisites Check"
            index={1}
          />
          <StepItem
            icon={<DatabaseIcon className="h-5 w-5" />}
            label="Database Configuration"
            index={2}
          />
          <StepItem
            icon={<ShieldUserIcon className="h-5 w-5" />}
            label="Super Admin Account Creation"
            index={3}
          />
          <StepItem
            icon={<SchoolIcon className="h-5 w-5" />}
            label="School Details Setup"
            index={4}
          />
        </div>
      </div>

      <Button onClick={onStart} className="w-full">
        Begin Installation
      </Button>
    </div>
  )
}

function StepItem({ icon, label, index }: StepItemProps) {
  const styles = { transitionDelay: `${index * 100}ms` }

  return (
    // let all children have the animate-onrender class but delay based on wt nth child the parent is
    <div className="flex items-center gap-3 border-b border-gray-300 p-4 last:border-b-0">
      <div
        className="text-accent animate-onrender rounded-full bg-red-100 p-3"
        style={styles}
      >
        {icon}
      </div>
      <span className="animate-onrender text-gray-700" style={styles}>
        {label}
      </span>
    </div>
  )
}
