"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import { MonitorUp, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CbtScreenClipInput } from "@/lib/cbt"

export interface CbtScreenRecorderHandle {
  finish: () => Promise<void>
}

interface Props {
  enabled: boolean
  uploadClip: (clip: CbtScreenClipInput) => Promise<unknown>
}

const CLIP_MS = 30_000

export const CbtScreenRecording = forwardRef<CbtScreenRecorderHandle, Props>(
  function CbtScreenRecording({ enabled, uploadClip }, ref) {
    const [ready, setReady] = useState(false)
    const [message, setMessage] = useState("")
    const [busy, setBusy] = useState(false)
    const streamRef = useRef<MediaStream | null>(null)
    const recorderRef = useRef<MediaRecorder | null>(null)
    const timerRef = useRef<number | null>(null)
    const pendingRef = useRef<CbtScreenClipInput[]>([])
    const uploadTaskRef = useRef<Promise<void> | null>(null)
    const recordingIdRef = useRef("")
    const partRef = useRef(0)
    const finishedRef = useRef(false)
    const errorRef = useRef(false)
    const mimeRef = useRef("")

    const stopTimer = useCallback(() => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      timerRef.current = null
    }, [])

    const stopStream = useCallback(() => {
      stopTimer()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }, [stopTimer])

    const drain = useCallback((): Promise<void> => {
      if (uploadTaskRef.current) return uploadTaskRef.current
      const task = (async () => {
        while (pendingRef.current.length) {
          await uploadClip(pendingRef.current[0])
          pendingRef.current.shift()
        }
      })()
      uploadTaskRef.current = task
      void task
        .finally(() => {
          if (uploadTaskRef.current === task) uploadTaskRef.current = null
        })
        .catch(() => undefined)
      return task
    }, [uploadClip])

    const startSegment = useCallback(() => {
      const stream = streamRef.current
      if (!stream || finishedRef.current || errorRef.current) return
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeRef.current,
        videoBitsPerSecond: 900_000,
      })
      recorderRef.current = recorder
      const chunks: Blob[] = []
      const startedAt = Date.now()
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data)
      }
      recorder.onstop = () => {
        stopTimer()
        const durationMs = Math.min(60_000, Date.now() - startedAt)
        if (chunks.length && durationMs >= 100) {
          pendingRef.current.push({
            recordingId: recordingIdRef.current,
            partNumber: partRef.current++,
            durationMs,
            file: new Blob(chunks, { type: mimeRef.current }),
          })
          void drain().catch(() => {
            errorRef.current = true
            setReady(false)
            setMessage(
              "A screen clip could not be uploaded. Reconnect and retry recording."
            )
            stopStream()
          })
        }
        if (!finishedRef.current && !errorRef.current && streamRef.current) {
          startSegment()
        }
      }
      recorder.start()
      timerRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop()
      }, CLIP_MS)
    }, [drain, stopStream, stopTimer])

    const start = async () => {
      if (!enabled || busy) return
      setBusy(true)
      setMessage("")
      try {
        if (
          !navigator.mediaDevices?.getDisplayMedia ||
          typeof MediaRecorder === "undefined"
        ) {
          throw new Error("Screen recording is not supported by this browser.")
        }
        await drain()
        const mime = ["video/webm;codecs=vp8", "video/webm", "video/mp4"].find((type) =>
          MediaRecorder.isTypeSupported(type)
        )
        if (!mime) throw new Error("This browser cannot record WebM or MP4 video.")
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "monitor", frameRate: 10 },
          audio: false,
        })
        const track = stream.getVideoTracks()[0]
        if (track.getSettings().displaySurface !== "monitor") {
          stream.getTracks().forEach((item) => item.stop())
          throw new Error("Choose your entire screen to continue the examination.")
        }
        streamRef.current = stream
        recordingIdRef.current = crypto.randomUUID()
        partRef.current = 0
        mimeRef.current = mime
        errorRef.current = false
        finishedRef.current = false
        track.onended = () => {
          if (finishedRef.current) return
          errorRef.current = true
          setReady(false)
          setMessage("Screen sharing stopped. Restart recording to continue.")
          if (recorderRef.current?.state === "recording") recorderRef.current.stop()
          stopStream()
        }
        startSegment()
        setReady(true)
      } catch (error) {
        setReady(false)
        setMessage(
          error instanceof Error ? error.message : "Screen recording could not start"
        )
      } finally {
        setBusy(false)
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        finish: async () => {
          if (!enabled) return
          if (!streamRef.current || errorRef.current || !recordingIdRef.current) {
            throw new Error("Start screen recording before submitting this examination")
          }
          finishedRef.current = true
          const recorder = recorderRef.current
          if (recorder?.state === "recording") {
            await new Promise<void>((resolve) => {
              recorder.addEventListener("stop", () => resolve(), { once: true })
              recorder.stop()
            })
          }
          stopStream()
          await drain()
          if (partRef.current === 0)
            throw new Error("No screen footage was captured for this examination")
          if (pendingRef.current.length)
            throw new Error("Screen clips are still waiting to upload")
        },
      }),
      [drain, enabled, stopStream]
    )

    useEffect(
      () => () => {
        finishedRef.current = true
        stopTimer()
        if (recorderRef.current?.state === "recording") recorderRef.current.stop()
        stopStream()
      },
      [stopStream, stopTimer]
    )

    if (!enabled) return null
    return (
      <>
        {ready && (
          <div
            className="fixed bottom-3 left-3 z-40 rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm"
            role="status"
          >
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-600" />
            Screen recording
          </div>
        )}
        {!ready && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <MonitorUp className="mb-4 h-8 w-8 text-[var(--primary)]" />
              <h2 className="text-xl font-semibold">Share your entire screen</h2>
              <p className="mt-2 text-sm text-slate-600">
                This examination records your screen for authorized school review. Keep
                sharing until you submit. Browser activity is also logged.
              </p>
              {message && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {message}
                </p>
              )}
              <Button className="mt-5" onClick={() => void start()} disabled={busy}>
                {message ? (
                  <RefreshCw className="mr-2 h-4 w-4" />
                ) : (
                  <MonitorUp className="mr-2 h-4 w-4" />
                )}
                {busy
                  ? "Starting…"
                  : message
                    ? "Retry screen recording"
                    : "Start screen recording"}
              </Button>
            </div>
          </div>
        )}
      </>
    )
  }
)
