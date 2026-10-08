"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import Overview from "./_components/dashboard/overview"
import { useAuthUser } from "@/hooks/use-auth-user"
import { AdminsAPI } from "@/lib/admins"

export default function AdminPage() {
  const router = useRouter()
  const viewer = useAuthUser()
  const owner = useQuery({
    queryKey: ["first-school-owner"],
    queryFn: () => AdminsAPI.getFirstOwner(),
  })
  const isOwner = Boolean(
    viewer.data?.id && viewer.data.id === owner.data?.data.owner_user_id
  )

  useEffect(() => {
    if (isOwner) router.replace("/admin/owner")
  }, [isOwner, router])

  if (viewer.isLoading || owner.isLoading || isOwner) return null
  return <Overview />
}
