import { ImageResponse } from "next/og"
import { defaultSchoolProfile } from "@/data/school-profile"

export const size = {
  width: 64,
  height: 64,
}

export const contentType = "image/png"

export default function Icon() {
  const logoSrc =
    defaultSchoolProfile.logo.favicon ||
    defaultSchoolProfile.logo.full ||
    "/assets/logo.png"

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={`${defaultSchoolProfile.shortName} logo`}
          width={48}
          height={48}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size
  )
}
