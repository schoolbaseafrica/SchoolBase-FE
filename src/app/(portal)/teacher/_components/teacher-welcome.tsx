"use client"

import React from "react"
import { useAuthStore } from "@/store/auth-store"

const TeacherWelcome = () => {
  const { user } = useAuthStore()

  return (
    <header className="space-y-1">
      <p className="text-[18px] leading-8 font-medium md:text-2xl">
        Welcome back, {user?.first_name || "Teacher"}
      </p>
      <p className="text-sm font-normal text-[#535353]">
        Here’s what’s happening in your classes today
      </p>
    </header>
  )
}

export default TeacherWelcome
