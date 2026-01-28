import type { Board, List, Card, BoardMember, SocketUser, SOCKET_EVENTS } from '@hello/types'
import { getBoardRoom, withSocketServer } from './utils'

// Re-export for backward compatibility
export { setSocketServer, getSocketServer } from './utils'

// Board events
export function emitBoardUpdated(boardId: string, board: Board, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit(
      'board:updated' satisfies typeof SOCKET_EVENTS.BOARD_UPDATED,
      {
        board,
        userId,
      }
    )
  })
}

export function emitBoardDeleted(boardId: string, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit(
      'board:deleted' satisfies typeof SOCKET_EVENTS.BOARD_DELETED,
      {
        boardId,
        userId,
      }
    )
  })
}

// List events
export function emitListCreated(boardId: string, list: List, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('list:created' satisfies typeof SOCKET_EVENTS.LIST_CREATED, {
      list,
      userId,
    })
  })
}

export function emitListUpdated(boardId: string, list: List, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('list:updated' satisfies typeof SOCKET_EVENTS.LIST_UPDATED, {
      list,
      userId,
    })
  })
}

export function emitListDeleted(boardId: string, listId: string, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('list:deleted' satisfies typeof SOCKET_EVENTS.LIST_DELETED, {
      listId,
      boardId,
      userId,
    })
  })
}

export function emitListsReordered(boardId: string, lists: List[], userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit(
      'list:reordered' satisfies typeof SOCKET_EVENTS.LIST_REORDERED,
      { boardId, lists, userId }
    )
  })
}

// Card events
export function emitCardCreated(boardId: string, card: Card, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('card:created' satisfies typeof SOCKET_EVENTS.CARD_CREATED, {
      card,
      userId,
    })
  })
}

export function emitCardUpdated(boardId: string, card: Card, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('card:updated' satisfies typeof SOCKET_EVENTS.CARD_UPDATED, {
      card,
      userId,
    })
  })
}

export function emitCardDeleted(
  boardId: string,
  cardId: string,
  listId: string,
  userId: string
): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('card:deleted' satisfies typeof SOCKET_EVENTS.CARD_DELETED, {
      cardId,
      listId,
      boardId,
      userId,
    })
  })
}

export function emitCardMoved(
  boardId: string,
  card: Card,
  fromListId: string,
  userId: string
): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('card:moved' satisfies typeof SOCKET_EVENTS.CARD_MOVED, {
      card,
      fromListId,
      userId,
    })
  })
}

export function emitCardsReordered(
  boardId: string,
  listId: string,
  cards: Card[],
  userId: string
): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit(
      'card:reordered' satisfies typeof SOCKET_EVENTS.CARD_REORDERED,
      { listId, cards, userId }
    )
  })
}

// Member events
export function emitMemberAdded(boardId: string, member: BoardMember, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('member:added' satisfies typeof SOCKET_EVENTS.MEMBER_ADDED, {
      member,
      userId,
    })
  })
}

export function emitMemberUpdated(boardId: string, member: BoardMember, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit(
      'member:updated' satisfies typeof SOCKET_EVENTS.MEMBER_UPDATED,
      { member, userId }
    )
  })
}

export function emitMemberRemoved(boardId: string, memberId: string, userId: string): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit(
      'member:removed' satisfies typeof SOCKET_EVENTS.MEMBER_REMOVED,
      { boardId, memberId, userId }
    )
  })
}

// Active users events
export function emitActiveUsers(boardId: string, users: SocketUser[]): void {
  withSocketServer((io) => {
    io.to(getBoardRoom(boardId)).emit('users:active' satisfies typeof SOCKET_EVENTS.USERS_ACTIVE, {
      boardId,
      users,
    })
  })
}
