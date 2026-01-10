import { Request, Response, NextFunction } from 'express'
import { verifyToken, findUserById } from '../services/auth.service'

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string
      email: string
      name: string
      avatarUrl: string | null
      createdAt: Date
      updatedAt: Date
    }
  }
}

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.accessToken

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Not authenticated',
    })
    return
  }

  const result = verifyToken(token)

  if (!result.valid) {
    res.clearCookie('accessToken', COOKIE_BASE)
    if (result.expired) {
      res.status(403).json({
        success: false,
        error: 'Token expired',
      })
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      })
    }
    return
  }

  const user = await findUserById(result.userId)

  if (!user) {
    res.clearCookie('accessToken', COOKIE_BASE)
    res.status(401).json({
      success: false,
      error: 'User not found',
    })
    return
  }

  req.user = user

  return next()
}
