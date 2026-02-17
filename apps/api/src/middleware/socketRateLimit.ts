import type { Socket } from 'socket.io'

const MAX_CONNECTIONS_PER_WINDOW = 10
const WINDOW_MS = 60 * 1000 // 1 minute

const connectionAttempts = new Map<
  string,
  { count: number; resetTimer: ReturnType<typeof setTimeout> }
>()

export function socketRateLimitMiddleware(socket: Socket, next: (err?: Error) => void): void {
  const ip = socket.handshake.address

  const entry = connectionAttempts.get(ip)
  if (entry) {
    entry.count++
    if (entry.count > MAX_CONNECTIONS_PER_WINDOW) {
      next(new Error('Too many connection attempts, please try again later'))
      return
    }
  } else {
    const resetTimer = setTimeout(() => {
      connectionAttempts.delete(ip)
    }, WINDOW_MS)
    connectionAttempts.set(ip, { count: 1, resetTimer })
  }

  next()
}

// Exported for testing
export function clearConnectionAttempts(): void {
  for (const entry of connectionAttempts.values()) {
    clearTimeout(entry.resetTimer)
  }
  connectionAttempts.clear()
}

export { MAX_CONNECTIONS_PER_WINDOW, WINDOW_MS }
