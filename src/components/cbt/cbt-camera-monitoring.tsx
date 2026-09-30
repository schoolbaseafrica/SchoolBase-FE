"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, CameraOff, Maximize2, Minimize2, RefreshCw, Video } from "lucide-react"
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
  const [expanded, setExpanded] = useState(false)

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
    <Card
      className={`fixed right-3 bottom-3 z-40 overflow-hidden shadow-xl transition-[width] sm:right-4 sm:bottom-4 sm:w-56 ${expanded ? "w-56 max-w-[calc(100vw-1.5rem)]" : "w-28"}`}
    >
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex h-10 w-full items-center justify-between gap-2 px-3 text-xs font-medium sm:hidden"
          aria-label="Expand camera preview"
        >
          <span className="flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-emerald-600" /> Camera on
          </span>
          <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
        </button>
      )}
      <div
        className={`relative aspect-video bg-slate-950 sm:block ${expanded ? "block" : "hidden"}`}
      >
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => setExpanded((value) => !value)}
          className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-white/90 sm:hidden"
          aria-label="Minimize camera preview"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </Button>
        {state !== "connected" && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <CameraOff className="h-7 w-7" />
          </div>
        )}
      </div>
      <CardContent className={`space-y-2 p-3 sm:block ${expanded ? "block" : "hidden"}`}>
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
  const [connected, setConnected] = useState(false)

  const connect = useCallback(async () => {
    if (roomRef.current) return
    setConnecting(true)
    setError("")
    const room = new Room({ adaptiveStream: true, dynacast: true })
    roomRef.current = room
    room.on(RoomEvent.Disconnected, () => {
      if (roomRef.current === room) roomRef.current = null
      setConnected(false)
      setCameras([])
    })
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
      setConnected(true)
    } catch (caught) {
      await room.disconnect()
      roomRef.current = null
      setConnected(false)
      setError(
        caught instanceof Error ? caught.message : "Camera monitor could not connect"
      )
    } finally {
      setConnecting(false)
    }
  }, [getToken])

  const disconnect = useCallback(async () => {
    const room = roomRef.current
    roomRef.current = null
    setConnected(false)
    setCameras([])
    setError("")
    if (room) await room.disconnect()
  }, [])

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Live candidate cameras</h2>
          <p className="text-sm text-slate-500">
            Live video only. Camera feeds are not recorded.
          </p>
        </div>
        {connected ? (
          <Button variant="outline" onClick={() => void disconnect()}>
            <CameraOff className="mr-2 h-4 w-4" /> Stop monitoring
          </Button>
        ) : (
          <Button onClick={connect} disabled={connecting}>
            <Camera className="mr-2 h-4 w-4" />
            {connecting ? "Connecting…" : "Start monitoring"}
          </Button>
        )}
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Camera monitor unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {connected && !cameras.length && (
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
