import { ImageResponse } from "next/og"
import { defaultSchoolProfile } from "@/data/school-profile"
import { readSchoolBranding } from "@/lib/server/school-branding-cache"

export const dynamic = "force-dynamic"

export const size = {
  width: 64,
  height: 64,
}

export const contentType = "image/png"

export default async function Icon() {
  const savedSchool = await readSchoolBranding()
  const configuredIcon =
    savedSchool?.faviconUrl ||
    savedSchool?.logoUrl ||
    process.env.SCHOOL_FAVICON_URL ||
    process.env.SCHOOL_LOGO_URL
  if (configuredIcon) {
    try {
      const url = new URL(configuredIcon)
      if (url.protocol === "https:" || url.protocol === "http:") {
        return Response.redirect(url, 307)
      }
    } catch {
      // An invalid URL must not break the favicon route.
    }
  }

  const schoolName =
    savedSchool?.name ||
    process.env.SCHOOL_NAME ||
    defaultSchoolProfile.shortName ||
    "School"
  const schoolColor =
    savedSchool?.primaryColor || process.env.SCHOOL_PRIMARY_COLOR || "#DC2626"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "16px",
          padding: "8px",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: schoolColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "48px",
            height: "48px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
          }}
        >
          {schoolName.charAt(0).toUpperCase()}
        </div>
      </div>
    ),
    size
  )
}
