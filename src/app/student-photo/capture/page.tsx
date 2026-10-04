"use client"

import { useEffect, useState } from "react"
import { StudentPhotoCamera } from "@/components/profile/student-photo-camera"

export default function StudentPhotoCapturePage() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = window.location.hash.slice(1)
      setToken(/^[A-Za-z0-9_-]{43}$/.test(value) ? value : "")
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <h1 className="text-2xl font-semibold">Take your SchoolBase photo</h1>
      <p className="text-muted-foreground">
        This link expires after ten minutes and can save one photo. Open it only if you
        requested it from your student profile.
      </p>
      {token === null ? null : token ? (
        <StudentPhotoCamera token={token} />
      ) : (
        <p role="alert">
          This photo link is missing or invalid. Generate a new one in your student
          profile.
        </p>
      )}
    </main>
  )
}
