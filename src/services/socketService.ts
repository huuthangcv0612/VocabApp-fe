import { io, Socket } from 'socket.io-client'

const STORAGE_TOKEN_KEY = 'vocabapp_token'

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3000/api'
  return apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:3000'
}

class SocketService {
  private socket: Socket | null = null
  private currentSessionId: string | null = null

  public connect(tokenOverride?: string): Socket {
    const token = tokenOverride || localStorage.getItem(STORAGE_TOKEN_KEY) || ''

    if (this.socket && this.socket.connected) {
      return this.socket
    }

    if (this.socket) {
      this.socket.disconnect()
    }

    const socketUrl = getSocketUrl()

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true,
    })

    this.socket.on('connect', () => {
      console.log('[Socket] Connected successfully with ID:', this.socket?.id)
      if (this.currentSessionId) {
        this.joinSessionRoom(this.currentSessionId)
      }
    })

    this.socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    return this.socket
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.connect()
    }
    return this.socket
  }

  public joinSessionRoom(sessionId: string, isTeacher = false): void {
    this.currentSessionId = sessionId
    const s = this.getSocket()
    if (!s) return

    const room = `session:${sessionId}`

    // Join room event - emit standard room join pattern as well as teacher/student specific event
    s.emit('join-room', { room, sessionId })
    if (isTeacher) {
      s.emit('teacher:start-session', { sessionId, room })
      s.emit('teacher:join', { sessionId, room })
    } else {
      s.emit('student:join-session', { sessionId, room })
      s.emit('student:join', { sessionId, room })
    }
  }

  public leaveSessionRoom(sessionId?: string): void {
    const targetSession = sessionId || this.currentSessionId
    if (targetSession && this.socket) {
      const room = `session:${targetSession}`
      this.socket.emit('leave-room', { room, sessionId: targetSession })
    }
    if (!sessionId || sessionId === this.currentSessionId) {
      this.currentSessionId = null
    }
  }

  public emit(event: string, data?: unknown): void {
    const s = this.getSocket()
    if (s && s.connected) {
      s.emit(event, data)
    } else if (s) {
      s.connect()
      s.once('connect', () => {
        s.emit(event, data)
      })
    }
  }

  public on(event: string, callback: (...args: unknown[]) => void): () => void {
    const s = this.getSocket()
    if (!s) return () => {}

    s.on(event, callback as (...args: unknown[]) => void)
    return () => {
      s.off(event, callback as (...args: unknown[]) => void)
    }
  }

  public off(event: string, callback?: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback as (...args: unknown[]) => void)
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.leaveSessionRoom()
      this.socket.disconnect()
      this.socket = null
    }
    this.currentSessionId = null
  }
}

export const socketService = new SocketService()
export default socketService
