import type { Server, Socket } from 'socket.io'
import { SOCKET_EVENTS, type ActiveUsersChangedEvent } from '@hello/types'
import { joinBoardPayloadSchema, leaveBoardPayloadSchema } from '@hello/validation'
import type { SocketData } from '../middleware/socketAuth'
import { hasBoardAccess } from '../utils/boardAccess'
import {
  getBoardRoom,
  isBoardRoom,
  parseBoardIdFromRoom,
  addUserToBoard,
  removeUserFromBoard,
  removeUserFromAllBoards,
  getActiveUsers,
} from './utils'

function broadcastActiveUsers(io: Server, boardId: string): void {
  const users = getActiveUsers(boardId)
  const event: ActiveUsersChangedEvent = { boardId, users }
  io.to(getBoardRoom(boardId)).emit(SOCKET_EVENTS.USERS_ACTIVE, event)
}

export function registerBoardHandlers(io: Server, socket: Socket): void {
  const user = (socket.data as SocketData).user

  socket.on(SOCKET_EVENTS.JOIN_BOARD, async (data: unknown) => {
    try {
      // Validate payload
      const result = joinBoardPayloadSchema.safeParse(data)
      if (!result.success) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid join board payload' })
        return
      }
      const { boardId } = result.data

      // Verify user has access to the board
      const hasAccess = await hasBoardAccess(boardId, user.id)
      if (!hasAccess) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Access denied to board' })
        return
      }

      // Leave any previous board rooms (except personal room)
      const currentRooms = Array.from(socket.rooms).filter(isBoardRoom)
      for (const room of currentRooms) {
        const prevBoardId = parseBoardIdFromRoom(room)
        if (prevBoardId) {
          socket.leave(room)
          if (removeUserFromBoard(prevBoardId, socket.id)) {
            broadcastActiveUsers(io, prevBoardId)
          }
        }
      }

      // Join the new board room
      socket.join(getBoardRoom(boardId))

      // Track user in board
      addUserToBoard(boardId, socket.id, user)

      // Broadcast active users to all in room
      broadcastActiveUsers(io, boardId)

      // eslint-disable-next-line no-console
      console.log(`User ${user.name} joined board ${boardId}`)
    } catch (error) {
      console.error('Error in join board handler:', error)
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to join board' })
    }
  })

  socket.on(SOCKET_EVENTS.LEAVE_BOARD, (data: unknown) => {
    try {
      // Validate payload
      const result = leaveBoardPayloadSchema.safeParse(data)
      if (!result.success) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Invalid leave board payload' })
        return
      }
      const { boardId } = result.data

      socket.leave(getBoardRoom(boardId))

      // Remove from tracking and broadcast if there are remaining users
      if (removeUserFromBoard(boardId, socket.id)) {
        broadcastActiveUsers(io, boardId)
      }

      // eslint-disable-next-line no-console
      console.log(`User ${user.name} left board ${boardId}`)
    } catch (error) {
      console.error('Error in leave board handler:', error)
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Failed to leave board' })
    }
  })

  // Clean up on disconnect
  socket.on('disconnect', () => {
    // Remove user from all boards and broadcast updates
    const affectedBoards = removeUserFromAllBoards(socket.id)
    for (const boardId of affectedBoards) {
      broadcastActiveUsers(io, boardId)
    }
  })
}
