import { SettingsSidebar } from "./_components/settings-sidebar"
import { ProfileSettings } from "./_components/profile-settings"
import { NotificationSettings } from "./_components/notification-settings"
import { PasswordSettings } from "./_components/password-settings"
import { LegalSettings } from "./_components/legal-settings"
import { DeleteAccountSettings } from "./_components/delete-account"
import { SchoolInfoSettings } from "./_components/school-info-settings"

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const { tab } = await searchParams
  const activeTab = tab || "school-info"

  return (
    <div className="mx-auto p-4 sm:p-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="h-fit shrink-0 lg:sticky lg:top-6 lg:w-64">
          <SettingsSidebar activeTab={activeTab} />
        </aside>

        <main className="min-w-0 flex-1">
          {activeTab === "school-info" && <SchoolInfoSettings />}
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "reset-password" && <PasswordSettings />}
          {activeTab === "legal" && <LegalSettings />}
          {activeTab === "delete-account" && <DeleteAccountSettings />}
        </main>
      </div>
    </div>
  )
}
