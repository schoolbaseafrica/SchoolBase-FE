"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, CameraOff, RefreshCw, Video } from "lucide-react"
import { RemoteParticipant, RemoteTrack, Room, RoomEvent, Track } from "livekit-client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CbtMediaToken } from "@/lib/cbt"

interface CandidateCameraProps {
  enabled: boolean
  getToken: () => Promise<CbtMediaToken>
}

export function CandidateCameraMonitoring({ enabled, getToken }: CandidateCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const roomRef = useRef<Room | null>(null)
  const [state, setState] = useState<"idle" | "connecting" | "connected" | "error">(
    "idle"
  )
  const [message, setMessage] = useState("")

  const connect = useCallback(async () => {
    if (!enabled || roomRef.current) return
    setState("connecting")
    setMessage("")
    const room = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = room
    try {
      const credentials = await getToken()
      await room.connect(credentials.url, credentials.token)
      await room.localParticipant.setCameraEnabled(true)
      const publication = room.localParticipant.getTrackPublication(Track.Source.Camera)
      publication?.videoTrack?.attach(videoRef.current!)
      setState("connected")
    } catch (error) {
      await room.disconnect()
      roomRef.current = null
      setState("error")
      setMessage(
        error instanceof Error ? error.message : "Camera monitoring could not start"
      )
    }
  }, [enabled, getToken])

  useEffect(() => {
    const timer = enabled ? window.setTimeout(() => void connect(), 0) : undefined
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      const room = roomRef.current
      roomRef.current = null
      if (room) void room.disconnect()
    }
  }, [connect, enabled])

  if (!enabled) return null
  return (
    <Card className="fixed right-4 bottom-4 z-40 w-56 overflow-hidden shadow-xl">
      <div className="relative aspect-video bg-slate-950">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        {state !== "connected" && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <CameraOff className="h-7 w-7" />
          </div>
        )}
      </div>
      <CardContent className="space-y-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium">Live camera monitoring</span>
          <Badge variant={state === "connected" ? "secondary" : "outline"}>
            {state === "connected" ? "On" : state === "connecting" ? "Starting" : "Off"}
          </Badge>
        </div>
        {message && <p className="text-xs text-red-600">{message}</p>}
        {state === "error" && (
          <Button size="sm" variant="outline" className="w-full" onClick={connect}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Retry camera
          </Button>
        )}
        <p className="text-[11px] text-slate-500">
          Your camera is visible only to authorized proctors. It is not recorded.
        </p>
      </CardContent>
    </Card>
  )
}

interface RemoteCamera {
  id: string
  name: string
  track: RemoteTrack
}

function RemoteCameraTile({ camera }: { camera: RemoteCamera }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (ref.current) camera.track.attach(ref.current)
    return () => {
      camera.track.detach()
    }
  }, [camera.track])
  return (
    <Card className="overflow-hidden">
      <video
        ref={ref}
        playsInline
        autoPlay
        className="aspect-video w-full bg-slate-950 object-cover"
      />
      <CardContent className="p-3 text-sm font-medium">{camera.name}</CardContent>
    </Card>
  )
}

export function ProctorCameraMonitoring({
  getToken,
}: {
  getToken: () => Promise<CbtMediaToken>
}) {
  const roomRef = useRef<Room | null>(null)
  const [cameras, setCameras] = useState<RemoteCamera[]>([])
  const [error, setError] = useState("")
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(async () => {
    if (roomRef.current) return
    setConnecting(true)
    setError("")
    const room = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = room
    const addTrack = (
      track: RemoteTrack,
      _publication: unknown,
      participant: RemoteParticipant
    ) => {
      if (track.kind !== Track.Kind.Video) return
      const trackId = track.sid || `${participant.identity}-${track.source}`
      setCameras((current) => [
        ...current.filter((item) => item.id !== trackId),
        { id: trackId, name: participant.name || "Candidate", track },
      ])
    }
    const removeTrack = (track: RemoteTrack) =>
      setCameras((current) => current.filter((item) => item.id !== track.sid))
    room.on(RoomEvent.TrackSubscribed, addTrack)
    room.on(RoomEvent.TrackUnsubscribed, removeTrack)
    try {
      const credentials = await getToken()
      await room.connect(credentials.url, credentials.token)
    } catch (caught) {
      await room.disconnect()
      roomRef.current = null
      setError(
        caught instanceof Error ? caught.message : "Camera monitor could not connect"
      )
    } finally {
      setConnecting(false)
    }
  }, [getToken])

  useEffect(
    () => () => {
      const room = roomRef.current
      roomRef.current = null
      if (room) void room.disconnect()
    },
    []
  )

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Live candidate cameras</h2>
          <p className="text-sm text-slate-500">
            Live video only. Camera feeds are not recorded.
          </p>
        </div>
        <Button onClick={connect} disabled={connecting || Boolean(roomRef.current)}>
          <Camera className="mr-2 h-4 w-4" />
          {connecting
            ? "Connecting…"
            : roomRef.current
              ? "Connected"
              : "Start monitoring"}
        </Button>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Camera monitor unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {roomRef.current && !cameras.length && (
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">
            <Video className="h-5 w-5" /> Waiting for candidate cameras
          </CardContent>
        </Card>
      )}
      {cameras.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cameras.map((camera) => (
            <RemoteCameraTile key={camera.id} camera={camera} />
          ))}
        </div>
      )}
    </section>
  )
}
