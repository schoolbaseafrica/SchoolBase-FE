"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ConnectionState,
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
  Maximize2,
  Minimize2,
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  ScreenShareOff,
  Volume2,
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
      className={`mx-auto overflow-hidden rounded-xl border bg-slate-950 shadow-sm fullscreen:flex fullscreen:h-screen fullscreen:w-screen fullscreen:max-w-none fullscreen:flex-col ${expanded ? "w-full" : "w-full max-w-3xl"}`}
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
              aria-label={expanded ? "Use compact presentation view" : "Expand presentation"}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            className="rounded p-1 hover:bg-white/15"
            aria-label={collapsed ? "Show presentation" : "Hide presentation"}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
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
            className={`${expanded ? "max-h-[65vh]" : "h-44 sm:h-64 lg:h-80"} w-full bg-black object-contain fullscreen:h-full fullscreen:max-h-none fullscreen:flex-1`}
          />
          {share.local && (
            <p className="bg-slate-900 px-3 py-2 text-[11px] text-slate-300">
              Sharing this classroom window creates a mirror effect. Share a specific tab or
              window to avoid it.
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
  onPermissionChanged,
}: ClassroomAudioProps) {
  const roomRef = useRef<Room | null>(null)
  const audioRootRef = useRef<HTMLDivElement>(null)
  const [connection, setConnection] = useState(ConnectionState.Disconnected)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isJoining, setIsJoining] = useState(false)
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [screenShares, setScreenShares] = useState<ScreenShareTrack[]>([])
  const [isChangingScreenShare, setIsChangingScreenShare] = useState(false)
  const [canPublish, setCanPublish] = useState(false)
  const [isSavingPermission, setIsSavingPermission] = useState(false)

  const refreshParticipants = useCallback((room: Room) => {
    setParticipants([room.localParticipant, ...room.remoteParticipants.values()])
    setIsMicrophoneEnabled(room.localParticipant.isMicrophoneEnabled)
    setCanPublish(room.localParticipant.permissions?.canPublish ?? false)
    setIsScreenSharing(room.localParticipant.isScreenShareEnabled)
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
    setScreenShares([])
    setCanPublish(false)
  }, [])

  useEffect(() => leave, [leave])

  const join = async () => {
    setIsJoining(true)
    try {
      const credentials = await VirtualClassroomAPI.getMediaToken(classroomId)
      const room = new Room({ adaptiveStream: true, dynacast: true })
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
      room.on(RoomEvent.ParticipantPermissionsChanged, refresh)
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          const element = track.attach()
          element.autoplay = true
          audioRootRef.current?.appendChild(element)
        }
        refresh()
      })
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach((element) => element.remove())
        refresh()
      })
      room.on(RoomEvent.MediaDevicesError, () => {
        toast.error("Microphone access failed. Check your browser permission.")
      })

      await room.connect(credentials.url, credentials.token, { autoSubscribe: true })
      setCanPublish(credentials.canPublish)
      refresh()
    } catch (error) {
      leave()
      toast.error(error instanceof Error ? error.message : "Unable to join live audio")
    } finally {
      setIsJoining(false)
    }
  }

  const toggleMicrophone = async () => {
    const participant = roomRef.current?.localParticipant
    if (!participant) return
    if (!canPublish) {
      toast.info("The teacher has disabled student microphones.")
      return
    }
    try {
      await participant.setMicrophoneEnabled(!participant.isMicrophoneEnabled)
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

  return (
    <div className="border-b bg-white px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-36 items-center gap-2 text-xs text-gray-600">
          <Headphones className="h-4 w-4 text-red-600" />
          <span>{connected ? "Live media" : connectionLabel[connection]}</span>
          {connected && <span>· {participants.length} connected</span>}
        </div>

        {!connected ? (
          <Button size="sm" variant="outline" onClick={join} disabled={isJoining}>
            {isJoining ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Volume2 className="mr-2 h-4 w-4" />
            )}
            Join live session
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleMicrophone}
              disabled={!canPublish}
            >
              {isMicrophoneEnabled ? (
                <Mic className="mr-2 h-4 w-4" />
              ) : (
                <MicOff className="mr-2 h-4 w-4" />
              )}
              {isMicrophoneEnabled ? "Mute" : "Unmute"}
            </Button>
            <Button size="sm" variant="ghost" onClick={leave}>
              <PhoneOff className="mr-2 h-4 w-4" /> Leave live session
            </Button>
            {canManage && (
              <Button
                size="sm"
                variant={isScreenSharing ? "default" : "outline"}
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
          </>
        )}

        {canManage && (
          <div className="ml-auto flex items-center gap-2">
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
        )}
      </div>

      {connected && participants.length > 0 && (
        <div className="mt-2 flex max-h-14 flex-wrap gap-1 overflow-y-auto">
          {participants.map((participant) => (
            <span
              key={participant.identity}
              className={`rounded-full border px-2 py-0.5 text-[11px] ${participant.isSpeaking ? "border-green-400 bg-green-50 text-green-800" : "text-gray-600"}`}
            >
              {displayName(participant)}
              {participant instanceof LocalParticipant ? " (you)" : ""}
              {participant.isMicrophoneEnabled ? " · speaking enabled" : " · muted"}
            </span>
          ))}
        </div>
      )}
      {connected && screenShares.length > 0 && (
        <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-2">
          {screenShares.map((share) => (
            <ScreenShareStage key={share.id} share={share} />
          ))}
        </div>
      )}
      <div ref={audioRootRef} className="hidden" aria-hidden="true" />
    </div>
  )
}
