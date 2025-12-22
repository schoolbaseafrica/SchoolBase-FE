"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { WelcomeScreen } from "./welcome-screen"
import Image from "next/image"
import { InstallationStep, type LandingSectionKey } from "../_types/setup"
// import { DatabaseConfigForm } from "./database-configuration"
import { SchoolInfoForm } from "./school-info"
import { AdminAccountForm } from "./create-super-admin"
import { LandingSetupForm } from "./landing-setup"
import { useSetupWizardPersistence } from "../_hooks/use-restore-form"
import InstallationProgress from "./installation-progress"
import InstallationComplete from "./installation-complete"
import {
  SetupWizardAPI,
  type SchoolInstallResponse,
} from "@/lib/api/setup/super-admin-setup-apis"
import { toast } from "sonner"
import { defaultSchoolProfile } from "@/data/school-profile"
import { generatePaletteFromPrimary } from "../_utils/generate-palette"
import { LandingPageAPI } from "@/lib/api/landing-page"

export default function SchoolSetupWizard() {
  const [isInstalling, setIsInstalling] = useState<boolean>(false)
  const [installProgress, setInstallProgress] = useState<number>(0)
  const [installationSteps, setInstallationSteps] = useState<InstallationStep[]>([
    { label: "Validating Account Information", completed: false },
    { label: "Installing Core Modules", completed: false },
    { label: "Configuring Your School Profile", completed: false },
    { label: "Applying Landing Page Setup", completed: false },
    { label: "Finalizing Setup", completed: false },
  ])
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [error, setError] = useState("")

  const { formData, updateForm, currentStep, setCurrentStep, isLoaded, clearStorage } =
    useSetupWizardPersistence({
      school: {
        logo: null,
        name: "",
        brandColor: "#DA3743",
        phone: "",
        address: "",
        schoolId: "",
      },
      admin: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      landing: {
        navLinks: defaultSchoolProfile.navLinks,
        hero: defaultSchoolProfile.hero,
        programs: defaultSchoolProfile.programs,
        sections: [],
        sectionsContent: {} as Partial<
          Record<LandingSectionKey, { title?: string; subtitle?: string }>
        >,
        gallery: defaultSchoolProfile.gallery,
        contact: {
          office: defaultSchoolProfile.contact.office,
          email: defaultSchoolProfile.contact.email,
        },
        footer: {
          description: "",
          socials: defaultSchoolProfile.socials,
        },
        cta: defaultSchoolProfile.cta,
        palette: {
          primary: defaultSchoolProfile.brand.primary,
          primaryHover: defaultSchoolProfile.brand.primaryHover,
          tint: defaultSchoolProfile.brand.tint,
          onPrimary: defaultSchoolProfile.brand.onPrimary,
          text: defaultSchoolProfile.brand.text,
          mutedText: defaultSchoolProfile.brand.mutedText,
          surface: defaultSchoolProfile.brand.surface,
        },
        isComplete: false,
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
      const installResponse = (await stepApiCall<SchoolInstallResponse>(
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
        1
      )) as SchoolInstallResponse | undefined

      if (installResponse?.data?.id) {
        updateForm("school", "schoolId", installResponse.data.id)
        if (typeof window !== "undefined") {
          localStorage.setItem("school-id", installResponse.data.id)
        }
      }

      await stepApiCall(
        SetupWizardAPI.createSuperAdmin({
          school_name: formData.school.name,
          first_name: formData.admin.firstName,
          last_name: formData.admin.lastName,
          email: formData.admin.email,
          password: formData.admin.password,
          confirm_password: formData.admin.confirmPassword,
        }),
        2
      )

      const schoolId = installResponse?.data?.id ?? formData.school.schoolId
      if (!schoolId) {
        throw new Error("Missing school ID for landing page setup.")
      }

      await stepApiCall(LandingPageAPI.createLandingPage(schoolId, formData.landing), 3)
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

  // Keep landing palette in sync with selected brand color (avoid loops)
  useEffect(() => {
    const palette = generatePaletteFromPrimary(formData.school.brandColor)
    const current = formData.landing?.palette
    const matchesCurrent =
      current &&
      current.primary === palette.primary &&
      current.primaryHover === palette.primaryHover &&
      current.tint === palette.tint &&
      current.onPrimary === palette.onPrimary &&
      current.text === palette.text &&
      current.mutedText === palette.mutedText &&
      current.surface === palette.surface

    if (!matchesCurrent) {
      updateForm("landing", "palette", palette)
    }
  }, [formData.school.brandColor, formData.landing?.palette, updateForm])

  async function stepApiCall<T = unknown>(
    apiCall: Promise<T>,
    stepIndex: number
  ): Promise<T | undefined> {
    const dbKey = `extra-${stepIndex}`

    try {
      const result = await apiCall
      const steps = [...installationSteps]
      steps[stepIndex].completed = true
      setInstallationSteps([...steps])
      setInstallProgress(((1 + stepIndex) / steps.length) * 100)
      updateForm("extra", dbKey, "done") // incase of 409 error
      return result
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Image src="/assets/logo.svg" alt="SchoolBase Logo" width={64} height={64} />
          <h1 className="text-accent text-2xl font-bold tracking-widest uppercase">
            schoolbase
          </h1>
          <p className="text-sm font-semibold text-gray-600">Loading…</p>
        </div>
      </div>
    )
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
            <SchoolInfoForm
              formData={formData}
              updateFormData={updateForm}
              onSubmit={handleNext}
              onCancel={handleBack}
            />
          )}
          {currentStep === 2 && !isInstalling && (
            <LandingSetupForm
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
