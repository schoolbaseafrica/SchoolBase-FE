"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { WelcomeScreen } from "./welcome-screen"
import Image from "next/image"
import { InstallationStep } from "../_types/setup"
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
    { label: "Validating setup secret", completed: false },
    { label: "Saving school details", completed: false },
    { label: "Creating the first superadmin", completed: false },
  ])
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [error, setError] = useState("")
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(true)
  const [setupSecret, setSetupSecret] = useState("")
  const [schoolInstalled, setSchoolInstalled] = useState(false)

  const {
    formData,
    updateForm,
    currentStep,
    setCurrentStep,
    isLoaded,
    clearStorage,
    setFormData,
  } = useSetupWizardPersistence({
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
        const response = await fetch("/api/proxy-auth/school", {
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

          // A saved school can be resumed if superadmin creation failed.
          if (schoolData && schoolData.id) {
            if (schoolData.installation_completed === true) {
              setSchoolInstalled(true)
              setCurrentStep(2)
            }
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

            if (schoolData.installation_completed === true)
              toast.info("School details are saved. Complete the superadmin account.")
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
  }, [isLoaded, setFormData, setCurrentStep])

  async function handleNext(): Promise<void> {
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1)
    } else {
      await handleInstallation()
    }
  }

  async function handleInstallation(): Promise<void> {
    if (!setupSecret.trim()) {
      setError("Enter the one-time setup secret from Coolify")
      return
    }
    setIsInstalling(true)
    setInstallProgress(0)
    setError("")
    const steps = installationSteps.map((step) => ({ ...step, completed: false }))
    steps[0].completed = true
    setInstallationSteps([...steps])
    setInstallProgress(100 / steps.length)

    try {
      if (!schoolInstalled) {
        await SetupWizardAPI.installSchool(
          {
            name: formData.school.name,
            address: formData.school.address,
            email: formData.admin.email,
            phone: formData.school.phone,
            logo: formData.school.logo,
            primary_color: formData.school.brandColor,
          },
          setupSecret
        )
        setSchoolInstalled(true)
      }

      steps[1].completed = true
      setInstallationSteps([...steps])
      setInstallProgress((2 / steps.length) * 100)

      await SetupWizardAPI.createSuperAdmin(
        {
          school_name: formData.school.name,
          first_name: formData.admin.firstName,
          last_name: formData.admin.lastName,
          email: formData.admin.email,
          password: formData.admin.password,
          confirm_password: formData.admin.confirmPassword,
        },
        setupSecret
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred."
      console.error("❌ Setup Wizard Failed:", message)
      toast.error(`Setup Failed ❗ ${message}`) // UI feedback here
      setError(message)
      return
    }

    steps[2].completed = true
    setInstallationSteps([...steps])
    setInstallProgress(100)

    setIsComplete(true)
    clearStorage()
    setSetupSecret("")
  }

  function handleBack(): void {
    if (!schoolInstalled && currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  function selectSetupStep(step: number): void {
    if (schoolInstalled && step < 2) return
    setCurrentStep(step)
  }

  if (!isLoaded || isLoadingExistingData) {
    return <Loading />
  }

  return (
    <SetupStepProvider value={selectSetupStep}>
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
            <SchoolInfoForm
              formData={formData}
              updateFormData={updateForm}
              onSubmit={handleNext}
              onCancel={handleBack}
            />
          )}
          {currentStep === 2 && !isInstalling && (
            <AdminAccountForm
              formData={formData}
              setupSecret={setupSecret}
              onSetupSecretChange={setSetupSecret}
              updateFormData={updateForm}
              onSubmit={handleInstallation}
              onCancel={handleBack}
              canGoBack={!schoolInstalled}
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
