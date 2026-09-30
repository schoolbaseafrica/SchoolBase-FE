"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  Loader2,
  ChevronRight,
  MessageSquare,
  Mic,
  Square,
  Trash2,
  RotateCcw,
  Play,
  Pause,
  Volume2,
} from "lucide-react"
import {
  useClassroomMessages,
  useCreateMessage,
  useCreateVoiceNote,
} from "../_hooks/use-classroom-messages"
import { ClassroomMessage } from "@/lib/classroom-message"
// Simple date formatting without date-fns dependency
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

const formatAudioTime = (seconds: number) => {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`
}

function VoiceNotePlayer({
  source,
  durationHint,
}: {
  source: string
  durationHint?: number
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [resolvedSource, setResolvedSource] = useState("")
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationHint ?? 0)
  const [error, setError] = useState("")

  useEffect(() => {
    let disposed = false
    let objectUrl = ""
    const resolve = async () => {
      try {
        if (source.startsWith("blob:")) {
          if (!disposed) setResolvedSource(source)
          return
        }
        const response = await fetch(source, { credentials: "include" })
        if (!response.ok) throw new Error(`Playback failed (${response.status})`)
        objectUrl = URL.createObjectURL(await response.blob())
        if (!disposed) setResolvedSource(objectUrl)
      } catch (caught) {
        if (!disposed)
          setError(caught instanceof Error ? caught.message : "Voice note could not load")
      }
    }
    const timer = window.setTimeout(() => {
      setError("")
      setResolvedSource("")
      setCurrentTime(0)
      setPlaying(false)
      void resolve()
    }, 0)
    return () => {
      window.clearTimeout(timer)
      disposed = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [source])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio || !resolvedSource) return
    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setError("This browser could not play the voice note")
      }
    } else audio.pause()
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-2.5 shadow-sm">
      <audio
        ref={audioRef}
        src={resolvedSource || undefined}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => setError("This voice note could not be played")}
      />
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          size="icon"
          onClick={() => void toggle()}
          disabled={!resolvedSource || Boolean(error)}
          className="h-9 w-9 shrink-0 rounded-full"
          aria-label={playing ? "Pause voice note" : "Play voice note"}
        >
          {resolvedSource ? (
            playing ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" />
            )
          ) : (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={Math.max(duration, 1)}
            step={0.1}
            value={Math.min(currentTime, Math.max(duration, 1))}
            onChange={(event) => {
              const value = Number(event.target.value)
              if (audioRef.current) audioRef.current.currentTime = value
              setCurrentTime(value)
            }}
            className="h-1.5 w-full cursor-pointer accent-[var(--primary)]"
            aria-label="Voice note position"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{formatAudioTime(currentTime)}</span>
            <span>{formatAudioTime(duration || durationHint || 0)}</span>
          </div>
        </div>
        <Volume2 className="h-4 w-4 shrink-0 text-slate-400" />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

interface ClassroomChatProps {
  classId: string
  isReadOnly?: boolean
  senderType?: "teacher" | "student" // Optional - backend determines from token
  senderId?: string // Optional - backend determines from token
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  showCollapseButton?: boolean
}

export function ClassroomChat({
  classId,
  isReadOnly = false,
  isCollapsed = false,
  onToggleCollapse,
  showCollapseButton = false,
}: ClassroomChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordingStartedAtRef = useRef(0)
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const discardRecordingRef = useRef(false)
  const [textInput, setTextInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [voiceNote, setVoiceNote] = useState<{
    blob: Blob
    url: string
    duration: number
  } | null>(null)
  const [voiceError, setVoiceError] = useState<string | null>(null)

  const { data: messages = [], isLoading } = useClassroomMessages(classId, {
    enablePolling: true,
  })
  const createMessageMutation = useCreateMessage(classId)
  const createVoiceNoteMutation = useCreateVoiceNote(classId)

  const releaseRecorder = useCallback(() => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    recordingTimerRef.current = null
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    recordingStreamRef.current = null
    recorderRef.current = null
    setIsRecording(false)
  }, [])

  const discardVoiceNote = useCallback(() => {
    if (voiceNote) URL.revokeObjectURL(voiceNote.url)
    setVoiceNote(null)
    setVoiceError(null)
  }, [voiceNote])

  useEffect(
    () => () => {
      releaseRecorder()
      if (voiceNote) URL.revokeObjectURL(voiceNote.url)
    },
    [releaseRecorder, voiceNote]
  )

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder?.state === "recording") recorder.stop()
  }, [])

  const cancelRecording = useCallback(() => {
    discardRecordingRef.current = true
    stopRecording()
  }, [stopRecording])

  const startRecording = useCallback(async () => {
    setVoiceError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      })
      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ]
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type))
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType, audioBitsPerSecond: 48_000 } : undefined
      )
      chunksRef.current = []
      discardRecordingRef.current = false
      recordingStreamRef.current = stream
      recorderRef.current = recorder
      recordingStartedAtRef.current = Date.now()
      setRecordingSeconds(0)
      setIsRecording(true)
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const duration = Math.max(
          1,
          Math.min(120, Math.ceil((Date.now() - recordingStartedAtRef.current) / 1000))
        )
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        releaseRecorder()
        if (discardRecordingRef.current) {
          chunksRef.current = []
          setRecordingSeconds(0)
          return
        }
        if (!blob.size) {
          setVoiceError("No audio was captured. Please try again.")
          return
        }
        setVoiceNote({ blob, url: URL.createObjectURL(blob), duration })
      }
      recorder.start(1000)
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartedAtRef.current) / 1000)
        setRecordingSeconds(elapsed)
        if (elapsed >= 120 && recorder.state === "recording") recorder.stop()
      }, 250)
    } catch {
      releaseRecorder()
      setVoiceError(
        "Microphone access was not available. Check your browser permission and try again."
      )
    }
  }, [releaseRecorder])

  const sendVoiceNote = useCallback(async () => {
    if (!voiceNote || createVoiceNoteMutation.isPending) return
    setVoiceError(null)
    try {
      await createVoiceNoteMutation.mutateAsync({
        file: voiceNote.blob,
        duration: voiceNote.duration,
      })
      discardVoiceNote()
    } catch (error) {
      setVoiceError(
        error instanceof Error ? error.message : "Voice note upload failed. Try again."
      )
    }
  }, [voiceNote, createVoiceNoteMutation, discardVoiceNote])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle text message send
  const handleSendText = useCallback(async () => {
    if (!textInput.trim() || createMessageMutation.isPending) return

    const messageText = textInput.trim()
    setTextInput("")

    try {
      await createMessageMutation.mutateAsync({
        class_id: classId,
        // Backend will determine sender_type and sender_id from token
        text: messageText,
      })
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }, [textInput, classId, createMessageMutation])

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) {
        return "Just now"
      } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}m ago`
      } else if (diffInSeconds < 86400) {
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      } else {
        return formatDate(date)
      }
    } catch {
      return ""
    }
  }

  // Check if message is from current user (approximate check)
  // Backend determines sender, so we show all messages but style them differently
  const isOwnMessage = (message: ClassroomMessage) => {
    // For now, show all messages with same styling
    // Could enhance by storing current user ID in context/token if needed
    void message
    return false
  }

  if (isCollapsed && showCollapseButton) {
    return (
      <div className="flex h-full flex-col border-t bg-white md:border-t-0 md:border-l">
        <div className="flex items-center justify-center border-b bg-gray-50 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0 hover:bg-gray-200"
            title="Expand chat"
          >
            <MessageSquare className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-lg border-t bg-white md:border-t-0 md:border-l md:shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between rounded-t-lg border-b bg-gray-50 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-gray-900">Class Chat</h2>
          <p className="truncate text-xs text-gray-500">Messages with students</p>
        </div>
        {showCollapseButton && onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="ml-2 h-8 w-8 flex-shrink-0 p-0"
            title="Collapse chat"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-3 pb-2 md:p-4 md:pb-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = isOwnMessage(message)
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {/* Sender name (for other users) */}
                  {!isOwn && (
                    <div className="mb-1 text-xs font-medium opacity-75">
                      {message.sender_name ||
                        (message.sender_type === "teacher" ? "Teacher" : "Student")}
                    </div>
                  )}

                  {/* Text message */}
                  {message.text && (
                    <div className="text-sm break-words whitespace-pre-wrap">
                      {message.text}
                    </div>
                  )}
                  {message.audio_url && (
                    <div className="min-w-56">
                      <VoiceNotePlayer
                        source={message.audio_url}
                        durationHint={message.audio_duration ?? undefined}
                      />
                      {message.audio_duration && (
                        <div className="mt-1 text-xs opacity-70">
                          Voice note · {message.audio_duration}s
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`mt-1 text-xs ${
                      isOwn ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isReadOnly && (
        <div className="rounded-b-lg border-t bg-white p-3 pt-2 md:p-4 md:pt-4">
          {isRecording && (
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700 shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
              </span>
              <span className="font-medium">Recording</span>
              <span className="font-mono text-xs">
                {formatAudioTime(recordingSeconds)} / 2:00
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelRecording}
                className="ml-auto h-8"
              >
                Cancel
              </Button>
              <Button size="sm" variant="outline" onClick={stopRecording} className="h-8">
                <Square className="mr-2 h-3 w-3 fill-current" />
                Stop
              </Button>
            </div>
          )}
          {voiceNote && !isRecording && (
            <div className="mb-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
              <VoiceNotePlayer source={voiceNote.url} durationHint={voiceNote.duration} />
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  Preview · {voiceNote.duration}s
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={discardVoiceNote}
                  disabled={createVoiceNoteMutation.isPending}
                  className="ml-auto h-8"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={sendVoiceNote}
                  disabled={createVoiceNoteMutation.isPending}
                  className="h-8"
                >
                  {createVoiceNoteMutation.isPending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : voiceError ? (
                    <RotateCcw className="mr-1 h-3 w-3" />
                  ) : (
                    <Send className="mr-1 h-3 w-3" />
                  )}
                  {voiceError ? "Retry" : "Send"}
                </Button>
              </div>
            </div>
          )}
          {voiceError && <p className="mb-2 text-xs text-red-600">{voiceError}</p>}
          {/* Text input and buttons */}
          <div className="flex items-center gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={createMessageMutation.isPending}
            />
            <Button
              type="button"
              variant="outline"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={Boolean(voiceNote) || createVoiceNoteMutation.isPending}
              className="h-10 w-10 p-0"
              title={isRecording ? "Stop recording" : "Record voice note"}
            >
              {isRecording ? (
                <Square className="h-4 w-4 fill-current text-red-600" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <>
              <Button
                onClick={handleSendText}
                disabled={!textInput.trim() || createMessageMutation.isPending}
                className="h-10 w-10"
              >
                {createMessageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </>
          </div>
        </div>
      )}
    </div>
  )
}
