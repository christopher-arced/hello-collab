import type { Server } from 'socket.io'
import type { SocketUser } from '@hello/types'

// Room name utilities
export const BOARD_ROOM_PREFIX = 'board:'

export function getBoardRoom(boardId: string): string {
  return `${BOARD_ROOM_PREFIX}${boardId}`
}

export function parseBoardIdFromRoom(room: string): string | null {
  return room.startsWith(BOARD_ROOM_PREFIX) ? room.slice(BOARD_ROOM_PREFIX.length) : null
}

export function isBoardRoom(room: string): boolean {
  return room.startsWith(BOARD_ROOM_PREFIX)
}

// Active users tracking
const boardUsers = new Map<string, Map<string, SocketUser>>()

export function addUserToBoard(boardId: string, socketId: string, user: SocketUser): void {
  if (!boardUsers.has(boardId)) {
    boardUsers.set(boardId, new Map())
  }
  boardUsers.get(boardId)!.set(socketId, user)
}

export function removeUserFromBoard(boardId: string, socketId: string): boolean {
  const users = boardUsers.get(boardId)
  if (!users) return false

  const deleted = users.delete(socketId)
  if (users.size === 0) {
    boardUsers.delete(boardId)
  }
  return deleted
}

export function getActiveUsers(boardId: string): SocketUser[] {
  const users = boardUsers.get(boardId)
  if (!users) return []

  // Deduplicate by user id (same user might have multiple tabs)
  const uniqueUsers = new Map<string, SocketUser>()
  for (const user of users.values()) {
    uniqueUsers.set(user.id, user)
  }
  return Array.from(uniqueUsers.values())
}

export function getUserBoardIds(socketId: string): string[] {
  const boards: string[] = []
  for (const [boardId, users] of boardUsers.entries()) {
    if (users.has(socketId)) {
      boards.push(boardId)
    }
  }
  return boards
}

export function removeUserFromAllBoards(socketId: string): string[] {
  const affectedBoards: string[] = []

  for (const [boardId, users] of boardUsers.entries()) {
    if (users.has(socketId)) {
      users.delete(socketId)
      affectedBoards.push(boardId)
      if (users.size === 0) {
        boardUsers.delete(boardId)
      }
    }
  }

  return affectedBoards
}

// Socket server singleton with guard helper
let io: Server | null = null

export function setSocketServer(server: Server): void {
  io = server
}

export function getSocketServer(): Server | null {
  return io
}

export function withSocketServer(fn: (server: Server) => void): void {
  if (io) fn(io)
}
