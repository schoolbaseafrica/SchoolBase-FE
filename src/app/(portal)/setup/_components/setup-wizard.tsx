"use client"

import { createContext, useContext, useState, useEffect } from "react"
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
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(true)

  const {
    formData,
    updateForm,
    currentStep,
    setCurrentStep,
    isLoaded,
    clearStorage,
    setFormData,
  } = useSetupWizardPersistence({
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

  // Load existing school data if available (for incomplete installations)
  // This runs AFTER IndexedDB loads to ensure API data takes precedence
  useEffect(() => {
    async function loadExistingSchoolData() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008"
        const response = await fetch(`${baseUrl}/api/v1/school`, {
          method: "GET",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const responseData = await response.json()
          const schoolData = responseData?.data || responseData

          console.log("[SetupWizard] School API response:", schoolData)
          console.log(
            "[SetupWizard] installation_completed value:",
            schoolData?.installation_completed,
            "Type:",
            typeof schoolData?.installation_completed
          )

          // Pre-populate form if school data exists (regardless of installation_completed status)
          // This allows users to see/edit existing data if they reach the setup page
          if (schoolData && schoolData.id) {
            console.log("[SetupWizard] Loading existing school data to populate form:", {
              name: schoolData.name,
              address: schoolData.address,
              phone: schoolData.phone,
              email: schoolData.email,
              primary_color: schoolData.primary_color,
              installation_completed: schoolData.installation_completed,
            })

            // Update form data immediately - React will handle the state update
            setFormData((prev) => {
              // Only update if we have actual data from API (not empty strings)
              const updated = {
                ...prev,
                school: {
                  ...prev.school,
                  // Only override if API has non-empty values
                  name: schoolData.name ? schoolData.name : prev.school.name,
                  address: schoolData.address ? schoolData.address : prev.school.address,
                  phone: schoolData.phone ? schoolData.phone : prev.school.phone,
                  brandColor: schoolData.primary_color
                    ? schoolData.primary_color
                    : prev.school.brandColor,
                },
                admin: {
                  ...prev.admin,
                  email: schoolData.email ? schoolData.email : prev.admin.email,
                },
              }
              console.log("[SetupWizard] Updated formData:", updated)
              console.log(
                "[SetupWizard] School name in updated state:",
                updated.school.name
              )
              return updated
            })

            if (schoolData.installation_completed !== true) {
              toast.info("Existing school data loaded. Please complete the setup.")
            } else {
              toast.info(
                "Existing school data loaded. You can review or update the information."
              )
            }
          } else {
            console.log("[SetupWizard] No valid school data found")
          }
        }
      } catch (error) {
        // Silently fail - we'll just use empty defaults
        console.log("[SetupWizard] No existing school data found, starting fresh:", error)
      } finally {
        setIsLoadingExistingData(false)
      }
    }

    if (isLoaded) {
      // Add a small delay to ensure IndexedDB load completes first
      const timer = setTimeout(() => {
        loadExistingSchoolData()
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [isLoaded, setFormData]) // Added setFormData back to dependencies

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
          // Include admin details for first admin creation
          admin_first_name: formData.admin.firstName,
          admin_last_name: formData.admin.lastName,
          admin_password: formData.admin.password,
        }),
        2
      )

      // Create super admin (this may fail if installation is already complete or super admin exists)
      // We catch the error and continue if it's a known non-fatal issue
      try {
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
      } catch (superAdminError: any) {
        // If super admin creation fails due to database error, already exists, or installation complete,
        // treat it as a non-fatal error and continue (the installation is still successful)
        const errorMessage = superAdminError?.message || String(superAdminError) || ""
        const isNonFatalError =
          errorMessage.toLowerCase().includes("already exists") ||
          errorMessage.toLowerCase().includes("installation") ||
          errorMessage.toLowerCase().includes("database operation failed") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          superAdminError?.response?.status === 500

        if (isNonFatalError) {
          console.warn(
            "[SetupWizard] Super admin creation failed (non-fatal), continuing:",
            errorMessage
          )
          // Mark step as complete anyway since installation succeeded
          const currentSteps = [...installationSteps]
          if (currentSteps[3]) {
            currentSteps[3].completed = true
            setInstallationSteps([...currentSteps])
            setInstallProgress((4 / currentSteps.length) * 100)
          }
        } else {
          // Re-throw if it's a different error that we should handle
          throw superAdminError
        }
      }
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

  if (!isLoaded || isLoadingExistingData) {
    return <Loading />
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
              key={`school-info-${formData.school.name}-${formData.school.phone}`} // Force re-render when data changes
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
