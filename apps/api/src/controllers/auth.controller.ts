import type { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { registerSchema } from '@hello/validation'
import type { ApiResponse, AuthResponse } from '@hello/types'
import { createUser, generateTokens, findUserByEmail } from '../services/auth.service'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
}

export async function register(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const { email, password, name } = result.data

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      } satisfies ApiResponse)
    }

    const user = await createUser({ email, password, name })
    const tokens = generateTokens(user.id)

    // Set HTTP-only cookie for secure token storage
    res.cookie('accessToken', tokens.accessToken, COOKIE_OPTIONS)

    return res.status(201).json({
      success: true,
      data: { user, tokens },
    } satisfies ApiResponse<AuthResponse>)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      } satisfies ApiResponse)
    }

    return res.status(500).json({
      success: false,
      error: 'Registration failed',
    } satisfies ApiResponse)
  }
}
