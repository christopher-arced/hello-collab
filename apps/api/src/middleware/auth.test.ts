import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { authMiddleware } from './auth'
import * as authService from '../services/auth.service'

vi.mock('../services/auth.service')

const mockResponse = () => {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.clearCookie = vi.fn().mockReturnValue(res)
  return res
}

const mockRequest = (cookies: Record<string, string> = {}) => {
  return { cookies } as Request
}

describe('authMiddleware', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    vi.clearAllMocks()
    res = mockResponse()
    next = vi.fn()
  })

  it('returns 401 when no token is provided', async () => {
    req = mockRequest({})

    await authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Not authenticated',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 and clears cookie when token is invalid', async () => {
    req = mockRequest({ accessToken: 'invalid-token' })

    vi.mocked(authService.verifyToken).mockReturnValue({
      valid: false,
      expired: false,
    })

    await authMiddleware(req, res, next)

    expect(res.clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object))
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 and clears cookie when token is expired', async () => {
    req = mockRequest({ accessToken: 'expired-token' })

    vi.mocked(authService.verifyToken).mockReturnValue({
      valid: false,
      expired: true,
    })

    await authMiddleware(req, res, next)

    expect(res.clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object))
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 and clears cookie when user is not found', async () => {
    req = mockRequest({ accessToken: 'valid-token' })

    vi.mocked(authService.verifyToken).mockReturnValue({
      valid: true,
      userId: 'non-existent-user',
    })
    vi.mocked(authService.findUserById).mockResolvedValue(null)

    await authMiddleware(req, res, next)

    expect(res.clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object))
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'User not found',
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('sets req.user and calls next when token is valid and user exists', async () => {
    req = mockRequest({ accessToken: 'valid-token' })

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(authService.verifyToken).mockReturnValue({
      valid: true,
      userId: 'user-123',
    })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)

    await authMiddleware(req, res, next)

    expect(req.user).toEqual(mockUser)
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
