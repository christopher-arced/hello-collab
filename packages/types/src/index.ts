// User Types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

// Board Types
export enum Role {
  OWNER = 'OWNER',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export interface Board {
  id: string
  title: string
  description: string | null
  bgColor: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
  lists?: List[]
  members?: BoardMember[]
}

export interface BoardMember {
  id: string
  boardId: string
  userId: string
  role: Role
  joinedAt: Date
  user?: User
}

// List Types
export interface List {
  id: string
  title: string
  boardId: string
  position: number
  createdAt: Date
  updatedAt: Date
  cards?: Card[]
}

// Card Types
export interface Card {
  id: string
  title: string
  description: string | null
  listId: string
  position: number
  dueDate: Date | null
  coverUrl: string | null
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Auth Types
export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
}

// WebSocket Event Types
export interface SocketUser {
  id: string
  name: string
  avatarUrl: string | null
}

// Board Events
export interface BoardUpdateEvent {
  boardId: string
  updates: Partial<Board>
}

export interface BoardDeleteEvent {
  boardId: string
}

// List Events
export interface ListCreateEvent {
  boardId: string
  list: List
}

export interface ListUpdateEvent {
  listId: string
  updates: Partial<List>
}

export interface ListDeleteEvent {
  listId: string
}

export interface ListReorderEvent {
  boardId: string
  listIds: string[]
}

// Card Events
export interface CardCreateEvent {
  listId: string
  card: Card
}

export interface CardUpdateEvent {
  cardId: string
  updates: Partial<Card>
}

export interface CardDeleteEvent {
  cardId: string
}

export interface CardMoveEvent {
  cardId: string
  fromListId: string
  toListId: string
  position: number
}

export interface CardReorderEvent {
  listId: string
  cardIds: string[]
}

// Presence Events
export interface UserTypingEvent {
  cardId: string
  userId: string
}

export interface UserEditingEvent {
  cardId: string
  userId: string
}

export interface ActiveUsersEvent {
  boardId: string
  users: SocketUser[]
}

// Socket Event Payloads (with userId from server)
export interface ServerBoardEvent {
  board: Board
  userId: string
}

export interface ServerListEvent {
  list: List
  userId: string
}

export interface ServerCardEvent {
  card: Card
  userId: string
}

// Error Types
export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: unknown
}

// Re-export socket event types
export * from './socket-events'
