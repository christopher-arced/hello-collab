import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { Role } from '@hello/types'
import { createApp } from '../app'
import * as boardMembersService from '../services/boardMembers.service'
import * as authService from '../services/auth.service'

vi.mock('../services/boardMembers.service')
vi.mock('../services/auth.service')
vi.mock('@hello/database', () => ({
  prisma: {
    board: { findUnique: vi.fn() },
    boardMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
}))

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockMember = {
  id: 'member-123',
  boardId: 'board-123',
  userId: 'user-456',
  role: Role.EDITOR,
  joinedAt: new Date(),
  user: {
    id: 'user-456',
    email: 'member@example.com',
    name: 'Member User',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

const mockMember2 = {
  id: 'member-456',
  boardId: 'board-123',
  userId: 'user-789',
  role: Role.VIEWER,
  joinedAt: new Date(),
  user: {
    id: 'user-789',
    email: 'viewer@example.com',
    name: 'Viewer User',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

describe('GET /api/boards/:id/members', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 200 with list of members', async () => {
    vi.mocked(boardMembersService.getBoardMembers).mockResolvedValue([mockMember, mockMember2])

    const response = await request(app)
      .get('/api/boards/board-123/members')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({ id: 'member-123', role: 'EDITOR' }),
        expect.objectContaining({ id: 'member-456', role: 'VIEWER' }),
      ]),
    })
  })

  it('should return empty array when board has no members', async () => {
    vi.mocked(boardMembersService.getBoardMembers).mockResolvedValue([])

    const response = await request(app)
      .get('/api/boards/board-123/members')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: [],
    })
  })

  it('should return 404 when board not found or access denied', async () => {
    vi.mocked(boardMembersService.getBoardMembers).mockResolvedValue(null)

    const response = await request(app)
      .get('/api/boards/nonexistent/members')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Board not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/api/boards/board-123/members')

    expect(response.status).toBe(401)
  })
})

describe('POST /api/boards/:id/members', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('with valid data', () => {
    it('should add member and return 201', async () => {
      vi.mocked(boardMembersService.addBoardMember).mockResolvedValue({
        member: mockMember,
        boardId: 'board-123',
      })

      const response = await request(app)
        .post('/api/boards/board-123/members')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 'member-123',
          role: 'EDITOR',
        }),
      })
    })

    it('should add member with specified role', async () => {
      vi.mocked(boardMembersService.addBoardMember).mockResolvedValue({
        member: { ...mockMember, role: Role.VIEWER },
        boardId: 'board-123',
      })

      const response = await request(app)
        .post('/api/boards/board-123/members')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ email: 'member@example.com', role: 'VIEWER' })

      expect(response.status).toBe(201)
      expect(boardMembersService.addBoardMember).toHaveBeenCalledWith('board-123', 'user-123', {
        email: 'member@example.com',
        role: 'VIEWER',
      })
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/boards/board-123/members')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('email')
    })

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/boards/board-123/members')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ email: 'not-an-email' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('email')
    })

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/api/boards/board-123/members')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ email: 'test@example.com', role: 'INVALID' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('role')
    })

    it('should return 400 when trying to add with OWNER role', async () => {
      const response = await request(app)
        .post('/api/boards/board-123/members')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ email: 'test@example.com', role: 'OWNER' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('role')
    })
  })

  it('should return 404 when user not found', async () => {
    vi.mocked(boardMembersService.addBoardMember).mockResolvedValue({
      error: 'User with this email not found',
    })

    const response = await request(app)
      .post('/api/boards/board-123/members')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ email: 'nonexistent@example.com' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'User with this email not found',
    })
  })

  it('should return 403 when user already a member', async () => {
    vi.mocked(boardMembersService.addBoardMember).mockResolvedValue({
      error: 'User is already a member of this board',
    })

    const response = await request(app)
      .post('/api/boards/board-123/members')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ email: 'existing@example.com' })

    expect(response.status).toBe(403)
    expect(response.body).toEqual({
      success: false,
      error: 'User is already a member of this board',
    })
  })

  it('should return 403 when lacking permission', async () => {
    vi.mocked(boardMembersService.addBoardMember).mockResolvedValue({
      error: 'Only owners and editors can add members',
    })

    const response = await request(app)
      .post('/api/boards/board-123/members')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ email: 'test@example.com' })

    expect(response.status).toBe(403)
    expect(response.body).toEqual({
      success: false,
      error: 'Only owners and editors can add members',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post('/api/boards/board-123/members')
      .send({ email: 'test@example.com' })

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/boards/:id/members/:userId', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('with valid data', () => {
    it('should update role and return 200', async () => {
      const updatedMember = { ...mockMember, role: Role.VIEWER }
      vi.mocked(boardMembersService.updateMemberRole).mockResolvedValue({
        member: updatedMember,
        boardId: 'board-123',
      })

      const response = await request(app)
        .patch('/api/boards/board-123/members/user-456')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ role: 'VIEWER' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 'member-123',
          role: 'VIEWER',
        }),
      })
    })

    it('should call service with correct parameters', async () => {
      vi.mocked(boardMembersService.updateMemberRole).mockResolvedValue({
        member: mockMember,
        boardId: 'board-123',
      })

      await request(app)
        .patch('/api/boards/board-123/members/user-456')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ role: 'EDITOR' })

      expect(boardMembersService.updateMemberRole).toHaveBeenCalledWith(
        'board-123',
        'user-123',
        'user-456',
        { role: 'EDITOR' }
      )
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for missing role', async () => {
      const response = await request(app)
        .patch('/api/boards/board-123/members/user-456')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('role')
    })

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .patch('/api/boards/board-123/members/user-456')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ role: 'SUPERADMIN' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('role')
    })
  })

  it('should return 403 when not owner', async () => {
    vi.mocked(boardMembersService.updateMemberRole).mockResolvedValue({
      error: 'Only board owners can change member roles',
    })

    const response = await request(app)
      .patch('/api/boards/board-123/members/user-456')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ role: 'VIEWER' })

    expect(response.status).toBe(403)
    expect(response.body).toEqual({
      success: false,
      error: 'Only board owners can change member roles',
    })
  })

  it('should return 403 when trying to demote board owner', async () => {
    vi.mocked(boardMembersService.updateMemberRole).mockResolvedValue({
      error: 'Cannot demote the board owner. Transfer ownership first.',
    })

    const response = await request(app)
      .patch('/api/boards/board-123/members/owner-123')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ role: 'VIEWER' })

    expect(response.status).toBe(403)
    expect(response.body).toEqual({
      success: false,
      error: 'Cannot demote the board owner. Transfer ownership first.',
    })
  })

  it('should return 404 when member not found', async () => {
    vi.mocked(boardMembersService.updateMemberRole).mockResolvedValue({
      error: 'Member not found',
    })

    const response = await request(app)
      .patch('/api/boards/board-123/members/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ role: 'VIEWER' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Member not found',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .patch('/api/boards/board-123/members/user-456')
      .send({ role: 'VIEWER' })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/boards/:id/members/:userId', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.JWT_SECRET = 'test-secret'
    vi.mocked(authService.verifyToken).mockReturnValue({ valid: true, userId: 'user-123' })
    vi.mocked(authService.findUserById).mockResolvedValue(mockUser)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should remove member and return 200', async () => {
    vi.mocked(boardMembersService.removeBoardMember).mockResolvedValue({
      removed: true,
      boardId: 'board-123',
      userId: 'user-456',
    })

    const response = await request(app)
      .delete('/api/boards/board-123/members/user-456')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: null,
    })
  })

  it('should call service with correct parameters', async () => {
    vi.mocked(boardMembersService.removeBoardMember).mockResolvedValue({
      removed: true,
      boardId: 'board-123',
      userId: 'user-456',
    })

    await request(app)
      .delete('/api/boards/board-123/members/user-456')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(boardMembersService.removeBoardMember).toHaveBeenCalledWith(
      'board-123',
      'user-123',
      'user-456'
    )
  })

  it('should return 403 when trying to remove board owner', async () => {
    vi.mocked(boardMembersService.removeBoardMember).mockResolvedValue({
      error: 'Cannot remove the board owner',
    })

    const response = await request(app)
      .delete('/api/boards/board-123/members/owner-123')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(403)
    expect(response.body).toEqual({
      success: false,
      error: 'Cannot remove the board owner',
    })
  })

  it('should return 403 when lacking permission', async () => {
    vi.mocked(boardMembersService.removeBoardMember).mockResolvedValue({
      error: 'You do not have permission to remove this member',
    })

    const response = await request(app)
      .delete('/api/boards/board-123/members/other-user')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(403)
    expect(response.body).toEqual({
      success: false,
      error: 'You do not have permission to remove this member',
    })
  })

  it('should return 404 when member not found', async () => {
    vi.mocked(boardMembersService.removeBoardMember).mockResolvedValue({
      error: 'Member not found',
    })

    const response = await request(app)
      .delete('/api/boards/board-123/members/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Member not found',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).delete('/api/boards/board-123/members/user-456')

    expect(response.status).toBe(401)
  })

  it('should allow user to remove themselves', async () => {
    vi.mocked(boardMembersService.removeBoardMember).mockResolvedValue({
      removed: true,
      boardId: 'board-123',
      userId: 'user-123',
    })

    const response = await request(app)
      .delete('/api/boards/board-123/members/user-123')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(boardMembersService.removeBoardMember).toHaveBeenCalledWith(
      'board-123',
      'user-123',
      'user-123'
    )
  })
})
