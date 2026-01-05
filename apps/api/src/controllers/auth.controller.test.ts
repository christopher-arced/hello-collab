import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import * as authService from '../services/auth.service'

vi.mock('../services/auth.service')
vi.mock('@hello/database', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

describe('POST /api/auth/register', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('with valid data', () => {
    it('should register a new user and return 201', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const mockTokens = { accessToken: 'mock.jwt.token' }

      vi.mocked(authService.findUserByEmail).mockResolvedValue(null)
      vi.mocked(authService.createUser).mockResolvedValue(mockUser)
      vi.mocked(authService.generateTokens).mockReturnValue(mockTokens)

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: {
          user: expect.objectContaining({
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
          }),
          tokens: mockTokens,
        },
      })
    })
  })

  describe('with invalid data (validation failures)', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app).post('/api/auth/register').send({
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('email')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('email')
    })

    it('should return 400 for missing password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        name: 'Test User',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('password')
    })

    it('should return 400 for short password', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('password')
    })

    it('should return 400 for missing name', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('name')
    })
  })

  describe('with duplicate email', () => {
    it('should return 409 when email already exists', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'test@example.com',
        name: 'Existing User',
        passwordHash: 'hashed',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(authService.findUserByEmail).mockResolvedValue(existingUser)

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(409)
      expect(response.body).toEqual({
        success: false,
        error: 'Email already registered',
      })
    })

    it('should return 409 on race condition (database unique constraint)', async () => {
      const { Prisma } = await import('@prisma/client')

      vi.mocked(authService.findUserByEmail).mockResolvedValue(null)
      vi.mocked(authService.createUser).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '5.0.0',
        })
      )

      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })

      expect(response.status).toBe(409)
      expect(response.body).toEqual({
        success: false,
        error: 'Email already registered',
      })
    })
  })
})
