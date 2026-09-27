"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, ChevronRight, MessageSquare } from "lucide-react"
import { useClassroomMessages, useCreateMessage } from "../_hooks/use-classroom-messages"
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
  const [textInput, setTextInput] = useState("")

  const { data: messages = [], isLoading } = useClassroomMessages(classId, {
    enablePolling: true,
  })
  const createMessageMutation = useCreateMessage(classId)

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
