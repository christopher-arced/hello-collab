import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Role } from '@hello/types'
import {
  getBoardMembers,
  addBoardMember,
  updateMemberRole,
  removeBoardMember,
} from './boardMembers.service'

vi.mock('@hello/database', () => ({
  prisma: {
    board: {
      findUnique: vi.fn(),
    },
    boardMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../utils/boardAccess', () => ({
  verifyBoardAccess: vi.fn(),
}))

import { prisma } from '@hello/database'
import { verifyBoardAccess } from '../utils/boardAccess'

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
  userId: 'user-123',
  role: Role.EDITOR,
  joinedAt: new Date(),
  user: mockUser,
}

const mockOwnerAccess = {
  hasAccess: true,
  role: Role.OWNER,
  ownerId: 'owner-123',
  isOwner: true,
}

const mockEditorAccess = {
  hasAccess: true,
  role: Role.EDITOR,
  ownerId: 'owner-123',
  isOwner: false,
}

const mockViewerAccess = {
  hasAccess: true,
  role: Role.VIEWER,
  ownerId: 'owner-123',
  isOwner: false,
}

const mockNoAccess = {
  hasAccess: false,
  role: null,
  ownerId: null,
  isOwner: false,
}

describe('boardMembers.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBoardMembers', () => {
    it('should return null when user has no access', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockNoAccess)

      const result = await getBoardMembers('board-123', 'user-123')

      expect(result).toBeNull()
    })

    it('should return members when user has access', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockViewerAccess)
      vi.mocked(prisma.boardMember.findMany).mockResolvedValue([mockMember] as never)

      const result = await getBoardMembers('board-123', 'user-123')

      expect(result).toEqual([mockMember])
      expect(prisma.boardMember.findMany).toHaveBeenCalledWith({
        where: { boardId: 'board-123' },
        select: expect.any(Object),
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      })
    })

    it('should return empty array when board has no members', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.boardMember.findMany).mockResolvedValue([] as never)

      const result = await getBoardMembers('board-123', 'user-123')

      expect(result).toEqual([])
    })
  })

  describe('addBoardMember', () => {
    it('should return error when user has no access', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockNoAccess)

      const result = await addBoardMember('board-123', 'user-123', {
        email: 'new@example.com',
      })

      expect(result).toEqual({ error: 'Board not found or access denied' })
    })

    it('should return error when user is VIEWER', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockViewerAccess)

      const result = await addBoardMember('board-123', 'user-123', {
        email: 'new@example.com',
      })

      expect(result).toEqual({ error: 'Only owners and editors can add members' })
    })

    it('should return error when target user not found', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

      const result = await addBoardMember('board-123', 'user-123', {
        email: 'nonexistent@example.com',
      })

      expect(result).toEqual({ error: 'User with this email not found' })
    })

    it('should return error when user is already a member', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'new-user-123' } as never)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue(mockMember as never)

      const result = await addBoardMember('board-123', 'user-123', {
        email: 'existing@example.com',
      })

      expect(result).toEqual({ error: 'User is already a member of this board' })
    })

    it('should add member with OWNER role', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'new-user-123' } as never)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.boardMember.create).mockResolvedValue(mockMember as never)

      const result = await addBoardMember('board-123', 'user-123', {
        email: 'new@example.com',
        role: 'EDITOR',
      })

      expect(result).toHaveProperty('member')
      expect(prisma.boardMember.create).toHaveBeenCalledWith({
        data: {
          boardId: 'board-123',
          userId: 'new-user-123',
          role: 'EDITOR',
        },
        select: expect.any(Object),
      })
    })

    it('should add member with EDITOR role', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockEditorAccess)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'new-user-123' } as never)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.boardMember.create).mockResolvedValue(mockMember as never)

      const result = await addBoardMember('board-123', 'user-123', {
        email: 'new@example.com',
      })

      expect(result).toHaveProperty('member')
    })

    it('should default to VIEWER role when not specified', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'new-user-123' } as never)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue(null)
      vi.mocked(prisma.boardMember.create).mockResolvedValue(mockMember as never)

      await addBoardMember('board-123', 'user-123', {
        email: 'new@example.com',
      })

      expect(prisma.boardMember.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'VIEWER',
        }),
        select: expect.any(Object),
      })
    })
  })

  describe('updateMemberRole', () => {
    it('should return error when user has no access', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockNoAccess)

      const result = await updateMemberRole('board-123', 'user-123', 'target-user', {
        role: 'EDITOR',
      })

      expect(result).toEqual({ error: 'Board not found or access denied' })
    })

    it('should return error when user is not OWNER', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockEditorAccess)

      const result = await updateMemberRole('board-123', 'user-123', 'target-user', {
        role: 'VIEWER',
      })

      expect(result).toEqual({ error: 'Only board owners can change member roles' })
    })

    it('should return error when trying to demote board owner', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)

      const result = await updateMemberRole('board-123', 'user-123', 'owner-123', {
        role: 'EDITOR',
      })

      expect(result).toEqual({ error: 'Cannot demote the board owner. Transfer ownership first.' })
    })

    it('should return error when target member not found', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue(null)

      const result = await updateMemberRole('board-123', 'user-123', 'nonexistent-user', {
        role: 'EDITOR',
      })

      expect(result).toEqual({ error: 'Member not found' })
    })

    it('should update member role successfully', async () => {
      const updatedMember = { ...mockMember, role: Role.VIEWER }
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue(mockMember as never)
      vi.mocked(prisma.boardMember.update).mockResolvedValue(updatedMember as never)

      const result = await updateMemberRole('board-123', 'user-123', 'user-123', {
        role: 'VIEWER',
      })

      expect(result).toHaveProperty('member')
      expect(prisma.boardMember.update).toHaveBeenCalledWith({
        where: { id: 'member-123' },
        data: { role: 'VIEWER' },
        select: expect.any(Object),
      })
    })

    it('should allow setting board owner role to OWNER', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue({
        ...mockMember,
        userId: 'owner-123',
      } as never)
      vi.mocked(prisma.boardMember.update).mockResolvedValue(mockMember as never)

      const result = await updateMemberRole('board-123', 'user-123', 'owner-123', {
        role: 'OWNER',
      })

      expect(result).toHaveProperty('member')
    })
  })

  describe('removeBoardMember', () => {
    it('should return error when user has no access', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockNoAccess)

      const result = await removeBoardMember('board-123', 'user-123', 'target-user')

      expect(result).toEqual({ error: 'Board not found or access denied' })
    })

    it('should return error when trying to remove board owner', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)

      const result = await removeBoardMember('board-123', 'user-123', 'owner-123')

      expect(result).toEqual({ error: 'Cannot remove the board owner' })
    })

    it('should return error when VIEWER tries to remove others', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockViewerAccess)

      const result = await removeBoardMember('board-123', 'user-123', 'other-user')

      expect(result).toEqual({ error: 'You do not have permission to remove this member' })
    })

    it('should allow VIEWER to remove self', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockViewerAccess)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue(mockMember as never)
      vi.mocked(prisma.boardMember.delete).mockResolvedValue(mockMember as never)

      const result = await removeBoardMember('board-123', 'user-123', 'user-123')

      expect(result).toEqual({ removed: true, boardId: 'board-123', userId: 'user-123' })
    })

    it('should return error when target member not found', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue(null)

      const result = await removeBoardMember('board-123', 'user-123', 'nonexistent-user')

      expect(result).toEqual({ error: 'Member not found' })
    })

    it('should return error when EDITOR tries to remove EDITOR', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockEditorAccess)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue({
        ...mockMember,
        userId: 'other-editor',
        role: 'EDITOR',
      } as never)

      const result = await removeBoardMember('board-123', 'user-123', 'other-editor')

      expect(result).toEqual({ error: 'Editors can only remove viewers' })
    })

    it('should allow EDITOR to remove VIEWER', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockEditorAccess)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue({
        ...mockMember,
        userId: 'viewer-user',
        role: 'VIEWER',
      } as never)
      vi.mocked(prisma.boardMember.delete).mockResolvedValue(mockMember as never)

      const result = await removeBoardMember('board-123', 'user-123', 'viewer-user')

      expect(result).toEqual({ removed: true, boardId: 'board-123', userId: 'viewer-user' })
    })

    it('should allow OWNER to remove any member', async () => {
      vi.mocked(verifyBoardAccess).mockResolvedValue(mockOwnerAccess)
      vi.mocked(prisma.boardMember.findUnique).mockResolvedValue({
        ...mockMember,
        userId: 'editor-user',
        role: 'EDITOR',
      } as never)
      vi.mocked(prisma.boardMember.delete).mockResolvedValue(mockMember as never)

      const result = await removeBoardMember('board-123', 'user-123', 'editor-user')

      expect(result).toEqual({ removed: true, boardId: 'board-123', userId: 'editor-user' })
      expect(prisma.boardMember.delete).toHaveBeenCalled()
    })
  })
})
