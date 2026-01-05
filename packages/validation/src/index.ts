import { z } from 'zod'

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().optional().nullable(),
})

// Board Schemas
export const createBoardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),
  bgColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .optional(),
})

export const updateBoardSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  bgColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
})

// List Schemas
export const createListSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  position: z.number().int().nonnegative().optional(),
})

export const updateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  position: z.number().int().nonnegative().optional(),
})

export const reorderListsSchema = z.object({
  listIds: z.array(z.string()),
})

// Card Schemas
export const createCardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .nullable(),
  position: z.number().int().nonnegative().optional(),
})

export const updateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  dueDate: z.string().datetime().or(z.null()).optional(),
  coverUrl: z.string().url().optional().nullable(),
})

export const moveCardSchema = z.object({
  toListId: z.string(),
  position: z.number().int().nonnegative(),
})

export const reorderCardsSchema = z.object({
  cardIds: z.array(z.string()),
})

// Board Member Schemas (Phase 2)
export const addBoardMemberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  role: z.enum(['EDITOR', 'VIEWER']).optional(),
})

export const updateBoardMemberSchema = z.object({
  role: z.enum(['OWNER', 'EDITOR', 'VIEWER']),
})

// Common Schemas
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export type CreateBoardInput = z.infer<typeof createBoardSchema>
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>

export type CreateListInput = z.infer<typeof createListSchema>
export type UpdateListInput = z.infer<typeof updateListSchema>
export type ReorderListsInput = z.infer<typeof reorderListsSchema>

export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type MoveCardInput = z.infer<typeof moveCardSchema>
export type ReorderCardsInput = z.infer<typeof reorderCardsSchema>

export type AddBoardMemberInput = z.infer<typeof addBoardMemberSchema>
export type UpdateBoardMemberInput = z.infer<typeof updateBoardMemberSchema>

export type PaginationInput = z.infer<typeof paginationSchema>
