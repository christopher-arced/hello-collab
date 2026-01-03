// Shared configuration constants

export const APP_CONFIG = {
  APP_NAME: 'HelloCollab',
  APP_DESCRIPTION: 'Real-time collaborative task management',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d',
} as const

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BOARD_TITLE_MAX_LENGTH: 100,
  BOARD_DESCRIPTION_MAX_LENGTH: 500,
  CARD_TITLE_MAX_LENGTH: 200,
  CARD_DESCRIPTION_MAX_LENGTH: 5000,
} as const

export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_BOARD: 'join-board',
  LEAVE_BOARD: 'leave-board',

  BOARD_UPDATE: 'board:update',
  BOARD_DELETE: 'board:delete',

  LIST_CREATE: 'list:create',
  LIST_UPDATE: 'list:update',
  LIST_DELETE: 'list:delete',
  LIST_REORDER: 'list:reorder',

  CARD_CREATE: 'card:create',
  CARD_UPDATE: 'card:update',
  CARD_DELETE: 'card:delete',
  CARD_MOVE: 'card:move',
  CARD_REORDER: 'card:reorder',

  USER_TYPING: 'user:typing',
  USER_EDITING: 'user:editing',

  // Server -> Client
  BOARD_UPDATED: 'board:updated',
  BOARD_DELETED: 'board:deleted',

  LIST_CREATED: 'list:created',
  LIST_UPDATED: 'list:updated',
  LIST_DELETED: 'list:deleted',
  LIST_REORDERED: 'list:reordered',

  CARD_CREATED: 'card:created',
  CARD_UPDATED: 'card:updated',
  CARD_DELETED: 'card:deleted',
  CARD_MOVED: 'card:moved',
  CARD_REORDERED: 'card:reordered',

  USERS_ACTIVE: 'users:active',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',

  ERROR: 'error',
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const
