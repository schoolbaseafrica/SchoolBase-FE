import { io, Socket } from "socket.io-client"
import * as Y from "yjs"

import { VirtualClassroomAPI } from "./virtual-classroom"

export type CollaborationStatus = "connecting" | "connected" | "reconnecting" | "offline"
type Listener = (snapshot: Record<string, unknown>, status: CollaborationStatus) => void

const socketOrigin = () => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!configured) return window.location.origin
  return new URL(configured, window.location.origin).origin
}

class ClassroomCollaborationClient {
  private readonly doc = new Y.Doc()
  private readonly board = this.doc.getMap<unknown>("board")
  private socket: Socket | null = null
  private sequence = 0
  private status: CollaborationStatus = "connecting"
  private listeners = new Set<Listener>()
  private started = false
  private canWrite = false
  private refreshingTicket = false
  private hasOfflineChanges = false

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
    listener(this.snapshot(), this.status)
    void this.start()
    return () => {
      this.listeners.delete(listener)
    }
  }

  update(values: Record<string, unknown>) {
    this.doc.transact(() => {
      for (const [key, value] of Object.entries(values)) this.board.set(key, value)
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
      const socket = io(`${socketOrigin()}${access.namespace}`, {
        transports: ["websocket"],
        auth: { ticket: access.ticket },
        withCredentials: true,
      })
      this.socket = socket
      socket.on("connect", () => {
        this.setStatus("connected")
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
            if (this.canWrite && this.hasOfflineChanges && this.board.size) {
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
            this.notify()
          }
        )
      })
      socket.on("disconnect", () => this.setStatus("reconnecting"))
      socket.on("connect_error", () => {
        this.setStatus("offline")
        void this.refreshTicket()
      })
      socket.on("whiteboard-update", (item: { sequence: number; update: string }) => {
        Y.applyUpdate(this.doc, base64ToBytes(item.update), "remote")
        this.sequence = Math.max(this.sequence, item.sequence)
      })
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
    return Object.fromEntries(this.board.entries())
  }

  private setStatus(status: CollaborationStatus) {
    this.status = status
    this.notify()
  }

  private notify() {
    const snapshot = this.snapshot()
    for (const listener of this.listeners) listener(snapshot, this.status)
  }
}

const clients = new Map<string, ClassroomCollaborationClient>()
export const classroomCollaboration = (classroomId: string) => {
  let client = clients.get(classroomId)
  if (!client) {
    client = new ClassroomCollaborationClient(classroomId)
    clients.set(classroomId, client)
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
