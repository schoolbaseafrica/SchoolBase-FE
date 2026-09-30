"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ConnectionState,
  ConnectionQuality,
  LocalTrack,
  LocalParticipant,
  Participant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client"
import {
  Headphones,
  Camera,
  CameraOff,
  Maximize2,
  Minimize2,
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  ScreenShareOff,
  Volume2,
  Settings2,
  Wifi,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { VirtualClassroomAPI } from "@/lib/virtual-classroom"

interface ClassroomAudioProps {
  classroomId: string
  canManage: boolean
  allowStudentMicrophone: boolean
  allowStudentCamera: boolean
  onPermissionChanged?: (allowed: boolean) => void
}

const connectionLabel: Record<ConnectionState, string> = {
  [ConnectionState.Disconnected]: "Not connected",
  [ConnectionState.Connecting]: "Connecting",
  [ConnectionState.Connected]: "Live audio",
  [ConnectionState.Reconnecting]: "Reconnecting",
  [ConnectionState.SignalReconnecting]: "Reconnecting",
}

function displayName(participant: Participant) {
  return participant.name?.trim() || participant.identity || "Participant"
}

interface ScreenShareTrack {
  id: string
  participantName: string
  track: LocalTrack | RemoteTrack
  local: boolean
}

interface CameraTrack {
  id: string
  participantIdentity: string
  participantName: string
  track: LocalTrack | RemoteTrack
  local: boolean
  speaking: boolean
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  )
}

function CameraPlaceholder({
  participant,
  local,
  onModerate,
}: {
  participant: Participant
  local: boolean
  onModerate?: (source: "microphone" | "camera", enabled: boolean) => void
}) {
  const name = displayName(participant)
  return (
    <div className="relative flex aspect-video min-w-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-100">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
          {initials(name)}
        </div>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <CameraOff className="h-3.5 w-3.5" /> Camera off
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-white/85 px-2 py-1.5 text-xs text-slate-700 backdrop-blur-sm">
        <span className="truncate">
          {name}
          {local ? " (you)" : ""}
        </span>
        {participant.isMicrophoneEnabled ? (
          <Mic className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <MicOff className="h-3.5 w-3.5 shrink-0" />
        )}
      </div>
      {onModerate && (
        <div className="absolute top-1 right-1 flex gap-1">
          <button
            type="button"
            className="rounded bg-white/90 p-1"
            onClick={() => onModerate("microphone", !participant.isMicrophoneEnabled)}
            aria-label={
              participant.isMicrophoneEnabled
                ? "Mute student"
                : "Allow student microphone"
            }
          >
            {participant.isMicrophoneEnabled ? (
              <MicOff className="h-3.5 w-3.5" />
            ) : (
              <Mic className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            className="rounded bg-white/90 p-1"
            onClick={() => onModerate("camera", true)}
            aria-label="Allow student camera"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function CameraTile({
  camera,
  onModerate,
}: {
  camera: CameraTrack
  onModerate?: (source: "microphone" | "camera", enabled: boolean) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = videoRef.current
    if (video) camera.track.attach(video)
    return () => {
      if (video) camera.track.detach(video)
    }
  }, [camera.track])
  return (
    <div
      className={`relative aspect-video min-w-0 overflow-hidden rounded-xl border-2 bg-slate-950 ${camera.speaking ? "border-emerald-400" : "border-transparent"}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted={camera.local}
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-2 pt-6 pb-2 text-xs text-white">
        <span className="truncate">
          {camera.participantName}
          {camera.local ? " (you)" : ""}
        </span>
        {camera.speaking && (
          <span className="ml-2 shrink-0 text-emerald-300">Speaking</span>
        )}
      </div>
      {onModerate && (
        <div className="absolute top-1 right-1 flex gap-1">
          <button
            type="button"
            className="rounded bg-black/60 p-1 text-white"
            onClick={() => onModerate("microphone", false)}
            aria-label="Mute student"
          >
            <MicOff className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="rounded bg-black/60 p-1 text-white"
            onClick={() => onModerate("camera", false)}
            aria-label="Stop student camera"
          >
            <CameraOff className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function ScreenShareStage({ share }: { share: ScreenShareTrack }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    const video = videoRef.current
    if (video && !collapsed) share.track.attach(video)
    return () => {
      if (video) share.track.detach(video)
    }
  }, [collapsed, share.track])
  return (
    <div
      ref={stageRef}
      className={`fullscreen:flex fullscreen:h-screen fullscreen:w-screen fullscreen:max-w-none fullscreen:flex-col mx-auto overflow-hidden rounded-xl border bg-slate-950 shadow-sm ${expanded ? "w-full" : "w-full max-w-3xl"}`}
    >
      <div className="flex items-center justify-between bg-slate-900 px-3 py-2 text-xs text-white">
        <span className="min-w-0 truncate">
          {share.local ? "You are presenting" : `${share.participantName} is presenting`}
        </span>
        <div className="ml-3 flex shrink-0 items-center gap-1">
          <span className="mr-1 flex items-center gap-1 text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Live
          </span>
          {!collapsed && (
            <button
              type="button"
              className="rounded p-1 hover:bg-white/15"
              aria-label={
                expanded ? "Use compact presentation view" : "Expand presentation"
              }
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          )}
          <button
            type="button"
            className="rounded p-1 hover:bg-white/15"
            aria-label={collapsed ? "Show presentation" : "Hide presentation"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </button>
          {!collapsed && (
            <button
              type="button"
              className="rounded px-2 py-1 hover:bg-white/15"
              onClick={() => {
                const request = stageRef.current?.requestFullscreen()
                request?.catch(() => toast.error("Full-screen view is unavailable."))
              }}
            >
              Full screen
            </button>
          )}
        </div>
      </div>
      {!collapsed && (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted={share.local}
            playsInline
            className={`${expanded ? "max-h-[65vh]" : "h-44 sm:h-64 lg:h-80"} fullscreen:h-full fullscreen:max-h-none fullscreen:flex-1 w-full bg-black object-contain`}
          />
          {share.local && (
            <p className="bg-slate-900 px-3 py-2 text-[11px] text-slate-300">
              Sharing this classroom window creates a mirror effect. Share a specific tab
              or window to avoid it.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export function ClassroomAudio({
  classroomId,
  canManage,
  allowStudentMicrophone,
  allowStudentCamera,
  onPermissionChanged,
}: ClassroomAudioProps) {
  const roomRef = useRef<Room | null>(null)
  const audioRootRef = useRef<HTMLDivElement>(null)
  const [connection, setConnection] = useState(ConnectionState.Disconnected)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isJoining, setIsJoining] = useState(false)
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(false)
  const [cameraTracks, setCameraTracks] = useState<CameraTrack[]>([])
  const [screenShares, setScreenShares] = useState<ScreenShareTrack[]>([])
  const [isChangingScreenShare, setIsChangingScreenShare] = useState(false)
  const [isSavingPermission, setIsSavingPermission] = useState(false)
  const [showPreflight, setShowPreflight] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedMicrophone, setSelectedMicrophone] = useState("")
  const [selectedCamera, setSelectedCamera] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState("")
  const [deviceError, setDeviceError] = useState("")
  const [isCheckingDevices, setIsCheckingDevices] = useState(false)
  const [networkQuality, setNetworkQuality] = useState<ConnectionQuality | null>(null)
  const desiredMedia = useRef({ microphone: false, camera: false })
  const reportHealth = useCallback(
    (
      category: "media" | "network" | "device",
      eventType: string,
      severity: "info" | "warning" | "error",
      details?: Record<string, string | number | boolean | null>
    ) => {
      void VirtualClassroomAPI.reportHealth(classroomId, {
        category,
        eventType,
        severity,
        details,
      }).catch(() => undefined)
    },
    [classroomId]
  )

  const checkDevices = async () => {
    setIsCheckingDevices(true)
    setDeviceError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      })
      stream.getTracks().forEach((track) => track.stop())
      const available = await navigator.mediaDevices.enumerateDevices()
      setDevices(available)
      setSelectedMicrophone(
        (current) =>
          current || available.find((item) => item.kind === "audioinput")?.deviceId || ""
      )
      setSelectedCamera(
        (current) =>
          current || available.find((item) => item.kind === "videoinput")?.deviceId || ""
      )
      setSelectedSpeaker(
        (current) =>
          current || available.find((item) => item.kind === "audiooutput")?.deviceId || ""
      )
    } catch (error) {
      setDeviceError(
        error instanceof Error ? error.message : "Camera and microphone access failed"
      )
      setDevices(await navigator.mediaDevices.enumerateDevices().catch(() => []))
      reportHealth("device", "preflight_failed", "error", {
        message: error instanceof Error ? error.message : "Device access failed",
      })
    } finally {
      setIsCheckingDevices(false)
    }
  }

  const openPreflight = () => {
    setShowPreflight(true)
    void checkDevices()
  }

  const refreshParticipants = useCallback((room: Room) => {
    setParticipants([room.localParticipant, ...room.remoteParticipants.values()])
    setIsMicrophoneEnabled(room.localParticipant.isMicrophoneEnabled)
    setIsScreenSharing(room.localParticipant.isScreenShareEnabled)
    setIsCameraEnabled(room.localParticipant.isCameraEnabled)
    const cameras: CameraTrack[] = []
    const localCamera = room.localParticipant.getTrackPublication(Track.Source.Camera)
    if (localCamera?.track) {
      cameras.push({
        id: localCamera.trackSid,
        participantIdentity: room.localParticipant.identity,
        participantName: displayName(room.localParticipant),
        track: localCamera.track,
        local: true,
        speaking: room.localParticipant.isSpeaking,
      })
    }
    const shares: ScreenShareTrack[] = []
    const localPublication = room.localParticipant.getTrackPublication(
      Track.Source.ScreenShare
    )
    if (localPublication?.track) {
      shares.push({
        id: localPublication.trackSid,
        participantName: displayName(room.localParticipant),
        track: localPublication.track,
        local: true,
      })
    }
    room.remoteParticipants.forEach((participant) => {
      const camera = participant.getTrackPublication(Track.Source.Camera)
      if (camera?.track) {
        cameras.push({
          id: camera.trackSid,
          participantIdentity: participant.identity,
          participantName: displayName(participant),
          track: camera.track,
          local: false,
          speaking: participant.isSpeaking,
        })
      }
      const publication = participant.getTrackPublication(Track.Source.ScreenShare)
      if (publication?.track) {
        shares.push({
          id: publication.trackSid,
          participantName: displayName(participant),
          track: publication.track,
          local: false,
        })
      }
    })
    setScreenShares(shares)
    setCameraTracks(cameras)
  }, [])

  const leave = useCallback(() => {
    const room = roomRef.current
    if (room) {
      room.disconnect()
      roomRef.current = null
    }
    audioRootRef.current?.replaceChildren()
    setConnection(ConnectionState.Disconnected)
    setParticipants([])
    setIsMicrophoneEnabled(false)
    setIsScreenSharing(false)
    setIsCameraEnabled(false)
    setCameraTracks([])
    setScreenShares([])
    setNetworkQuality(null)
  }, [])

  useEffect(() => leave, [leave])

  const join = async () => {
    setIsJoining(true)
    try {
      const credentials = await VirtualClassroomAPI.getMediaToken(classroomId)
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: selectedMicrophone ? { deviceId: selectedMicrophone } : {},
        videoCaptureDefaults: selectedCamera ? { deviceId: selectedCamera } : {},
      })
      roomRef.current = room

      const refresh = () => refreshParticipants(room)
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        setConnection(state)
        refresh()
      })
      room.on(RoomEvent.ParticipantConnected, refresh)
      room.on(RoomEvent.ParticipantDisconnected, refresh)
      room.on(RoomEvent.ActiveSpeakersChanged, refresh)
      room.on(RoomEvent.TrackMuted, refresh)
      room.on(RoomEvent.TrackUnmuted, refresh)
      room.on(RoomEvent.LocalTrackPublished, refresh)
      room.on(RoomEvent.LocalTrackUnpublished, refresh)
      room.on(RoomEvent.TrackPublished, refresh)
      room.on(RoomEvent.TrackUnpublished, refresh)
      room.on(RoomEvent.ParticipantPermissionsChanged, refresh)
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const element = track.attach()
          element.autoplay = true
          audioRootRef.current?.appendChild(element)
        }
        if (publication.source === Track.Source.Camera) {
          setCameraTracks((current) => [
            ...current.filter((camera) => camera.id !== publication.trackSid),
            {
              id: publication.trackSid,
              participantIdentity: participant.identity,
              participantName: displayName(participant),
              track,
              local: false,
              speaking: participant.isSpeaking,
            },
          ])
        } else {
          refresh()
        }
      })
      room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
        track.detach().forEach((element) => element.remove())
        if (publication.source === Track.Source.Camera) {
          setCameraTracks((current) =>
            current.filter((camera) => camera.id !== publication.trackSid)
          )
        } else {
          refresh()
        }
      })
      room.on(RoomEvent.MediaDevicesError, () => {
        toast.error("Camera or microphone access failed. Check your browser permission.")
        reportHealth("device", "media_device_error", "error")
      })
      room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
        if (participant instanceof LocalParticipant) {
          setNetworkQuality(quality)
          reportHealth(
            "network",
            "quality_changed",
            quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost
              ? "warning"
              : "info",
            { quality }
          )
        }
      })
      room.on(RoomEvent.Reconnecting, () => {
        desiredMedia.current = {
          microphone: room.localParticipant.isMicrophoneEnabled,
          camera: room.localParticipant.isCameraEnabled,
        }
        reportHealth("media", "reconnecting", "warning")
      })
      room.on(RoomEvent.Reconnected, () => {
        const desired = desiredMedia.current
        void room.localParticipant
          .setMicrophoneEnabled(desired.microphone)
          .catch(() => undefined)
        void room.localParticipant.setCameraEnabled(desired.camera).catch(() => undefined)
        toast.success("Live media reconnected")
        reportHealth("media", "reconnected", "info")
      })

      await room.connect(credentials.url, credentials.token, { autoSubscribe: true })
      if (selectedSpeaker) await room.switchActiveDevice("audiooutput", selectedSpeaker)
      refresh()
      setShowPreflight(false)
      reportHealth("media", "connected", "info")
    } catch (error) {
      leave()
      reportHealth("media", "connection_failed", "error", {
        message: error instanceof Error ? error.message : "Unable to join",
      })
      toast.error(error instanceof Error ? error.message : "Unable to join live audio")
    } finally {
      setIsJoining(false)
    }
  }

  const toggleCamera = async () => {
    const participant = roomRef.current?.localParticipant
    if (!participant) return
    if (!canManage && !allowStudentCamera) {
      toast.info("The teacher has disabled student cameras.")
      return
    }
    try {
      await participant.setCameraEnabled(!participant.isCameraEnabled)
      desiredMedia.current.camera = participant.isCameraEnabled
      if (roomRef.current) refreshParticipants(roomRef.current)
    } catch {
      toast.error("Camera access failed. Check your browser permission.")
    }
  }

  const toggleMicrophone = async () => {
    const participant = roomRef.current?.localParticipant
    if (!participant) return
    if (!canManage && !allowStudentMicrophone) {
      toast.info("The teacher has disabled student microphones.")
      return
    }
    try {
      await participant.setMicrophoneEnabled(!participant.isMicrophoneEnabled)
      desiredMedia.current.microphone = participant.isMicrophoneEnabled
      setIsMicrophoneEnabled(participant.isMicrophoneEnabled)
    } catch {
      toast.error("Microphone access failed. Check your browser permission.")
    }
  }

  const updateStudentMicrophones = async (allowed: boolean) => {
    setIsSavingPermission(true)
    try {
      await VirtualClassroomAPI.updatePermissions(classroomId, {
        allowStudentMicrophone: allowed,
      })
      onPermissionChanged?.(allowed)
      toast.success(allowed ? "Student microphones enabled" : "Student microphones muted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update microphones")
    } finally {
      setIsSavingPermission(false)
    }
  }

  const updateStudentCameras = async (allowed: boolean) => {
    setIsSavingPermission(true)
    try {
      await VirtualClassroomAPI.updatePermissions(classroomId, {
        allowStudentCamera: allowed,
      })
      onPermissionChanged?.(allowed)
      toast.success(allowed ? "Student cameras enabled" : "Student cameras disabled")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update cameras")
    } finally {
      setIsSavingPermission(false)
    }
  }

  const moderateParticipant = async (
    participantIdentity: string,
    source: "microphone" | "camera",
    enabled: boolean
  ) => {
    try {
      await VirtualClassroomAPI.moderateParticipantMedia(
        classroomId,
        participantIdentity,
        source,
        enabled
      )
      toast.success(`${source === "camera" ? "Camera" : "Microphone"} permission updated`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update participant")
    }
  }

  const toggleScreenShare = async () => {
    const participant = roomRef.current?.localParticipant
    if (!participant || !canManage) return
    setIsChangingScreenShare(true)
    try {
      await participant.setScreenShareEnabled(!participant.isScreenShareEnabled, {
        audio: true,
      })
      if (roomRef.current) refreshParticipants(roomRef.current)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Screen sharing could not start. Check browser permission."
      )
    } finally {
      setIsChangingScreenShare(false)
    }
  }

  const connected = connection === ConnectionState.Connected
  const qualityLabel =
    networkQuality === ConnectionQuality.Excellent
      ? "Excellent"
      : networkQuality === ConnectionQuality.Good
        ? "Good"
        : networkQuality === ConnectionQuality.Poor
          ? "Weak"
          : networkQuality === ConnectionQuality.Lost
            ? "Lost"
            : null
  const galleryParticipants = [...participants].sort((left, right) => {
    if (canManage) return 0
    return (
      Number(left instanceof LocalParticipant) - Number(right instanceof LocalParticipant)
    )
  })

  return (
    <div className="border-b bg-white px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs text-gray-600">
          <Headphones className="h-4 w-4 text-red-600" />
          <span className="whitespace-nowrap">
            {connected ? "Live media" : connectionLabel[connection]}
          </span>
          {connected && <span>· {participants.length} connected</span>}
          {connected && qualityLabel && (
            <span
              className={
                qualityLabel === "Weak" || qualityLabel === "Lost"
                  ? "text-amber-600"
                  : "text-emerald-600"
              }
            >
              · <Wifi className="inline h-3 w-3" /> {qualityLabel}
            </span>
          )}
        </div>

        {!connected ? (
          <Button
            size="sm"
            variant="outline"
            onClick={openPreflight}
            disabled={isJoining}
          >
            {isJoining ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="mr-2 h-4 w-4" />
            )}
            Join live session
          </Button>
        ) : null}

        {connected && (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={openPreflight}
              className="h-8 w-8"
              aria-label="Media devices"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={leave} className="shrink-0">
              <PhoneOff className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Leave live session</span>
              <span className="sm:hidden">Leave</span>
            </Button>
          </div>
        )}
      </div>

      {showPreflight && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Check your devices</h2>
                <p className="text-muted-foreground text-sm">
                  Choose the devices to use before joining the lesson.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPreflight(false)}>
                Close
              </Button>
            </div>
            {deviceError && (
              <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {deviceError}
              </p>
            )}
            <div className="mt-4 grid gap-3">
              {(
                [
                  ["Microphone", "audioinput", selectedMicrophone, setSelectedMicrophone],
                  ["Camera", "videoinput", selectedCamera, setSelectedCamera],
                  ["Speaker", "audiooutput", selectedSpeaker, setSelectedSpeaker],
                ] as const
              ).map(([label, kind, value, setter]) => (
                <label key={kind} className="grid gap-1 text-sm font-medium">
                  {label}
                  <select
                    className="h-10 rounded-md border bg-white px-3 font-normal"
                    value={value}
                    onChange={(event) => setter(event.target.value)}
                  >
                    {devices
                      .filter((device) => device.kind === kind)
                      .map((device, index) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `${label} ${index + 1}`}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => void checkDevices()}
                disabled={isCheckingDevices}
              >
                {isCheckingDevices && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test again
              </Button>
              {!connected && (
                <Button
                  onClick={() => void join()}
                  disabled={isJoining || isCheckingDevices}
                >
                  {isJoining ? "Joining…" : "Join lesson"}
                </Button>
              )}
              {connected && (
                <Button
                  onClick={async () => {
                    const room = roomRef.current
                    if (!room) return
                    if (selectedMicrophone)
                      await room.switchActiveDevice("audioinput", selectedMicrophone)
                    if (selectedCamera)
                      await room.switchActiveDevice("videoinput", selectedCamera)
                    if (selectedSpeaker)
                      await room.switchActiveDevice("audiooutput", selectedSpeaker)
                    setShowPreflight(false)
                    toast.success("Media devices updated")
                  }}
                >
                  Apply devices
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {connected && (qualityLabel === "Weak" || qualityLabel === "Lost") && (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Your connection is unstable. Turn off your camera if audio begins to break up.
        </p>
      )}

      {connected && (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="min-w-0 px-2 sm:px-3"
            onClick={toggleMicrophone}
            disabled={!canManage && !allowStudentMicrophone}
          >
            {isMicrophoneEnabled ? (
              <Mic className="mr-2 h-4 w-4" />
            ) : (
              <MicOff className="mr-2 h-4 w-4" />
            )}
            {isMicrophoneEnabled ? "Mute" : "Unmute"}
          </Button>
          <Button
            size="sm"
            variant={isCameraEnabled ? "default" : "outline"}
            className="min-w-0 px-2 sm:px-3"
            onClick={() => void toggleCamera()}
            disabled={!canManage && !allowStudentCamera}
          >
            {isCameraEnabled ? (
              <CameraOff className="mr-2 h-4 w-4" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            {isCameraEnabled ? "Stop camera" : "Start camera"}
          </Button>
          {canManage && (
            <Button
              size="sm"
              variant={isScreenSharing ? "default" : "outline"}
              className="col-span-2 min-w-0 px-2 sm:col-span-1 sm:px-3"
              onClick={() => void toggleScreenShare()}
              disabled={isChangingScreenShare}
            >
              {isChangingScreenShare ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isScreenSharing ? (
                <ScreenShareOff className="mr-2 h-4 w-4" />
              ) : (
                <MonitorUp className="mr-2 h-4 w-4" />
              )}
              {isScreenSharing ? "Stop sharing" : "Share screen"}
            </Button>
          )}
        </div>
      )}

      {canManage && (
        <div className="mt-2 grid grid-cols-2 overflow-hidden rounded-lg border bg-gray-50/70 sm:ml-auto sm:flex sm:w-fit sm:rounded-full">
          <div className="flex min-w-0 items-center justify-between gap-2 border-r px-3 py-2 sm:border-r-0 sm:py-1.5">
            <Label htmlFor="student-microphones" className="text-xs text-gray-600">
              Student microphones
            </Label>
            <Switch
              id="student-microphones"
              checked={allowStudentMicrophone}
              disabled={isSavingPermission}
              onCheckedChange={updateStudentMicrophones}
            />
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-2 sm:py-1.5">
            <Label htmlFor="student-cameras" className="text-xs text-gray-600">
              Student cameras
            </Label>
            <Switch
              id="student-cameras"
              checked={allowStudentCamera}
              disabled={isSavingPermission}
              onCheckedChange={updateStudentCameras}
            />
          </div>
        </div>
      )}

      {connected && screenShares.length > 0 && (
        <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-2">
          {screenShares.map((share) => (
            <ScreenShareStage key={share.id} share={share} />
          ))}
        </div>
      )}
      {connected && galleryParticipants.length > 0 && (
        <div className="mt-3 grid max-h-28 auto-cols-[9rem] grid-flow-col gap-2 overflow-x-auto overflow-y-hidden sm:max-h-[38dvh] sm:max-w-3xl sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:overflow-y-auto lg:grid-cols-4">
          {galleryParticipants.map((participant) => {
            const camera = cameraTracks.find(
              (item) => item.participantIdentity === participant.identity
            )
            return camera ? (
              <CameraTile
                key={participant.identity}
                camera={camera}
                onModerate={
                  canManage && !(participant instanceof LocalParticipant)
                    ? (source, enabled) =>
                        void moderateParticipant(participant.identity, source, enabled)
                    : undefined
                }
              />
            ) : (
              <CameraPlaceholder
                key={participant.identity}
                participant={participant}
                local={participant instanceof LocalParticipant}
                onModerate={
                  canManage && !(participant instanceof LocalParticipant)
                    ? (source, enabled) =>
                        void moderateParticipant(participant.identity, source, enabled)
                    : undefined
                }
              />
            )
          })}
        </div>
      )}
      <div ref={audioRootRef} className="hidden" aria-hidden="true" />
    </div>
  )
}
