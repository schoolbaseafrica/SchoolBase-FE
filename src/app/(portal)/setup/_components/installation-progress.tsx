import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, CircleXIcon } from "lucide-react"
interface InstallationStep {
  label: string
  completed: boolean
}

interface InstallationProgressProps {
  progress: number
  steps: InstallationStep[]
  error: string | null
  retryInstallation: () => void
}

export default function InstallationProgress({
  progress,
  steps,
  error,
  retryInstallation,
}: InstallationProgressProps) {
  return (
    <div className="p-2 py-6 text-center md:p-12">
      <h1 className="mb-3 text-3xl font-semibold text-gray-900">
        Installation in Progress
      </h1>
      <p className="mb-12 text-gray-600">
        This might take a few minutes. Please dont close this window.
      </p>

      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-700">Installing core modules....</span>
          <span className="text-accent text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="bg-accent h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-500">Error: {error}</p>}
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          // get at what stage it failed
          const thisFailed = error && index > 0 && steps[index - 1].completed
          return (
            <div key={index} className="animate-onrender flex items-center gap-3">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  step.completed
                    ? "bg-green-500"
                    : thisFailed
                      ? "bg-red-400"
                      : "bg-gray-300"
                }`}
              >
                {step.completed && <CheckCircle2Icon className="h-4 w-4 text-white" />}
                {!step.completed && !!thisFailed && (
                  <CircleXIcon className="h-4 w-4 text-white" />
                )}
              </div>
              <span
                className={`text-sm ${step.completed ? "text-gray-900" : thisFailed ? "text-red-400" : "text-gray-500"}`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      {error && (
        <Button className="mt-8" onClick={retryInstallation}>
          Retry Installation
        </Button>
      )}
    </div>
  )
}
