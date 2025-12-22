import { ImageResponse } from "next/og"
import { defaultSchoolProfile } from "@/data/school-profile"

export const size = {
  width: 64,
  height: 64,
}

export const contentType = "image/png"

export default function Icon() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  // Convert relative paths to absolute URLs
  const toAbsoluteUrl = (path: string) => {
    if (path.startsWith("http")) return path
    return `${baseUrl}${path.startsWith("/") ? path : "/" + path}`
  }

  const logoSrc = toAbsoluteUrl(
    defaultSchoolProfile.logo.favicon ||
      defaultSchoolProfile.logo.full ||
      "/assets/logo.png"
  )

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
        {/* Using plain img here because next/image isn't supported in app icon routes */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={`${defaultSchoolProfile.shortName || "School"} logo`}
          width={48}
          height={48}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size
  )
}
