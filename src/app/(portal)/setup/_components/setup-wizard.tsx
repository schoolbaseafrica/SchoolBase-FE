"use client"

import { createContext, useContext, useState } from "react"
import { WelcomeScreen } from "./welcome-screen"
import Image from "next/image"
import { InstallationStep } from "../_types/setup"
import { DatabaseConfigForm } from "./database-configuration"
import { SchoolInfoForm } from "./school-info"
import { AdminAccountForm } from "./create-super-admin"
import { useSetupWizardPersistence } from "../_hooks/use-restore-form"
import InstallationProgress from "./installation-progress"
import InstallationComplete from "./installation-complete"
import Loading from "@/app/loading"
import { SetupWizardAPI } from "@/lib/api/setup/super-admin-setup-apis"
import { toast } from "sonner"

export default function SchoolSetupWizard() {
  const [isInstalling, setIsInstalling] = useState<boolean>(false)
  const [installProgress, setInstallProgress] = useState<number>(0)
  const [installationSteps, setInstallationSteps] = useState<InstallationStep[]>([
    { label: "Validating Account Information", completed: false },
    { label: "Creating Database Schema", completed: false },
    { label: "Installing Core Modules", completed: false },
    { label: "Configuring Your School Profile", completed: false },
    { label: "Finalizing Setup", completed: false },
  ])
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [error, setError] = useState("")

  const { formData, updateForm, currentStep, setCurrentStep, isLoaded, clearStorage } =
    useSetupWizardPersistence({
      database: { name: "", host: "", username: "", type: "", password: "", port: 8000 },
      school: { logo: null, name: "", brandColor: "#DA3743", phone: "", address: "" },
      admin: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
    })

  async function handleNext(): Promise<void> {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    } else {
      await handleInstallation()
    }
  }

  async function handleInstallation(): Promise<void> {
    setIsInstalling(true)
    setInstallProgress(0)
    setError("")

    const steps = [...installationSteps]

    await new Promise((resolve) => setTimeout(resolve, 300))
    steps[0].completed = true
    setInstallationSteps([...steps])
    setInstallProgress((1 / steps.length) * 100)

    try {
      await stepApiCall(
        SetupWizardAPI.createDatabase({
          database_name: formData.database.name,
          database_host: formData.database.host,
          database_type: formData.database.type,
          database_port: Number(formData.database.port),
          database_username: formData.database.username,
          database_password: formData.database.password,
        }),
        1
      )

      await stepApiCall(
        SetupWizardAPI.installSchool({
          name: formData.school.name,
          address: formData.school.address,
          email: formData.admin.email,
          phone: formData.school.phone,
          // logo: formData.school.logo,
          primary_color: formData.school.brandColor,
          // secondary_color: "#FFFFFF",
          // accent_color: "#000000",
        }),
        2
      )

      await stepApiCall(
        SetupWizardAPI.createSuperAdmin({
          school_name: formData.school.name,
          first_name: formData.admin.firstName,
          last_name: formData.admin.lastName,
          email: formData.admin.email,
          password: formData.admin.password,
          confirm_password: formData.admin.confirmPassword,
        }),
        3
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred."
      console.error("❌ Setup Wizard Failed:", message)
      toast.error(`Setup Failed ❗ ${message}`) // UI feedback here
      setError(message)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 300))
    steps.slice(-1)[0].completed = true
    setInstallationSteps([...steps])
    setInstallProgress((1 / steps.length) * 100)

    await new Promise((resolve) => setTimeout(resolve, 500))
    setIsComplete(true)
    clearStorage()
  }

  async function stepApiCall(
    apiCall: Promise<unknown>,
    stepIndex: number
  ): Promise<void> {
    const dbKey = `extra-${stepIndex}`

    try {
      await apiCall
      const steps = [...installationSteps]
      steps[stepIndex].completed = true
      setInstallationSteps([...steps])
      setInstallProgress(((1 + stepIndex) / steps.length) * 100)
      updateForm("extra", dbKey, "done") // incase of 409 error
    } catch (error) {
      if (error instanceof Error) {
        const accountExists = error?.message?.includes("already exists")
        const isARetry = formData.extra?.[dbKey] === "done"
        if (accountExists && isARetry) {
          return
        }
      }
      throw error
    }
  }

  function handleBack(): void {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  if (!isLoaded) {
    return <Loading text="Loading Setup Wizard..." />
  }

  return (
    <SetupStepProvider value={setCurrentStep}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="mb-2 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logo.svg"
                alt="School Base Logo"
                width={50}
                height={50}
              />
              <span className="text-accent hidden text-2xl font-bold md:block">
                SCHOOLBASE
              </span>
            </div>
          </div>

          {currentStep === 0 && <WelcomeScreen onStart={handleNext} />}
          {currentStep === 1 && (
            <DatabaseConfigForm
              formData={formData}
              updateFormData={updateForm}
              onSubmit={handleNext}
              onCancel={handleBack}
            />
          )}
          {currentStep === 2 && (
            <SchoolInfoForm
              formData={formData}
              updateFormData={updateForm}
              onSubmit={handleNext}
              onCancel={handleBack}
            />
          )}
          {currentStep === 3 && !isInstalling && (
            <AdminAccountForm
              formData={formData}
              updateFormData={updateForm}
              onSubmit={handleInstallation}
              onCancel={handleBack}
            />
          )}
          {isInstalling && !isComplete && (
            <InstallationProgress
              progress={installProgress}
              steps={installationSteps}
              error={error}
              retryInstallation={handleInstallation}
            />
          )}
          {isComplete && <InstallationComplete />}
        </div>
      </div>
    </SetupStepProvider>
  )
}

// Context to provide step control to child components
const SetupStepContext = createContext<((step: number) => void) | undefined>(undefined)

export const SetupStepProvider = SetupStepContext.Provider

// demo use

export const useSetupStep = () => {
  const context = useContext(SetupStepContext)
  if (!context) {
    throw new Error("useSetupStep must be used within a SetupStepProvider")
  }
  return context
}
