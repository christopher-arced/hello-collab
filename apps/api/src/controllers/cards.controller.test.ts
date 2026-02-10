import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import * as cardsService from '../services/cards.service'
import * as authService from '../services/auth.service'

vi.mock('../services/cards.service')
vi.mock('../services/auth.service')
vi.mock('@hello/database', () => ({
  prisma: {
    card: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
    list: {
      findUnique: vi.fn(),
    },
    board: {
      findFirst: vi.fn(),
    },
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

const mockCard = {
  id: 'card-123',
  title: 'Test Card',
  description: null,
  listId: 'list-123',
  position: 0,
  dueDate: null,
  coverUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockCard2 = {
  id: 'card-456',
  title: 'Another Card',
  description: 'Some description',
  listId: 'list-123',
  position: 1,
  dueDate: null,
  coverUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('GET /api/lists/:listId/cards', () => {
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

  it('should return 200 with list of cards', async () => {
    vi.mocked(cardsService.getCardsByList).mockResolvedValue([mockCard, mockCard2])

    const response = await request(app)
      .get('/api/lists/list-123/cards')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({ id: 'card-123', title: 'Test Card' }),
        expect.objectContaining({ id: 'card-456', title: 'Another Card' }),
      ]),
    })
  })

  it('should return empty array when list has no cards', async () => {
    vi.mocked(cardsService.getCardsByList).mockResolvedValue([])

    const response = await request(app)
      .get('/api/lists/list-123/cards')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: [],
    })
  })

  it('should return 404 when list not found or access denied', async () => {
    vi.mocked(cardsService.getCardsByList).mockResolvedValue(null)

    const response = await request(app)
      .get('/api/lists/nonexistent/cards')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'List not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).get('/api/lists/list-123/cards')

    expect(response.status).toBe(401)
  })
})

describe('POST /api/lists/:listId/cards', () => {
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
    it('should create a card and return 201', async () => {
      vi.mocked(cardsService.createCard).mockResolvedValue({ card: mockCard, boardId: 'board-123' })

      const response = await request(app)
        .post('/api/lists/list-123/cards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Test Card' })

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 'card-123',
          title: 'Test Card',
        }),
      })
    })

    it('should create a card with description', async () => {
      const cardWithDescription = { ...mockCard, description: 'A description' }
      vi.mocked(cardsService.createCard).mockResolvedValue({
        card: cardWithDescription,
        boardId: 'board-123',
      })

      const response = await request(app)
        .post('/api/lists/list-123/cards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Test Card', description: 'A description' })

      expect(response.status).toBe(201)
      expect(cardsService.createCard).toHaveBeenCalledWith('list-123', 'user-123', {
        title: 'Test Card',
        description: 'A description',
      })
    })

    it('should create a card with position', async () => {
      vi.mocked(cardsService.createCard).mockResolvedValue({
        card: { ...mockCard, position: 5 },
        boardId: 'board-123',
      })

      const response = await request(app)
        .post('/api/lists/list-123/cards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Test Card', position: 5 })

      expect(response.status).toBe(201)
      expect(cardsService.createCard).toHaveBeenCalledWith('list-123', 'user-123', {
        title: 'Test Card',
        position: 5,
      })
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/lists/list-123/cards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed',
      })
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/lists/list-123/cards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: '' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for title exceeding max length', async () => {
      const response = await request(app)
        .post('/api/lists/list-123/cards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'a'.repeat(513) })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for negative position', async () => {
      const response = await request(app)
        .post('/api/lists/list-123/cards')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Test Card', position: -1 })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('position')
    })
  })

  it('should return 404 when list not found or access denied', async () => {
    vi.mocked(cardsService.createCard).mockResolvedValue(null)

    const response = await request(app)
      .post('/api/lists/nonexistent/cards')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ title: 'Test Card' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'List not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post('/api/lists/list-123/cards')
      .send({ title: 'Test Card' })

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/cards/:id', () => {
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
    it('should update card title and return 200', async () => {
      const updatedCard = { ...mockCard, title: 'Updated Title' }
      vi.mocked(cardsService.updateCard).mockResolvedValue({
        card: updatedCard,
        boardId: 'board-123',
      })

      const response = await request(app)
        .patch('/api/cards/card-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'Updated Title' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({ title: 'Updated Title' }),
      })
    })

    it('should update card description', async () => {
      const updatedCard = { ...mockCard, description: 'New description' }
      vi.mocked(cardsService.updateCard).mockResolvedValue({
        card: updatedCard,
        boardId: 'board-123',
      })

      const response = await request(app)
        .patch('/api/cards/card-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ description: 'New description' })

      expect(response.status).toBe(200)
      expect(response.body.data.description).toBe('New description')
    })

    it('should update card dueDate', async () => {
      const dueDate = '2025-12-31T00:00:00.000Z'
      const updatedCard = { ...mockCard, dueDate: new Date(dueDate) }
      vi.mocked(cardsService.updateCard).mockResolvedValue({
        card: updatedCard,
        boardId: 'board-123',
      })

      const response = await request(app)
        .patch('/api/cards/card-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ dueDate })

      expect(response.status).toBe(200)
    })

    it('should allow setting description to null', async () => {
      const updatedCard = { ...mockCard, description: null }
      vi.mocked(cardsService.updateCard).mockResolvedValue({
        card: updatedCard,
        boardId: 'board-123',
      })

      const response = await request(app)
        .patch('/api/cards/card-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ description: null })

      expect(response.status).toBe(200)
      expect(cardsService.updateCard).toHaveBeenCalledWith('card-123', 'user-123', {
        description: null,
      })
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .patch('/api/cards/card-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: '' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for title exceeding max length', async () => {
      const response = await request(app)
        .patch('/api/cards/card-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ title: 'a'.repeat(513) })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('title')
    })

    it('should return 400 for invalid dueDate format', async () => {
      const response = await request(app)
        .patch('/api/cards/card-123')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ dueDate: 'not-a-date' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('dueDate')
    })
  })

  it('should return 404 when card not found or access denied', async () => {
    vi.mocked(cardsService.updateCard).mockResolvedValue(null)

    const response = await request(app)
      .patch('/api/cards/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ title: 'Updated' })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Card not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).patch('/api/cards/card-123').send({ title: 'Updated' })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/cards/:id', () => {
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

  it('should delete card and return 200', async () => {
    vi.mocked(cardsService.deleteCard).mockResolvedValue({
      deleted: true,
      listId: 'list-123',
      boardId: 'board-123',
    })

    const response = await request(app)
      .delete('/api/cards/card-123')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: null,
    })
  })

  it('should return 404 when card not found or access denied', async () => {
    vi.mocked(cardsService.deleteCard).mockResolvedValue({
      deleted: false,
      listId: null,
      boardId: null,
    })

    const response = await request(app)
      .delete('/api/cards/nonexistent')
      .set('Cookie', 'accessToken=valid.jwt.token')

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Card not found or access denied',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app).delete('/api/cards/card-123')

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/cards/:id/move', () => {
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

  it('should move card to different list and return 200', async () => {
    const movedCard = { ...mockCard, listId: 'list-456', position: 2 }
    vi.mocked(cardsService.moveCard).mockResolvedValue({
      card: movedCard,
      fromListId: 'list-123',
      boardId: 'board-123',
    })

    const response = await request(app)
      .patch('/api/cards/card-123/move')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ toListId: 'list-456', position: 2 })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: expect.objectContaining({ listId: 'list-456', position: 2 }),
    })
  })

  describe('with invalid data', () => {
    it('should return 400 for missing toListId', async () => {
      const response = await request(app)
        .patch('/api/cards/card-123/move')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ position: 0 })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('toListId')
    })

    it('should return 400 for missing position', async () => {
      const response = await request(app)
        .patch('/api/cards/card-123/move')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ toListId: 'list-456' })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('position')
    })

    it('should return 400 for negative position', async () => {
      const response = await request(app)
        .patch('/api/cards/card-123/move')
        .set('Cookie', 'accessToken=valid.jwt.token')
        .send({ toListId: 'list-456', position: -1 })

      expect(response.status).toBe(400)
      expect(response.body.details).toHaveProperty('position')
    })
  })

  it('should return 404 when card not found, access denied, or target list invalid', async () => {
    vi.mocked(cardsService.moveCard).mockResolvedValue(null)

    const response = await request(app)
      .patch('/api/cards/card-123/move')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ toListId: 'invalid-list', position: 0 })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'Card not found, access denied, or target list invalid',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .patch('/api/cards/card-123/move')
      .send({ toListId: 'list-456', position: 0 })

    expect(response.status).toBe(401)
  })
})

describe('PATCH /api/lists/:listId/cards/reorder', () => {
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

  it('should reorder cards and return 200', async () => {
    const reorderedCards = [
      { ...mockCard2, position: 0 },
      { ...mockCard, position: 1 },
    ]
    vi.mocked(cardsService.reorderCards).mockResolvedValue({
      cards: reorderedCards,
      boardId: 'board-123',
    })

    const response = await request(app)
      .patch('/api/lists/list-123/cards/reorder')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ cardIds: ['card-456', 'card-123'] })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({ id: 'card-456', position: 0 }),
        expect.objectContaining({ id: 'card-123', position: 1 }),
      ]),
    })
  })

  it('should return 400 for invalid cardIds format', async () => {
    const response = await request(app)
      .patch('/api/lists/list-123/cards/reorder')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ cardIds: 'not-an-array' })

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      success: false,
      error: 'Validation failed',
    })
  })

  it('should return 400 for missing cardIds', async () => {
    const response = await request(app)
      .patch('/api/lists/list-123/cards/reorder')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({})

    expect(response.status).toBe(400)
    expect(response.body.details).toHaveProperty('cardIds')
  })

  it('should return 404 when list not found or invalid card IDs', async () => {
    vi.mocked(cardsService.reorderCards).mockResolvedValue(null)

    const response = await request(app)
      .patch('/api/lists/list-123/cards/reorder')
      .set('Cookie', 'accessToken=valid.jwt.token')
      .send({ cardIds: ['invalid-id'] })

    expect(response.status).toBe(404)
    expect(response.body).toEqual({
      success: false,
      error: 'List not found, access denied, or invalid card IDs',
    })
  })

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .patch('/api/lists/list-123/cards/reorder')
      .send({ cardIds: ['card-123'] })

    expect(response.status).toBe(401)
  })
})
