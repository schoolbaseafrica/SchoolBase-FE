"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api/client"

type StudentPhotoCameraProps = {
  token: string
  onCaptured?: (photoUrl: string) => void
}

export function StudentPhotoCamera({ token, onCaptured }: StudentPhotoCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [complete, setComplete] = useState(false)
  const [linkStatus, setLinkStatus] = useState<"checking" | "valid" | "expired">("checking")

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        await apiFetch("/students/photo-capture/status", {
          headers: { "X-Capture-Token": token },
        })
        if (!cancelled) setLinkStatus("valid")
      } catch {
        if (!cancelled) {
          setLinkStatus("expired")
          streamRef.current?.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }
    }
    void check()
    const timer = window.setInterval(() => void check(), 15_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [token])

  useEffect(() => {
    if (linkStatus !== "valid") return
    let cancelled = false
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "This browser cannot open a camera. Use the phone link instead."
          )
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
      } catch {
        if (!cancelled) {
          setCameraError(
            "Camera unavailable or permission denied. Use the phone link instead."
          )
        }
      }
    }
    void start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [linkStatus])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const takePhoto = async () => {
    const video = videoRef.current
    if (!video || video.videoWidth < 480 || video.videoHeight < 480) {
      setCameraError("Move closer or use a camera with at least 480-pixel resolution.")
      return
    }
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext("2d")
    if (!context) return
    context.drawImage(video, 0, 0)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.88)
    )
    if (!blob) {
      setCameraError("Could not capture a photo. Please try again.")
      return
    }
    setCameraError(null)
    setPhoto(blob)
    setPreview(URL.createObjectURL(blob))
  }

  const submit = async () => {
    if (!photo) return
    setUploading(true)
    setCameraError(null)
    try {
      const form = new FormData()
      form.append("file", photo, "student-photo.jpg")
      const response = await apiFetch<{ data: { photoUrl: string } }>(
        "/students/photo-capture",
        { method: "POST", data: form, headers: { "X-Capture-Token": token } }
      )
      setComplete(true)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      onCaptured?.(response.data.photoUrl)
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Could not save the photo")
    } finally {
      setUploading(false)
    }
  }

  if (complete) {
    return (
      <p role="status" className="text-green-700">
        Photo saved. You can close this page.
      </p>
    )
  }

  if (linkStatus === "checking") return <p role="status">Checking photo link…</p>
  if (linkStatus === "expired") {
    return <p role="alert">This photo link has expired or was already used. Generate a new link from your student profile.</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Use a plain background and good light. Remove sunglasses and hats. Face the camera
        alone and keep your full face inside the oval.
      </p>
      <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-lg bg-slate-900">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          aria-label="Live camera preview"
          className={`h-full w-full object-cover ${preview ? "hidden" : "scale-x-[-1]"}`}
        />
        {preview ? (
          // The object URL is created from this user's local camera capture.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Review your captured photo"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-[78%] w-[52%] rounded-[50%] border-4 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
          </div>
        )}
      </div>
      <p className="text-muted-foreground text-sm">
        Review the photo before saving. It should show one clear, front-facing face.
      </p>
      {cameraError && (
        <p role="alert" className="text-destructive text-sm">
          {cameraError}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {preview ? (
          <>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => {
                setPreview(null)
                setPhoto(null)
              }}
            >
              <RotateCcw className="mr-2 size-4" /> Retake
            </Button>
            <Button type="button" disabled={uploading} onClick={() => void submit()}>
              {uploading ? "Saving…" : "Use this photo"}
            </Button>
          </>
        ) : (
          <Button type="button" disabled={!ready} onClick={() => void takePhoto()}>
            <Camera className="mr-2 size-4" /> Take photo
          </Button>
        )}
      </div>
    </div>
  )
}
