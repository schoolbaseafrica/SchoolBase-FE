import { cn } from "@/lib/utils"
import { CheckCircle2Icon } from "lucide-react"
import React from "react"
import { useSetupStep } from "./setup-wizard"

interface ProgressIndicatorProps {
  currentStep: number
}

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const setCurrentStep = useSetupStep()
  const handleStepClick = (stepNumber: number) => {
    if (stepNumber < currentStep) setCurrentStep(stepNumber)
  }

  const steps = [
    { number: 1, label: "Database", completed: currentStep > 1 },
    { number: 2, label: "School info", completed: currentStep > 2 },
    { number: 3, label: "Admin", completed: currentStep > 3 },
  ]

  return (
    <div className="items-shrink-0 mb-8 flex items-center justify-center gap-1">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div
            className={`flex flex-shrink-0 items-center gap-1 md:gap-2 ${step.completed ? "cursor-pointer" : ""}`}
            onClick={() => handleStepClick(step.number)}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium",
                step.completed
                  ? "bg-green-500 text-white"
                  : currentStep === step.number
                    ? "bg-accent h-8 w-8 text-base text-white"
                    : "bg-gray-300 text-gray-600"
              )}
            >
              {step.completed ? <CheckCircle2Icon className="h-5 w-5" /> : step.number}
            </div>
            <span
              className={`text-sm ${currentStep === step.number ? "font-medium text-gray-900" : "text-gray-500"}`}
            >
              {step.label}
            </span>
          </div>
          <>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 ${step.completed ? "bg-green-500" : "bg-gray-300"}`}
              />
            )}
          </>
        </React.Fragment>
      ))}
    </div>
  )
}
