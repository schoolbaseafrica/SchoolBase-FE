import { ImageResponse } from "next/og"
import { defaultSchoolProfile } from "@/data/school-profile"

export const size = {
  width: 64,
  height: 64,
}

export const contentType = "image/png"

export default function Icon() {
  // For static generation, we need to use a simple colored icon
  // ImageResponse doesn't support relative paths during build
  const schoolName = defaultSchoolProfile.shortName || "School"

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
            color: "#000000",
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
