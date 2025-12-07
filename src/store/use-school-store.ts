"use client"

import { create } from "zustand"
import { defaultSchoolProfile, type SchoolProfile } from "@/data/school-profile"

type SchoolState = {
  school: SchoolProfile
  setSchool: (school: SchoolProfile) => void
  updateSchool: (updates: Partial<SchoolProfile>) => void
}

export const useSchoolStore = create<SchoolState>((set) => ({
  school: defaultSchoolProfile,
  setSchool: (school) => set({ school }),
  updateSchool: (updates) =>
    set((state) => ({
      school: { ...state.school, ...updates },
    })),
}))
