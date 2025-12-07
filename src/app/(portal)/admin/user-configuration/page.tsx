"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { TbUserQuestion, TbUserUp } from "react-icons/tb"
import { LuUserCheck } from "react-icons/lu"

import { InvitedUsersTable } from "./_components/invited-users-table"
import { PendingUsersTable } from "./_components/pending-users-table"
import { SendInvitation } from "./_components/send-invitation"

enum UserConfigurationTab {
  Invite = "invite User",
  Invited = "invited User",
  Pending = "pending Invites",
}

const tabIcons = {
  [UserConfigurationTab.Invite]: TbUserUp,
  [UserConfigurationTab.Invited]: LuUserCheck,
  [UserConfigurationTab.Pending]: TbUserQuestion,
}

const Page = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")

  const getActiveTab = () => {
    if (tabParam === "pending") return UserConfigurationTab.Pending
    if (tabParam === "invite") return UserConfigurationTab.Invite
    return UserConfigurationTab.Invited
  }

  const activeTab = getActiveTab()

  const handleTabChange = (tab: UserConfigurationTab) => {
    let query = ""
    switch (tab) {
      case UserConfigurationTab.Pending:
        query = "pending"
        break
      case UserConfigurationTab.Invite:
        query = "invite"
        break
      case UserConfigurationTab.Invited:
        query = "invited"
        break
    }
    router.push(`/admin/user-configuration?tab=${query}`)
  }

  const renderContent = () => {
    switch (activeTab) {
      case UserConfigurationTab.Invite:
        return <SendInvitation />
      case UserConfigurationTab.Invited:
        return <InvitedUsersTable />
      case UserConfigurationTab.Pending:
        return <PendingUsersTable />
      default:
        return null
    }
  }

  return (
    <div className="relative flex h-full flex-col gap-10 px-2 pt-7 lg:px-10">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[#2d2d2d]"> User Configuration</h1>
        <p className="text-sm text-[#666666]">
          Manage user roles, permissions, and access levels to control how users interact
          with the portal.
        </p>
      </section>
      <section className="flex w-fit overflow-hidden rounded-lg border border-[#2D2D2D4D]">
        {Object.values(UserConfigurationTab).map((tab) => {
          const Icon = tabIcons[tab]
          return (
            <div
              key={tab}
              className={`box-border flex cursor-pointer items-center gap-2 border-r border-[#2D2D2D4D] px-4 py-2.5 text-sm font-medium transition-colors last:border-r-0 ${activeTab === tab ? "bg-[#DA3743] text-white" : "bg-white text-[#535353]"}`}
              onClick={() => handleTabChange(tab)}
            >
              <Icon className="h-4 w-4" />
              <span className="capitalize">{tab}</span>
            </div>
          )
        })}
      </section>
      {renderContent()}
    </div>
  )
}

export default Page
