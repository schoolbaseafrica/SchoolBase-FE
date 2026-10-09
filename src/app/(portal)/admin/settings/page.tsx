import { SettingsSidebar } from "./_components/settings-sidebar"
import { NotificationSettings } from "./_components/notification-settings"
import { LegalSettings } from "./_components/legal-settings"
import { SchoolInfoSettings } from "./_components/school-info-settings"
import { LandingPageSettings } from "./_components/landing-page-settings"
import { AttendanceMethodSettings } from "./_components/attendance-method-settings"

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const activeTab = tab || "school-info"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="portal-reveal mb-8 max-w-3xl">
        <p className="text-accent mb-2 text-xs font-semibold tracking-[0.18em] uppercase">
          Administration
        </p>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          School settings
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Manage school details, your public website, attendance and account preferences.
        </p>
      </div>
      <div className="portal-reveal flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="h-fit shrink-0 lg:sticky lg:top-6 lg:w-64">
          <SettingsSidebar activeTab={activeTab} />
        </aside>

        <main className="min-w-0 flex-1">
          {activeTab === "school-info" && <SchoolInfoSettings />}
          {activeTab === "landing-page" && <LandingPageSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "attendance" && <AttendanceMethodSettings />}
          {activeTab === "legal" && <LegalSettings />}
        </main>
      </div>
    </div>
  )
}
