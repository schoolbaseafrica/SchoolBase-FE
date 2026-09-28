import { io, Socket } from "socket.io-client"
import * as Y from "yjs"

import { VirtualClassroomAPI } from "./virtual-classroom"

export type CollaborationStatus = "connecting" | "connected" | "reconnecting" | "offline"
type Listener = (
  snapshot: Record<string, unknown>,
  status: CollaborationStatus,
  allowStudentDraw: boolean | null
) => void
export interface CollaborationParticipant {
  userId: string
  name: string
  roles: string[]
  socketId: string
}
export interface CollaborationCursor extends CollaborationParticipant {
  x: number
  y: number
}
type PresenceListener = (
  participants: CollaborationParticipant[],
  cursors: CollaborationCursor[]
) => void

let socketOriginPromise: Promise<string> | null = null

const socketOrigin = () => {
  if (socketOriginPromise) return socketOriginPromise
  socketOriginPromise = fetch("/api/config", { credentials: "same-origin" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Runtime configuration is unavailable")
      const config = (await response.json()) as { apiUrl?: string }
      if (!config.apiUrl) throw new Error("The public API URL is not configured")
      return new URL(config.apiUrl, window.location.origin).origin
    })
    .catch(() => {
      const configured = process.env.NEXT_PUBLIC_API_BASE_URL
      return configured
        ? new URL(configured, window.location.origin).origin
        : window.location.origin
    })
  return socketOriginPromise
}

class ClassroomCollaborationClient {
  private readonly doc = new Y.Doc()
  private readonly board = this.doc.getMap<unknown>("board")
  private readonly elements = this.doc.getMap<Record<string, unknown>>("elements")
  private socket: Socket | null = null
  private sequence = 0
  private status: CollaborationStatus = "connecting"
  private listeners = new Set<Listener>()
  private started = false
  private canWrite = false
  private allowStudentDraw: boolean | null = null
  private refreshingTicket = false
  private hasOfflineChanges = false
  private presenceListeners = new Set<PresenceListener>()
  private participants = new Map<string, CollaborationParticipant>()
  private cursors = new Map<string, CollaborationCursor>()

  constructor(
    private readonly classroomId: string,
    private readonly pageKey = "main"
  ) {
    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin !== "remote" && this.socket?.connected) {
        this.socket.emit(
          "whiteboard-update",
          { pageKey: this.pageKey, update: bytesToBase64(update) },
          (response: { sequence?: number }) => {
            if (response?.sequence)
              this.sequence = Math.max(this.sequence, response.sequence)
          }
        )
      } else if (origin !== "remote") {
        this.hasOfflineChanges = true
      }
      this.notify()
    })
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    listener(this.snapshot(), this.status, this.allowStudentDraw)
    void this.start()
    return () => {
      this.listeners.delete(listener)
      this.stopWhenUnused()
    }
  }

  subscribePresence(listener: PresenceListener) {
    this.presenceListeners.add(listener)
    this.notifyPresence()
    void this.start()
    return () => {
      this.presenceListeners.delete(listener)
      this.stopWhenUnused()
    }
  }

  update(values: Record<string, unknown>) {
    this.doc.transact(() => {
      for (const [key, value] of Object.entries(values)) this.board.set(key, value)
    }, "local")
  }

  updateElements(elements: ReadonlyArray<Record<string, unknown>>) {
    this.doc.transact(() => {
      for (const element of elements) {
        const id = String(element.id)
        if (!id) continue
        const current = this.elements.get(id)
        if (JSON.stringify(current) !== JSON.stringify(element))
          this.elements.set(id, { ...element })
      }
    }, "local")
  }

  seed(values: Record<string, unknown>) {
    if (this.board.size) return
    this.update(values)
  }

  sendAwareness(state: unknown) {
    this.socket?.emit("awareness", { pageKey: this.pageKey, state })
  }

  private async start() {
    if (this.started) return
    this.started = true
    try {
      const access = await VirtualClassroomAPI.getCollaborationTicket(this.classroomId)
      this.canWrite = access.canWrite
      this.allowStudentDraw = access.allowStudentDraw
      const origin = await socketOrigin()
      const socket = io(`${origin}${access.namespace}`, {
        transports: ["websocket"],
        auth: { ticket: access.ticket },
        withCredentials: true,
      })
      this.socket = socket
      socket.on("connect", () => {
        this.setStatus("connecting")
        socket.emit(
          "sync",
          { pageKey: this.pageKey, sinceSequence: this.sequence },
          (state: {
            snapshot: { sequence: number; update: string } | null
            updates: Array<{ sequence: number; update: string }>
            sequence: number
          }) => {
            if (state.snapshot)
              Y.applyUpdate(this.doc, base64ToBytes(state.snapshot.update), "remote")
            for (const item of state.updates)
              Y.applyUpdate(this.doc, base64ToBytes(item.update), "remote")
            this.sequence = state.sequence
            if (
              this.canWrite &&
              this.hasOfflineChanges &&
              (this.board.size || this.elements.size)
            ) {
              socket.emit(
                "whiteboard-update",
                {
                  pageKey: this.pageKey,
                  update: bytesToBase64(Y.encodeStateAsUpdate(this.doc)),
                },
                (response: { sequence?: number }) => {
                  if (response?.sequence)
                    this.sequence = Math.max(this.sequence, response.sequence)
                  this.hasOfflineChanges = false
                }
              )
            }
            this.setStatus("connected")
          }
        )
      })
      socket.on("disconnect", () => this.setStatus("reconnecting"))
      socket.on("connect_error", () => {
        this.setStatus("offline")
        void this.refreshTicket()
      })
      socket.on("collaboration-error", () => this.setStatus("offline"))
      socket.on("whiteboard-update", (item: { sequence: number; update: string }) => {
        Y.applyUpdate(this.doc, base64ToBytes(item.update), "remote")
        this.sequence = Math.max(this.sequence, item.sequence)
      })
      socket.on("presence-snapshot", (items: CollaborationParticipant[]) => {
        this.participants = new Map(items.map((item) => [item.socketId, item]))
        this.notifyPresence()
      })
      socket.on(
        "presence",
        (item: CollaborationParticipant & { type: "joined" | "left" }) => {
          if (item.type === "left") {
            this.participants.delete(item.socketId)
            this.cursors.delete(item.socketId)
          } else {
            this.participants.set(item.socketId, item)
          }
          this.notifyPresence()
        }
      )
      socket.on("permissions", (permissions: { allowStudentDraw: boolean }) => {
        this.allowStudentDraw = permissions.allowStudentDraw
        this.notify()
      })
      socket.on(
        "awareness",
        (item: { userId: string; socketId: string; state?: unknown }) => {
          const participant = this.participants.get(item.socketId)
          const state = item.state as { x?: number; y?: number } | null
          if (participant && typeof state?.x === "number" && typeof state.y === "number")
            this.cursors.set(item.socketId, { ...participant, x: state.x, y: state.y })
          else this.cursors.delete(item.socketId)
          this.notifyPresence()
        }
      )
    } catch {
      this.setStatus("offline")
    }
  }

  private async refreshTicket() {
    if (!this.socket || this.refreshingTicket) return
    this.refreshingTicket = true
    try {
      const access = await VirtualClassroomAPI.getCollaborationTicket(this.classroomId)
      this.canWrite = access.canWrite
      this.allowStudentDraw = access.allowStudentDraw
      this.socket.auth = { ticket: access.ticket }
      this.setStatus("reconnecting")
      this.socket.connect()
    } catch {
      this.setStatus("offline")
    } finally {
      this.refreshingTicket = false
    }
  }

  private snapshot() {
    const elements = [...this.elements.values()].sort((left, right) => {
      const leftIndex = typeof left.index === "string" ? left.index : ""
      const rightIndex = typeof right.index === "string" ? right.index : ""
      return leftIndex.localeCompare(rightIndex)
    })
    return {
      ...Object.fromEntries(this.board.entries()),
      excalidraw_elements: elements,
    }
  }

  private setStatus(status: CollaborationStatus) {
    this.status = status
    this.notify()
  }

  private notify() {
    const snapshot = this.snapshot()
    for (const listener of this.listeners)
      listener(snapshot, this.status, this.allowStudentDraw)
  }

  private notifyPresence() {
    const participants = [...this.participants.values()]
    const cursors = [...this.cursors.values()]
    for (const listener of this.presenceListeners) listener(participants, cursors)
  }

  private stopWhenUnused() {
    if (this.listeners.size || this.presenceListeners.size) return
    this.socket?.disconnect()
    this.socket = null
    this.started = false
    this.participants.clear()
    this.cursors.clear()
  }
}

const clients = new Map<string, ClassroomCollaborationClient>()
export const classroomCollaboration = (classroomId: string, pageKey = "main") => {
  const key = `${classroomId}:${pageKey}`
  let client = clients.get(key)
  if (!client) {
    client = new ClassroomCollaborationClient(classroomId, pageKey)
    clients.set(key, client)
  }
  return client
}

const bytesToBase64 = (value: Uint8Array) => {
  let binary = ""
  value.forEach((byte) => (binary += String.fromCharCode(byte)))
  return btoa(binary)
}
const base64ToBytes = (value: string) =>
  Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
