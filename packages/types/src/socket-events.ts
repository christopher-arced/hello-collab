import type { Board, List, Card, BoardMember, SocketUser } from './index'

// Socket Event Names
export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_BOARD: 'join-board',
  LEAVE_BOARD: 'leave-board',

  // Server -> Client: Board events
  BOARD_UPDATED: 'board:updated',
  BOARD_DELETED: 'board:deleted',

  // Server -> Client: List events
  LIST_CREATED: 'list:created',
  LIST_UPDATED: 'list:updated',
  LIST_DELETED: 'list:deleted',
  LIST_REORDERED: 'list:reordered',

  // Server -> Client: Card events
  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_DELETED: 'card:deleted',
  CARD_MOVED: 'card:moved',
  CARD_REORDERED: 'card:reordered',

  // Server -> Client: Member events
  MEMBER_ADDED: 'member:added',
  MEMBER_UPDATED: 'member:updated',
  MEMBER_REMOVED: 'member:removed',

  // Server -> Client: Presence events
  USERS_ACTIVE: 'users:active',

  // Server -> Client: Error
  ERROR: 'error',
} as const

export type SocketEventName = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS]

// Client -> Server Event Payloads
export interface JoinBoardPayload {
  boardId: string
}

export interface LeaveBoardPayload {
  boardId: string
}

// Server -> Client Event Payloads (all include userId for tracking who made the change)
export interface BoardUpdatedEvent {
  board: Board
  userId: string
}

export interface BoardDeletedEvent {
  boardId: string
  userId: string
}

export interface ListCreatedEvent {
  list: List
  userId: string
}

export interface ListUpdatedEvent {
  list: List
  userId: string
}

export interface ListDeletedEvent {
  listId: string
  boardId: string
  userId: string
}

export interface ListReorderedEvent {
  boardId: string
  lists: List[]
  userId: string
}

export interface CardCreatedEvent {
  card: Card
  userId: string
}

export interface CardUpdatedEvent {
  card: Card
  userId: string
}

export interface CardDeletedEvent {
  cardId: string
  listId: string
  boardId: string
  userId: string
}

export interface CardMovedEvent {
  card: Card
  fromListId: string
  userId: string
}

export interface CardReorderedEvent {
  listId: string
  cards: Card[]
  userId: string
}

export interface MemberAddedEvent {
  member: BoardMember
  userId: string
}

export interface MemberUpdatedEvent {
  member: BoardMember
  userId: string
}

export interface MemberRemovedEvent {
  boardId: string
  memberId: string
  userId: string
}

export interface ActiveUsersChangedEvent {
  boardId: string
  users: SocketUser[]
}

export interface SocketErrorEvent {
  message: string
}

// Type-safe event map for Socket.io
export interface ServerToClientEvents {
  [SOCKET_EVENTS.BOARD_UPDATED]: (data: BoardUpdatedEvent) => void
  [SOCKET_EVENTS.BOARD_DELETED]: (data: BoardDeletedEvent) => void
  [SOCKET_EVENTS.LIST_CREATED]: (data: ListCreatedEvent) => void
  [SOCKET_EVENTS.LIST_UPDATED]: (data: ListUpdatedEvent) => void
  [SOCKET_EVENTS.LIST_DELETED]: (data: ListDeletedEvent) => void
  [SOCKET_EVENTS.LIST_REORDERED]: (data: ListReorderedEvent) => void
  [SOCKET_EVENTS.CARD_CREATED]: (data: CardCreatedEvent) => void
  [SOCKET_EVENTS.CARD_UPDATED]: (data: CardUpdatedEvent) => void
  [SOCKET_EVENTS.CARD_DELETED]: (data: CardDeletedEvent) => void
  [SOCKET_EVENTS.CARD_MOVED]: (data: CardMovedEvent) => void
  [SOCKET_EVENTS.CARD_REORDERED]: (data: CardReorderedEvent) => void
  [SOCKET_EVENTS.MEMBER_ADDED]: (data: MemberAddedEvent) => void
  [SOCKET_EVENTS.MEMBER_UPDATED]: (data: MemberUpdatedEvent) => void
  [SOCKET_EVENTS.MEMBER_REMOVED]: (data: MemberRemovedEvent) => void
  [SOCKET_EVENTS.USERS_ACTIVE]: (data: ActiveUsersChangedEvent) => void
  [SOCKET_EVENTS.ERROR]: (data: SocketErrorEvent) => void
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.JOIN_BOARD]: (data: JoinBoardPayload) => void
  [SOCKET_EVENTS.LEAVE_BOARD]: (data: LeaveBoardPayload) => void
}
