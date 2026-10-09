"use client"

import { useQuery } from "@tanstack/react-query"
import { Download, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api/client"

type MobileRelease = {
  version: string
  build: number
  applicationId: string
  filename: string
  sha256: string
  size: number
  publishedAt: string
}

type MobileAppStatus = {
  available: boolean
  release?: MobileRelease
}

export function MobileAppSettings() {
  const app = useQuery({
    queryKey: ["school-mobile-app"],
    queryFn: () => apiFetch<{ data: MobileAppStatus }>("/school-app"),
  })
  const release = app.data?.data?.available ? app.data.data.release : undefined

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-foreground text-2xl font-semibold tracking-tight">
          School mobile app
        </h2>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Download the Android app published for this school. Each school has its own app
          package and connection to its school portal.
        </p>
      </div>

      <div className="rounded-[1.25rem] border border-[var(--portal-line)] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="bg-accent/10 text-accent flex size-12 shrink-0 items-center justify-center rounded-2xl">
            <Smartphone className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground font-semibold">Android app</h3>
            {app.isPending && (
              <p className="text-muted-foreground mt-1 text-sm">
                Checking for a release...
              </p>
            )}
            {app.isError && (
              <div className="text-muted-foreground mt-2 text-sm">
                <p>Could not check the school app.</p>
                <button
                  type="button"
                  onClick={() => void app.refetch()}
                  className="text-primary mt-2 font-semibold hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
            {!app.isPending && !app.isError && !release && (
              <p className="text-muted-foreground mt-1 text-sm">
                No Android release has been published for this school yet.
              </p>
            )}
            {release && (
              <>
                <p className="text-muted-foreground mt-1 text-sm">
                  Version {release.version} · Build {release.build} ·{" "}
                  {(release.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <p className="text-muted-foreground mt-3 text-xs">
                  Published {new Date(release.publishedAt).toLocaleDateString()} · SHA-256
                </p>
                <p className="text-foreground mt-1 font-mono text-xs break-all">
                  {release.sha256}
                </p>
                <Button asChild className="mt-5 gap-2">
                  <a
                    href="/api/proxy-auth/school-app/download"
                    download={release.filename}
                  >
                    <Download className="size-4" />
                    Download Android app
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Android may ask you to allow installation from this browser. Install only the file
        downloaded from this school portal.
      </p>
    </div>
  )
}
