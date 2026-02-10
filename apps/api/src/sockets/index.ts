import type { Server } from 'socket.io'
import { socketAuthMiddleware, type SocketData } from '../middleware/socketAuth'
import { registerBoardHandlers } from './board.socket'

export function registerSocketHandlers(io: Server): void {
  // Apply authentication middleware
  io.use(socketAuthMiddleware)

  io.on('connection', (socket) => {
    const user = (socket.data as SocketData).user
    // eslint-disable-next-line no-console
    console.log(`Client connected: ${socket.id} (${user.name})`)

    // Register board room handlers
    registerBoardHandlers(io, socket)

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`Client disconnected: ${socket.id} (${user.name})`)
    })
  })
}

// Re-export utilities for use elsewhere
export { getBoardRoom, setSocketServer, getSocketServer } from './utils'
