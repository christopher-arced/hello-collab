import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Request, NextFunction } from 'express'
import request from 'supertest'
import { createApp } from '../app'
import * as authService from '../services/auth.service'
import { avatarUpload } from '../middleware/upload'

vi.mock('../services/auth.service')
vi.mock('@hello/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))
vi.mock('../middleware/upload', () => ({
  avatarUpload: vi.fn((_req: unknown, _res: unknown, next: () => void) => next()),
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null as string | null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

function authenticateAs(user = mockUser) {
  vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: user.id })
  vi.mocked(authService.findUserById).mockResolvedValue(user)
}

function mockMulterFile(filename: string) {
  vi.mocked(avatarUpload).mockImplementation((req: unknown, _res: unknown, next: unknown) => {
    ;(req as Request).file = {
      filename,
      originalname: 'photo.png',
      mimetype: 'image/png',
      size: 1024,
      fieldname: 'avatar',
      encoding: '7bit',
      destination: '',
      path: '',
      buffer: Buffer.alloc(0),
      stream: null as never,
    }
    ;(next as NextFunction)()
  })
}

describe('POST /api/auth/avatar', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    // Default: multer mock passes through without setting req.file
    vi.mocked(avatarUpload).mockImplementation((_req: unknown, _res: unknown, next: unknown) =>
      (next as NextFunction)()
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).post('/api/auth/avatar')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      success: false,
      error: 'Not authenticated',
    })
  })

  it('should return 400 when no file is uploaded', async () => {
    authenticateAs()

    const response = await request(app)
      .post('/api/auth/avatar')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      success: false,
      error: 'No file uploaded',
    })
  })

  it('should upload avatar and return updated user', async () => {
    authenticateAs()
    mockMulterFile('user-123-12345.png')

    const updatedUser = { ...mockUser, avatarUrl: '/uploads/avatars/user-123-12345.png' }
    vi.mocked(authService.updateUserAvatar).mockResolvedValue(updatedUser)

    const response = await request(app)
      .post('/api/auth/avatar')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user).toEqual(
      expect.objectContaining({
        id: 'user-123',
        avatarUrl: '/uploads/avatars/user-123-12345.png',
      })
    )
    expect(authService.updateUserAvatar).toHaveBeenCalledWith(
      'user-123',
      '/uploads/avatars/user-123-12345.png'
    )
  })

  it('should replace existing avatar when user already has one', async () => {
    const userWithAvatar = { ...mockUser, avatarUrl: '/uploads/avatars/old-avatar.png' }
    authenticateAs(userWithAvatar)
    mockMulterFile('user-123-99999.png')

    const updatedUser = { ...mockUser, avatarUrl: '/uploads/avatars/user-123-99999.png' }
    vi.mocked(authService.updateUserAvatar).mockResolvedValue(updatedUser)

    const response = await request(app)
      .post('/api/auth/avatar')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(authService.updateUserAvatar).toHaveBeenCalledWith(
      'user-123',
      '/uploads/avatars/user-123-99999.png'
    )
  })

  it('should return 500 when service throws', async () => {
    authenticateAs()
    mockMulterFile('user-123-12345.png')
    vi.mocked(authService.updateUserAvatar).mockRejectedValue(new Error('DB error'))

    const response = await request(app)
      .post('/api/auth/avatar')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      success: false,
      error: 'Failed to upload avatar',
    })
  })
})

describe('DELETE /api/auth/avatar', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).delete('/api/auth/avatar')

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      success: false,
      error: 'Not authenticated',
    })
  })

  it('should remove avatar and return updated user', async () => {
    const userWithAvatar = { ...mockUser, avatarUrl: '/uploads/avatars/user-123-12345.png' }
    authenticateAs(userWithAvatar)

    const updatedUser = { ...mockUser, avatarUrl: null }
    vi.mocked(authService.updateUserAvatar).mockResolvedValue(updatedUser)

    const response = await request(app)
      .delete('/api/auth/avatar')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.user).toEqual(
      expect.objectContaining({
        id: 'user-123',
        avatarUrl: null,
      })
    )
    expect(authService.updateUserAvatar).toHaveBeenCalledWith('user-123', null)
  })

  it('should succeed when user has no existing avatar', async () => {
    authenticateAs()

    const updatedUser = { ...mockUser, avatarUrl: null }
    vi.mocked(authService.updateUserAvatar).mockResolvedValue(updatedUser)

    const response = await request(app)
      .delete('/api/auth/avatar')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(authService.updateUserAvatar).toHaveBeenCalledWith('user-123', null)
  })

  it('should return 500 when service throws', async () => {
    authenticateAs()
    vi.mocked(authService.updateUserAvatar).mockRejectedValue(new Error('DB error'))

    const response = await request(app)
      .delete('/api/auth/avatar')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(500)
    expect(response.body).toEqual({
      success: false,
      error: 'Failed to remove avatar',
    })
  })
})
