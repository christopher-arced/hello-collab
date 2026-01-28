import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyBoardAccess, hasBoardAccess } from './boardAccess'
import { Role } from '@hello/types'

vi.mock('@hello/database', () => ({
  prisma: {
    board: {
      findUnique: vi.fn(),
    },
  },
}))

import { prisma } from '@hello/database'

describe('boardAccess utility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('verifyBoardAccess', () => {
    it('should return no access when board not found', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue(null)

      const result = await verifyBoardAccess('nonexistent', 'user-123')

      expect(result).toEqual({
        hasAccess: false,
        role: null,
        ownerId: null,
        isOwner: false,
      })
    })

    it('should return OWNER role for board owner', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({
        ownerId: 'user-123',
        members: [],
      } as never)

      const result = await verifyBoardAccess('board-123', 'user-123')

      expect(result).toEqual({
        hasAccess: true,
        role: Role.OWNER,
        ownerId: 'user-123',
        isOwner: true,
      })
    })

    it('should return EDITOR role for editor member', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({
        ownerId: 'owner-123',
        members: [{ role: 'EDITOR' }],
      } as never)

      const result = await verifyBoardAccess('board-123', 'user-123')

      expect(result).toEqual({
        hasAccess: true,
        role: 'EDITOR',
        ownerId: 'owner-123',
        isOwner: false,
      })
    })

    it('should return VIEWER role for viewer member', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({
        ownerId: 'owner-123',
        members: [{ role: 'VIEWER' }],
      } as never)

      const result = await verifyBoardAccess('board-123', 'user-123')

      expect(result).toEqual({
        hasAccess: true,
        role: 'VIEWER',
        ownerId: 'owner-123',
        isOwner: false,
      })
    })

    it('should return no access for non-member', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({
        ownerId: 'owner-123',
        members: [],
      } as never)

      const result = await verifyBoardAccess('board-123', 'user-123')

      expect(result).toEqual({
        hasAccess: false,
        role: null,
        ownerId: 'owner-123',
        isOwner: false,
      })
    })

    describe('with requireEditor=true', () => {
      it('should grant access for owner', async () => {
        vi.mocked(prisma.board.findUnique).mockResolvedValue({
          ownerId: 'user-123',
          members: [],
        } as never)

        const result = await verifyBoardAccess('board-123', 'user-123', true)

        expect(result.hasAccess).toBe(true)
        expect(result.role).toBe(Role.OWNER)
      })

      it('should grant access for EDITOR', async () => {
        vi.mocked(prisma.board.findUnique).mockResolvedValue({
          ownerId: 'owner-123',
          members: [{ role: 'EDITOR' }],
        } as never)

        const result = await verifyBoardAccess('board-123', 'user-123', true)

        expect(result.hasAccess).toBe(true)
        expect(result.role).toBe('EDITOR')
      })

      it('should grant access for member with OWNER role', async () => {
        vi.mocked(prisma.board.findUnique).mockResolvedValue({
          ownerId: 'owner-123',
          members: [{ role: 'OWNER' }],
        } as never)

        const result = await verifyBoardAccess('board-123', 'user-123', true)

        expect(result.hasAccess).toBe(true)
      })

      it('should deny access for VIEWER', async () => {
        vi.mocked(prisma.board.findUnique).mockResolvedValue({
          ownerId: 'owner-123',
          members: [{ role: 'VIEWER' }],
        } as never)

        const result = await verifyBoardAccess('board-123', 'user-123', true)

        expect(result.hasAccess).toBe(false)
        expect(result.role).toBe('VIEWER')
      })

      it('should deny access for non-member', async () => {
        vi.mocked(prisma.board.findUnique).mockResolvedValue({
          ownerId: 'owner-123',
          members: [],
        } as never)

        const result = await verifyBoardAccess('board-123', 'user-123', true)

        expect(result.hasAccess).toBe(false)
      })
    })
  })

  describe('hasBoardAccess', () => {
    it('should return true when user has access', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({
        ownerId: 'user-123',
        members: [],
      } as never)

      const result = await hasBoardAccess('board-123', 'user-123')

      expect(result).toBe(true)
    })

    it('should return false when user has no access', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({
        ownerId: 'owner-123',
        members: [],
      } as never)

      const result = await hasBoardAccess('board-123', 'user-123')

      expect(result).toBe(false)
    })

    it('should respect requireEditor parameter', async () => {
      vi.mocked(prisma.board.findUnique).mockResolvedValue({
        ownerId: 'owner-123',
        members: [{ role: 'VIEWER' }],
      } as never)

      const viewerAccess = await hasBoardAccess('board-123', 'user-123', false)
      const editorAccess = await hasBoardAccess('board-123', 'user-123', true)

      expect(viewerAccess).toBe(true)
      expect(editorAccess).toBe(false)
    })
  })
})
