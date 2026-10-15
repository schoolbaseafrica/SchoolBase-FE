"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Room, RoomEvent, Track, type LocalTrack, type RemoteTrack } from "livekit-client"
import { Camera, CameraOff, Mic, MicOff, MonitorUp, PhoneOff, Video } from "lucide-react"
import { MeetingsAPI, type Meeting } from "@/lib/meetings"
import { useAuthUser } from "@/hooks/use-auth-user"

type VideoItem = { id: string; name: string; track: LocalTrack | RemoteTrack }

function VideoTile({ item }: { item: VideoItem }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = item.track.attach()
    element.className = "h-full w-full object-cover"
    ref.current?.appendChild(element)
    return () => {
      item.track.detach(element)
      element.remove()
    }
  }, [item.track])
  return (
    <div className="overflow-hidden rounded-2xl border bg-slate-900">
      <div ref={ref} className="aspect-video" />
      <p className="px-3 py-2 text-sm text-white">{item.name}</p>
    </div>
  )
}

export function MeetingRoom() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const viewer = useAuthUser()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [error, setError] = useState("")
  const [admission, setAdmission] = useState("none")
  const [requests, setRequests] = useState<
    Array<{ userId: string; name: string; status: string }>
  >([])
  const [connected, setConnected] = useState(false)
  const [mic, setMic] = useState(false)
  const [camera, setCamera] = useState(false)
  const [screen, setScreen] = useState(false)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [participants, setParticipants] = useState<Array<{ id: string; name: string }>>(
    []
  )
  const [messages, setMessages] = useState<Array<{ name: string; text: string }>>([])
  const [message, setMessage] = useState("")
  const roomRef = useRef<Room | null>(null)
  const audioRoot = useRef<HTMLDivElement>(null)
  const host = Boolean(meeting && viewer.data?.id === meeting.createdBy)

  const refresh = useCallback(async () => {
    try {
      setMeeting(await MeetingsAPI.get(id))
      setError("")
    } catch {
      setError("Meeting could not be loaded or you are not invited.")
    }
  }, [id])
  useEffect(() => {
    const initial = setTimeout(() => void refresh(), 0)
    const interval = setInterval(() => void refresh(), 10000)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [refresh])
  useEffect(() => {
    if (!meeting || meeting.status !== "live" || (connected && !host)) return
    let active = true
    const check = async () => {
      try {
        const result = await MeetingsAPI.admission(id)
        if (!active) return
        if (Array.isArray(result)) setRequests(result)
        else setAdmission(result.status)
      } catch {
        /* Keep current status and retry. */
      }
    }
    void check()
    const interval = setInterval(() => void check(), 5000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [id, meeting?.status, connected, meeting, host])
  useEffect(
    () => () => {
      void roomRef.current?.disconnect()
      roomRef.current = null
    },
    []
  )
  useEffect(() => {
    if (meeting?.status === "ended" || meeting?.status === "cancelled") {
      void roomRef.current?.disconnect()
      roomRef.current = null
      queueMicrotask(() => setConnected(false))
    }
  }, [meeting?.status])

  const syncVideos = (room: Room) => {
    const next: VideoItem[] = []
    const add = (
      name: string,
      publications: Iterable<{ track?: LocalTrack | RemoteTrack; source: Track.Source }>
    ) => {
      for (const publication of publications) {
        if (
          publication.track &&
          (publication.source === Track.Source.Camera ||
            publication.source === Track.Source.ScreenShare)
        )
          next.push({
            id: `${name}-${publication.track.sid}`,
            name,
            track: publication.track,
          })
      }
    }
    add("You", room.localParticipant.trackPublications.values())
    room.remoteParticipants.forEach((participant) =>
      add(
        participant.name || participant.identity,
        participant.trackPublications.values()
      )
    )
    setVideos(next)
    setParticipants(
      [...room.remoteParticipants.values()].map((item) => ({
        id: item.identity,
        name: item.name || item.identity,
      }))
    )
  }

  const join = async () => {
    setError("")
    try {
      const credentials = await MeetingsAPI.token(id)
      const room = new Room({ adaptiveStream: true, dynacast: true })
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          const element = track.attach()
          element.autoplay = true
          audioRoot.current?.appendChild(element)
        }
        syncVideos(room)
      })
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach((element) => element.remove())
        syncVideos(room)
      })
      room.on(RoomEvent.LocalTrackPublished, () => syncVideos(room))
      room.on(RoomEvent.LocalTrackUnpublished, () => syncVideos(room))
      room.on(RoomEvent.ParticipantDisconnected, () => syncVideos(room))
      room.on(RoomEvent.ParticipantConnected, () => syncVideos(room))
      room.on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
        if (topic !== "meeting-chat") return
        const text = new TextDecoder().decode(payload).slice(0, 1000)
        setMessages((old) => [
          ...old.slice(-99),
          { name: participant?.name || "Participant", text },
        ])
      })
      room.on(RoomEvent.Disconnected, () => {
        if (roomRef.current === room) roomRef.current = null
        setConnected(false)
        setVideos([])
      })
      await room.connect(credentials.url, credentials.token)
      roomRef.current = room
      syncVideos(room)
      setConnected(true)
    } catch {
      setError("Could not join. Check your invitation, admission, and meeting time.")
    }
  }
  const changeStatus = async (status: "live" | "ended" | "cancelled") => {
    try {
      setMeeting(await MeetingsAPI.status(id, status))
      setError("")
    } catch {
      setError("Could not change the meeting status.")
    }
  }
  const decide = async (userId: string, status: "admitted" | "denied") => {
    try {
      await MeetingsAPI.decide(id, userId, status)
      setRequests((old) =>
        old.map((item) => (item.userId === userId ? { ...item, status } : item))
      )
    } catch {
      setError("Could not update admission.")
    }
  }
  const toggle = async (kind: "mic" | "camera" | "screen") => {
    const room = roomRef.current
    if (!room) return
    try {
      if (kind === "mic") {
        await room.localParticipant.setMicrophoneEnabled(!mic)
        setMic(!mic)
      }
      if (kind === "camera") {
        await room.localParticipant.setCameraEnabled(!camera)
        setCamera(!camera)
      }
      if (kind === "screen") {
        await room.localParticipant.setScreenShareEnabled(!screen)
        setScreen(!screen)
      }
      syncVideos(room)
    } catch {
      setError("Your browser could not start that device. Check its permissions.")
    }
  }
  const sendMessage = async () => {
    const text = message.trim().slice(0, 1000)
    if (!text || !roomRef.current) return
    try {
      await roomRef.current.localParticipant.publishData(new TextEncoder().encode(text), {
        reliable: true,
        topic: "meeting-chat",
      })
      setMessages((old) => [...old.slice(-99), { name: "You", text }])
      setMessage("")
    } catch {
      setError("Message could not be sent.")
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Meetings
      </button>
      {meeting && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-[var(--primary)] uppercase">
                Virtual meeting
              </p>
              <h1 className="mt-1 text-3xl font-semibold">{meeting.title}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {new Date(meeting.startsAt).toLocaleString()} –{" "}
                {new Date(meeting.endsAt).toLocaleString()}
              </p>
              {meeting.description && (
                <p className="mt-3 text-sm">{meeting.description}</p>
              )}
            </div>
            <span className="rounded-full border px-4 py-2 text-sm capitalize">
              {meeting.status}
            </span>
          </div>
          {host && meeting.status === "scheduled" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void changeStatus("live")}
                className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white"
              >
                Open meeting
              </button>
              <button
                type="button"
                onClick={() => void changeStatus("cancelled")}
                className="rounded-full border px-5 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          )}
          {host && meeting.status === "live" && (
            <button
              type="button"
              onClick={() => void changeStatus("ended")}
              className="rounded-full border border-red-200 px-5 py-2 text-sm text-red-700"
            >
              End meeting for everyone
            </button>
          )}
          {host &&
            meeting.status === "live" &&
            requests.some((item) => item.status === "pending") && (
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="font-semibold">Waiting for admission</h2>
                <div className="mt-3 space-y-2">
                  {requests
                    .filter((item) => item.status === "pending")
                    .map((item) => (
                      <div
                        key={item.userId}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span>{item.name}</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void decide(item.userId, "admitted")}
                            className="rounded-full bg-[var(--primary)] px-3 py-1 text-sm text-white"
                          >
                            Admit
                          </button>
                          <button
                            type="button"
                            onClick={() => void decide(item.userId, "denied")}
                            className="rounded-full border px-3 py-1 text-sm"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
          {!host && meeting.status === "live" && !connected && admission === "none" && (
            <button
              type="button"
              onClick={() =>
                void MeetingsAPI.requestAdmission(id)
                  .then((result) => setAdmission(result.status))
                  .catch(() => setError("Could not request admission."))
              }
              className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm text-white"
            >
              Request to join
            </button>
          )}
          {!host && admission === "pending" && (
            <p className="rounded-xl border bg-white p-4 text-sm">
              Waiting for the host to admit you…
            </p>
          )}
          {!host && admission === "denied" && (
            <p className="rounded-xl border bg-white p-4 text-sm">
              The host declined your request.
            </p>
          )}
          {!connected &&
            (host || admission === "admitted") &&
            meeting.status === "live" && (
              <button
                type="button"
                onClick={() => void join()}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white"
              >
                <Video className="h-4 w-4" />
                Join meeting
              </button>
            )}
          {!connected && host && meeting.status === "scheduled" && (
            <button
              type="button"
              onClick={() => void join()}
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm"
            >
              <Video className="h-4 w-4" />
              Preview room
            </button>
          )}
          {connected && (
            <section className="rounded-2xl border bg-white p-5">
              <div ref={audioRoot} aria-hidden="true" />
              <div className="grid gap-3 sm:grid-cols-2">
                {videos.length ? (
                  videos.map((item) => <VideoTile key={item.id} item={item} />)
                ) : (
                  <p className="rounded-xl bg-slate-100 p-6 text-sm">
                    Connected. Camera is off.
                  </p>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void toggle("mic")}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                >
                  {mic ? <Mic /> : <MicOff />} Microphone
                </button>
                <button
                  type="button"
                  onClick={() => void toggle("camera")}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                >
                  {camera ? <Camera /> : <CameraOff />} Camera
                </button>
                <button
                  type="button"
                  onClick={() => void toggle("screen")}
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
                >
                  <MonitorUp /> {screen ? "Stop sharing" : "Share screen"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void roomRef.current?.disconnect()
                    roomRef.current = null
                    setConnected(false)
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
                >
                  <PhoneOff /> Leave
                </button>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <h2 className="font-semibold">Participants</h2>
                  <p className="mt-2 text-sm">You</p>
                  {participants.map((item) => (
                    <div
                      key={item.id}
                      className="mt-2 flex items-center justify-between gap-2 text-sm"
                    >
                      <span>{item.name}</span>
                      {host && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void MeetingsAPI.mute(id, item.id).catch(() =>
                                setError("Could not mute participant.")
                              )
                            }
                            className="rounded-full border px-3 py-1"
                          >
                            Mute
                          </button>
                          <button
                            type="button"
                            onClick={() => void decide(item.id, "denied")}
                            className="rounded-full border border-red-200 px-3 py-1 text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div>
                  <h2 className="font-semibold">Chat</h2>
                  <div
                    aria-live="polite"
                    className="mt-2 h-44 space-y-2 overflow-auto rounded-xl border p-3 text-sm"
                  >
                    {messages.map((item, index) => (
                      <p key={index}>
                        <strong>{item.name}:</strong> {item.text}
                      </p>
                    ))}
                  </div>
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void sendMessage()
                    }}
                  >
                    <input
                      aria-label="Chat message"
                      className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      maxLength={1000}
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm text-white"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}
        </>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </main>
  )
}
