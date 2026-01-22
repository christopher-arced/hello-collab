import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCardsByList,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
} from './cards.service'

vi.mock('@hello/database', () => {
  const mockTx = {
    list: { findUnique: vi.fn() },
    card: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
  }
  return {
    prisma: {
      ...mockTx,
      $transaction: vi.fn((callback: (t: typeof mockTx) => Promise<unknown>) => callback(mockTx)),
    },
  }
})

// Import after mock to get the mocked version
import { prisma } from '@hello/database'

const mockUser = { id: 'user-123', email: 'test@example.com' }
const mockBoard = {
  id: 'board-123',
  ownerId: 'user-123',
  members: [],
}

const mockList = {
  id: 'list-123',
  boardId: 'board-123',
  board: mockBoard,
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

describe('cards.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('verifyListAccess (through getCardsByList)', () => {
    it('should return null when list does not exist', async () => {
      vi.mocked(prisma.list.findUnique).mockResolvedValue(null)

      const result = await getCardsByList('nonexistent-list', mockUser.id)

      expect(result).toBeNull()
    })

    it('should allow access for board owner', async () => {
      vi.mocked(prisma.list.findUnique).mockResolvedValue(mockList as never)
      vi.mocked(prisma.card.findMany).mockResolvedValue([mockCard] as never)

      const result = await getCardsByList('list-123', mockUser.id)

      expect(result).toEqual([mockCard])
    })

    it('should allow access for board member', async () => {
      const memberBoard = {
        ...mockBoard,
        ownerId: 'other-user',
        members: [{ role: 'VIEWER' }],
      }
      vi.mocked(prisma.list.findUnique).mockResolvedValue({
        ...mockList,
        board: memberBoard,
      } as never)
      vi.mocked(prisma.card.findMany).mockResolvedValue([mockCard] as never)

      const result = await getCardsByList('list-123', mockUser.id)

      expect(result).toEqual([mockCard])
    })

    it('should deny access for non-member', async () => {
      const otherBoard = {
        ...mockBoard,
        ownerId: 'other-user',
        members: [],
      }
      vi.mocked(prisma.list.findUnique).mockResolvedValue({
        ...mockList,
        board: otherBoard,
      } as never)

      const result = await getCardsByList('list-123', mockUser.id)

      expect(result).toBeNull()
    })
  })

  describe('verifyCardAccess (through updateCard)', () => {
    it('should return null when card does not exist', async () => {
      vi.mocked(prisma.card.findUnique).mockResolvedValue(null)

      const result = await updateCard('nonexistent-card', mockUser.id, { title: 'New Title' })

      expect(result).toBeNull()
    })

    it('should allow edit access for board owner', async () => {
      vi.mocked(prisma.card.findUnique).mockResolvedValue({
        listId: 'list-123',
        list: {
          boardId: 'board-123',
          board: mockBoard,
        },
      } as never)
      vi.mocked(prisma.card.update).mockResolvedValue({
        ...mockCard,
        title: 'New Title',
      } as never)

      const result = await updateCard('card-123', mockUser.id, { title: 'New Title' })

      expect(result?.title).toBe('New Title')
    })

    it('should allow edit access for EDITOR role', async () => {
      const editorBoard = {
        ...mockBoard,
        ownerId: 'other-user',
        members: [{ role: 'EDITOR' }],
      }
      vi.mocked(prisma.card.findUnique).mockResolvedValue({
        listId: 'list-123',
        list: {
          boardId: 'board-123',
          board: editorBoard,
        },
      } as never)
      vi.mocked(prisma.card.update).mockResolvedValue({
        ...mockCard,
        title: 'New Title',
      } as never)

      const result = await updateCard('card-123', mockUser.id, { title: 'New Title' })

      expect(result?.title).toBe('New Title')
    })

    it('should deny edit access for VIEWER role', async () => {
      const viewerBoard = {
        ...mockBoard,
        ownerId: 'other-user',
        members: [{ role: 'VIEWER' }],
      }
      vi.mocked(prisma.card.findUnique).mockResolvedValue({
        listId: 'list-123',
        list: {
          boardId: 'board-123',
          board: viewerBoard,
        },
      } as never)

      const result = await updateCard('card-123', mockUser.id, { title: 'New Title' })

      expect(result).toBeNull()
    })
  })

  describe('getCardsByList', () => {
    it('should return cards ordered by position', async () => {
      const cards = [
        { ...mockCard, id: 'card-1', position: 0 },
        { ...mockCard, id: 'card-2', position: 1 },
      ]
      vi.mocked(prisma.list.findUnique).mockResolvedValue(mockList as never)
      vi.mocked(prisma.card.findMany).mockResolvedValue(cards as never)

      const result = await getCardsByList('list-123', mockUser.id)

      expect(prisma.card.findMany).toHaveBeenCalledWith({
        where: { listId: 'list-123' },
        select: expect.any(Object),
        orderBy: { position: 'asc' },
      })
      expect(result).toHaveLength(2)
    })
  })

  describe('createCard', () => {
    beforeEach(() => {
      vi.mocked(prisma.list.findUnique).mockResolvedValue(mockList as never)
    })

    it('should create card with trimmed title', async () => {
      vi.mocked(prisma.card.aggregate).mockResolvedValue({ _max: { position: 2 } } as never)
      vi.mocked(prisma.card.create).mockResolvedValue(mockCard as never)

      await createCard('list-123', mockUser.id, { title: '  Test Card  ' })

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Test Card',
        }),
        select: expect.any(Object),
      })
    })

    it('should set position to max + 1 when not specified', async () => {
      vi.mocked(prisma.card.aggregate).mockResolvedValue({ _max: { position: 5 } } as never)
      vi.mocked(prisma.card.create).mockResolvedValue(mockCard as never)

      await createCard('list-123', mockUser.id, { title: 'Test' })

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          position: 6,
        }),
        select: expect.any(Object),
      })
    })

    it('should set position to 0 when list is empty', async () => {
      vi.mocked(prisma.card.aggregate).mockResolvedValue({ _max: { position: null } } as never)
      vi.mocked(prisma.card.create).mockResolvedValue(mockCard as never)

      await createCard('list-123', mockUser.id, { title: 'Test' })

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          position: 0,
        }),
        select: expect.any(Object),
      })
    })

    it('should use provided position when specified', async () => {
      vi.mocked(prisma.card.aggregate).mockResolvedValue({ _max: { position: 5 } } as never)
      vi.mocked(prisma.card.create).mockResolvedValue(mockCard as never)

      await createCard('list-123', mockUser.id, { title: 'Test', position: 3 })

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          position: 3,
        }),
        select: expect.any(Object),
      })
    })

    it('should set description to null when undefined', async () => {
      vi.mocked(prisma.card.aggregate).mockResolvedValue({ _max: { position: 0 } } as never)
      vi.mocked(prisma.card.create).mockResolvedValue(mockCard as never)

      await createCard('list-123', mockUser.id, { title: 'Test' })

      expect(prisma.card.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          description: null,
        }),
        select: expect.any(Object),
      })
    })
  })

  describe('updateCard', () => {
    beforeEach(() => {
      vi.mocked(prisma.card.findUnique).mockResolvedValue({
        listId: 'list-123',
        list: {
          boardId: 'board-123',
          board: mockBoard,
        },
      } as never)
    })

    it('should update only provided fields', async () => {
      vi.mocked(prisma.card.update).mockResolvedValue(mockCard as never)

      await updateCard('card-123', mockUser.id, { title: 'Updated' })

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-123' },
        data: { title: 'Updated' },
        select: expect.any(Object),
      })
    })

    it('should trim title and description', async () => {
      vi.mocked(prisma.card.update).mockResolvedValue(mockCard as never)

      await updateCard('card-123', mockUser.id, {
        title: '  Trimmed Title  ',
        description: '  Trimmed Description  ',
      })

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-123' },
        data: {
          title: 'Trimmed Title',
          description: 'Trimmed Description',
        },
        select: expect.any(Object),
      })
    })

    it('should convert dueDate string to Date', async () => {
      vi.mocked(prisma.card.update).mockResolvedValue(mockCard as never)

      await updateCard('card-123', mockUser.id, { dueDate: '2025-12-31T00:00:00.000Z' })

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-123' },
        data: { dueDate: expect.any(Date) },
        select: expect.any(Object),
      })
    })

    it('should set dueDate to null when empty string', async () => {
      vi.mocked(prisma.card.update).mockResolvedValue(mockCard as never)

      await updateCard('card-123', mockUser.id, { dueDate: '' })

      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-123' },
        data: { dueDate: null },
        select: expect.any(Object),
      })
    })
  })

  describe('deleteCard', () => {
    it('should return false when no access', async () => {
      vi.mocked(prisma.card.findUnique).mockResolvedValue(null)

      const result = await deleteCard('card-123', mockUser.id)

      expect(result).toBe(false)
    })

    it('should delete card and return true', async () => {
      vi.mocked(prisma.card.findUnique).mockResolvedValue({
        listId: 'list-123',
        list: {
          boardId: 'board-123',
          board: mockBoard,
        },
      } as never)
      vi.mocked(prisma.card.delete).mockResolvedValue(mockCard as never)

      const result = await deleteCard('card-123', mockUser.id)

      expect(prisma.card.delete).toHaveBeenCalledWith({
        where: { id: 'card-123' },
      })
      expect(result).toBe(true)
    })
  })

  describe('moveCard', () => {
    const mockCardWithAccess = {
      listId: 'list-123',
      list: {
        boardId: 'board-123',
        board: mockBoard,
      },
    }

    beforeEach(() => {
      vi.mocked(prisma.card.findUnique).mockResolvedValue(mockCardWithAccess as never)
    })

    it('should return null when target list not found', async () => {
      vi.mocked(prisma.list.findUnique).mockResolvedValue(null)

      const result = await moveCard('card-123', mockUser.id, {
        toListId: 'nonexistent-list',
        position: 0,
      })

      expect(result).toBeNull()
    })

    it('should return null when target list on different board', async () => {
      vi.mocked(prisma.list.findUnique).mockResolvedValue({
        boardId: 'different-board',
      } as never)

      const result = await moveCard('card-123', mockUser.id, {
        toListId: 'list-456',
        position: 0,
      })

      expect(result).toBeNull()
    })

    it('should shift cards and move to target position', async () => {
      vi.mocked(prisma.list.findUnique).mockResolvedValue({
        boardId: 'board-123',
      } as never)
      vi.mocked(prisma.card.updateMany).mockResolvedValue({ count: 2 } as never)
      vi.mocked(prisma.card.update).mockResolvedValue({
        ...mockCard,
        listId: 'list-456',
        position: 2,
      } as never)

      const result = await moveCard('card-123', mockUser.id, {
        toListId: 'list-456',
        position: 2,
      })

      expect(prisma.card.updateMany).toHaveBeenCalledWith({
        where: {
          listId: 'list-456',
          position: { gte: 2 },
        },
        data: {
          position: { increment: 1 },
        },
      })
      expect(prisma.card.update).toHaveBeenCalledWith({
        where: { id: 'card-123' },
        data: {
          listId: 'list-456',
          position: 2,
        },
        select: expect.any(Object),
      })
      expect(result?.listId).toBe('list-456')
    })
  })

  describe('reorderCards', () => {
    beforeEach(() => {
      vi.mocked(prisma.list.findUnique).mockResolvedValue(mockList as never)
    })

    it('should return null when card ids dont match existing cards', async () => {
      vi.mocked(prisma.card.findMany).mockResolvedValue([
        { id: 'card-1' },
        { id: 'card-2' },
      ] as never)

      const result = await reorderCards('list-123', mockUser.id, {
        cardIds: ['card-1', 'card-3'],
      })

      expect(result).toBeNull()
    })

    it('should return null when cardIds length differs from existing', async () => {
      vi.mocked(prisma.card.findMany)
        .mockResolvedValueOnce([{ id: 'card-1' }, { id: 'card-2' }] as never)
        .mockResolvedValueOnce([mockCard] as never)

      const result = await reorderCards('list-123', mockUser.id, {
        cardIds: ['card-1'],
      })

      expect(result).toBeNull()
    })

    it('should return null when user has no edit access', async () => {
      const viewerBoard = {
        ...mockBoard,
        ownerId: 'other-user',
        members: [{ role: 'VIEWER' }],
      }
      vi.mocked(prisma.list.findUnique).mockResolvedValue({
        ...mockList,
        board: viewerBoard,
      } as never)

      const result = await reorderCards('list-123', mockUser.id, {
        cardIds: ['card-1', 'card-2'],
      })

      expect(result).toBeNull()
      // Transaction should not be called if access is denied
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })
  })
})
