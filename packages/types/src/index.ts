// User Types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

/** User type safe for API responses (same as User since passwordHash is excluded from this type) */
export type UserWithoutPassword = User

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

// Error Types
export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: unknown
}

// Re-export socket event types
export * from './socket-events'
