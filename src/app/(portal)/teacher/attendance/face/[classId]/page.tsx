"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Camera, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import DashboardTitle from "@/components/dashboard/dashboard-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiFetch } from "@/lib/api/client"

type Student = {
  id: string
  name: string
  registrationNumber: string
  photoUrl: string | null
  faceReady: boolean
}

export default function FaceAttendancePage() {
  const classId = useParams().classId as string
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [studentId, setStudentId] = useState("")
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [cameraReady, setCameraReady] = useState(false)
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      apiFetch<{ data: Student[] }>(`/attendance/mobile/classes/${classId}/students`),
      apiFetch<{ data: { enabledMethods: string[] } }>("/attendance/mobile/methods"),
    ])
      .then(([roster, methods]) => {
        if (!active) return
        setStudents(roster.data)
        setEnabled(methods.data.enabledMethods.includes("FACE"))
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Could not load the class")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [classId])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (!cameraReady || !videoRef.current || !streamRef.current) return
    videoRef.current.srcObject = streamRef.current
    void videoRef.current.play()
  }, [cameraReady])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraReady(false)
  }

  const startCamera = async () => {
    setError(null)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support camera access")
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      })
      streamRef.current = stream
      setCameraReady(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open the camera")
    }
  }

  const capture = async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight) return
    const canvas = document.createElement("canvas")
    const scale = Math.min(1, 1280 / video.videoWidth)
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height)
    const image = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    )
    if (!image) {
      setError("Could not capture the photo")
      return
    }
    stopCamera()
    setPhoto(image)
    setPreviewUrl(URL.createObjectURL(image))
  }

  const retake = () => {
    setPhoto(null)
    setPreviewUrl(null)
    void startCamera()
  }

  const submit = async () => {
    if (!studentId || !photo || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const form = new FormData()
      form.append("classId", classId)
      form.append("studentId", studentId)
      form.append("clientEventId", crypto.randomUUID())
      form.append("file", photo, "check-in.jpg")
      await apiFetch("/attendance/mobile/face-check-in", { method: "POST", data: form })
      toast.success("Face verified and attendance recorded")
      setPhoto(null)
      setPreviewUrl(null)
      setStudentId("")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record attendance")
    } finally {
      setSubmitting(false)
    }
  }

  const readyStudents = students.filter((student) => student.faceReady)

  return (
    <div className="space-y-6 px-5 pt-10">
      <DashboardTitle
        heading="Face check-in"
        description="Select a student, take a camera photo, and verify their attendance"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/teacher/attendance")}
      >
        <ArrowLeft className="mr-2 size-4" /> Back to attendance
      </Button>
      <Card>
        <CardContent className="space-y-5 p-6">
          {loading ? (
            <p>Loading class attendance…</p>
          ) : !enabled ? (
            <p>
              Face attendance is not enabled for this school. Ask an admin to configure
              it.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground text-sm">
                Watch the student in person while taking the photo. This web camera flow
                does not automatically check facial movement.
              </p>
              <label className="block space-y-2 text-sm font-medium">
                <span>Student</span>
                <select
                  className="bg-background w-full rounded-md border p-2"
                  value={studentId}
                  onChange={(event) => {
                    setStudentId(event.target.value)
                    setPhoto(null)
                    setPreviewUrl(null)
                    stopCamera()
                  }}
                >
                  <option value="">Select an approved student</option>
                  {readyStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.registrationNumber})
                    </option>
                  ))}
                </select>
              </label>
              {readyStudents.length === 0 && (
                <p>No students have an approved face photo yet.</p>
              )}
              {studentId && (
                <div className="space-y-4">
                  {cameraReady && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="max-h-[450px] w-full rounded-md bg-black object-contain"
                    />
                  )}
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Captured student for review"
                      className="max-h-[450px] w-full rounded-md bg-black object-contain"
                    />
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!cameraReady && !photo && (
                      <Button type="button" onClick={() => void startCamera()}>
                        <Camera className="mr-2 size-4" /> Open camera
                      </Button>
                    )}
                    {cameraReady && (
                      <Button type="button" onClick={() => void capture()}>
                        Take photo
                      </Button>
                    )}
                    {photo && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={retake}
                          disabled={submitting}
                        >
                          Retake
                        </Button>
                        <Button
                          type="button"
                          onClick={() => void submit()}
                          disabled={submitting}
                        >
                          {submitting ? "Verifying…" : "Verify and mark present"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
