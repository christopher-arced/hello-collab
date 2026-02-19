import type { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { RegisterInput, LoginInput } from '@hello/validation'
import type { ApiResponse, User } from '@hello/types'
import {
  createUser,
  generateTokens,
  findUserByEmail,
  findUserById,
  verifyPassword,
  updateUserAvatar,
} from '../services/auth.service'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // 'lax' allows cross-origin requests for multi-domain deployments
  path: '/',
}

const COOKIE_OPTIONS = {
  ...COOKIE_BASE,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body as RegisterInput

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      } satisfies ApiResponse)
    }

    const user = await createUser({ email, password, name })
    const { accessToken } = generateTokens(user.id)

    res.cookie('accessToken', accessToken, COOKIE_OPTIONS)

    return res.status(201).json({
      success: true,
      data: { user },
    } satisfies ApiResponse<{ user: Omit<User, 'passwordHash'> }>)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      } satisfies ApiResponse)
    }

    console.error('Registration error:', error)
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
    } satisfies ApiResponse)
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as LoginInput

    const user = await findUserByEmail(email)

    // Always run password verification to prevent timing attacks
    const DUMMY_HASH = '$2b$10$dummyhashtopreventtimingattacks000000000000000'
    const isValidPassword = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)

    if (!user || !isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      } satisfies ApiResponse)
    }

    const { accessToken } = generateTokens(user.id)

    res.cookie('accessToken', accessToken, COOKIE_OPTIONS)

    const userResponse: Omit<User, 'passwordHash'> = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return res.status(200).json({
      success: true,
      data: { user: userResponse },
    } satisfies ApiResponse<{ user: Omit<User, 'passwordHash'> }>)
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      error: 'Login failed',
    } satisfies ApiResponse)
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('accessToken', COOKIE_BASE)

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  } satisfies ApiResponse)
}

export function getCurrentUser(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    data: req.user,
  } satisfies ApiResponse<Omit<User, 'passwordHash'>>)
}

function deleteAvatarFile(avatarUrl: string) {
  try {
    const filePath = path.join(__dirname, '..', '..', avatarUrl)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch {
    // Non-critical — log but don't fail the request
    console.error('Failed to delete old avatar file:', avatarUrl)
  }
}

export async function uploadAvatar(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      } satisfies ApiResponse)
    }

    const userId = req.user!.id
    const currentUser = await findUserById(userId)

    if (currentUser?.avatarUrl) {
      deleteAvatarFile(currentUser.avatarUrl)
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`
    const user = await updateUserAvatar(userId, avatarUrl)

    return res.status(200).json({
      success: true,
      data: { user },
    } satisfies ApiResponse<{ user: Omit<User, 'passwordHash'> }>)
  } catch (error) {
    console.error('Avatar upload error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to upload avatar',
    } satisfies ApiResponse)
  }
}

export async function removeAvatar(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const currentUser = await findUserById(userId)

    if (currentUser?.avatarUrl) {
      deleteAvatarFile(currentUser.avatarUrl)
    }

    const user = await updateUserAvatar(userId, null)

    return res.status(200).json({
      success: true,
      data: { user },
    } satisfies ApiResponse<{ user: Omit<User, 'passwordHash'> }>)
  } catch (error) {
    console.error('Avatar removal error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to remove avatar',
    } satisfies ApiResponse)
  }
}
