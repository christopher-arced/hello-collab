import { prisma } from '@hello/database'
import type { AddBoardMemberInput, UpdateBoardMemberInput } from '@hello/validation'
import type { BoardMember } from '@hello/types'
import { verifyBoardAccess } from '../utils/boardAccess'

const memberSelect = {
  id: true,
  boardId: true,
  userId: true,
  role: true,
  joinedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const

export async function getBoardMembers(
  boardId: string,
  userId: string
): Promise<BoardMember[] | null> {
  const access = await verifyBoardAccess(boardId, userId)
  if (!access.hasAccess) return null

  const members = await prisma.boardMember.findMany({
    where: { boardId },
    select: memberSelect,
    orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
  })

  return members as BoardMember[]
}

export async function addBoardMember(
  boardId: string,
  requesterId: string,
  data: AddBoardMemberInput
): Promise<{ member: BoardMember; boardId: string } | { error: string }> {
  const access = await verifyBoardAccess(boardId, requesterId, true)
  if (!access.hasAccess) {
    return { error: 'Board not found or access denied' }
  }

  // Only OWNER or EDITOR can add members (already checked by requireEditor=true)
  if (!access.role || !['OWNER', 'EDITOR'].includes(access.role)) {
    return { error: 'Only owners and editors can add members' }
  }

  // Find user by email
  const userToAdd = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  })

  if (!userToAdd) {
    return { error: 'User with this email not found' }
  }

  // Check if user is already a member
  const existingMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: userToAdd.id,
      },
    },
  })

  if (existingMember) {
    return { error: 'User is already a member of this board' }
  }

  const role = data.role ?? 'VIEWER'

  const member = await prisma.boardMember.create({
    data: {
      boardId,
      userId: userToAdd.id,
      role,
    },
    select: memberSelect,
  })

  return { member: member as BoardMember, boardId }
}

export async function updateMemberRole(
  boardId: string,
  requesterId: string,
  targetUserId: string,
  data: UpdateBoardMemberInput
): Promise<{ member: BoardMember; boardId: string } | { error: string }> {
  const access = await verifyBoardAccess(boardId, requesterId)
  if (!access.hasAccess || !access.ownerId) {
    return { error: 'Board not found or access denied' }
  }

  // Only OWNER can change roles
  if (access.role !== 'OWNER') {
    return { error: 'Only board owners can change member roles' }
  }

  // Cannot demote the board owner
  if (access.ownerId === targetUserId && data.role !== 'OWNER') {
    return { error: 'Cannot demote the board owner. Transfer ownership first.' }
  }

  // Find the target member
  const targetMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: targetUserId,
      },
    },
  })

  if (!targetMember) {
    return { error: 'Member not found' }
  }

  const member = await prisma.boardMember.update({
    where: { id: targetMember.id },
    data: { role: data.role },
    select: memberSelect,
  })

  return { member: member as BoardMember, boardId }
}

export async function removeBoardMember(
  boardId: string,
  requesterId: string,
  targetUserId: string
): Promise<{ removed: boolean; boardId: string; userId: string } | { error: string }> {
  const access = await verifyBoardAccess(boardId, requesterId)
  if (!access.hasAccess || !access.ownerId) {
    return { error: 'Board not found or access denied' }
  }

  const isSelf = requesterId === targetUserId
  const isOwner = access.role === 'OWNER'
  const isEditor = access.role === 'EDITOR'

  // Cannot remove the board owner
  if (access.ownerId === targetUserId) {
    return { error: 'Cannot remove the board owner' }
  }

  // Check permissions: OWNER, EDITOR, or self can remove
  if (!isOwner && !isEditor && !isSelf) {
    return { error: 'You do not have permission to remove this member' }
  }

  // Find the target member
  const targetMember = await prisma.boardMember.findUnique({
    where: {
      boardId_userId: {
        boardId,
        userId: targetUserId,
      },
    },
  })

  if (!targetMember) {
    return { error: 'Member not found' }
  }

  // Editors cannot remove other editors or owners
  if (isEditor && !isSelf && targetMember.role !== 'VIEWER') {
    return { error: 'Editors can only remove viewers' }
  }

  await prisma.boardMember.delete({
    where: { id: targetMember.id },
  })

  return { removed: true, boardId, userId: targetUserId }
}
