import type { Socket } from 'socket.io'
import { verifyToken, findUserById } from '../services/auth.service'
import type { SocketUser } from '@hello/types'

// Extend socket data with user information
export interface SocketData {
  user: SocketUser
}

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    // Get token from auth handshake or cookie
    const token = socket.handshake.auth?.token || parseCookie(socket.handshake.headers.cookie)

    if (!token) {
      return next(new Error('Authentication required'))
    }

    const result = verifyToken(token)

    if (!result.valid) {
      return next(new Error(result.expired ? 'Token expired' : 'Invalid token'))
    }

    const user = await findUserById(result.userId)

    if (!user) {
      return next(new Error('User not found'))
    }

    // Attach user to socket data
    socket.data.user = {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    }

    return next()
  } catch {
    return next(new Error('Authentication failed'))
  }
}

function parseCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = value
      }
      return acc
    },
    {} as Record<string, string>
  )

  return cookies['accessToken'] || null
}
