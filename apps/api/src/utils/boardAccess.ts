import { prisma } from '@hello/database'
import { Role } from '@hello/types'

export interface BoardAccessResult {
  hasAccess: boolean
  role: Role | null
  ownerId: string | null
  isOwner: boolean
}

/**
 * Verifies if a user has access to a board and returns their role.
 *
 * @param boardId - The board ID to check access for
 * @param userId - The user ID to check
 * @param requireEditor - If true, only returns hasAccess=true for OWNER/EDITOR roles
 * @returns BoardAccessResult with access info and user's role
 */
export async function verifyBoardAccess(
  boardId: string,
  userId: string,
  requireEditor = false
): Promise<BoardAccessResult> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      ownerId: true,
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  })

  if (!board) {
    return { hasAccess: false, role: null, ownerId: null, isOwner: false }
  }

  const isOwner = board.ownerId === userId
  const membership = board.members[0] ?? null

  // Determine the effective role
  let role: Role | null = null
  if (isOwner) {
    role = Role.OWNER
  } else if (membership) {
    role = membership.role as Role
  }

  // Check access based on requireEditor flag
  let hasAccess = false
  if (requireEditor) {
    hasAccess = isOwner || (membership !== null && ['OWNER', 'EDITOR'].includes(membership.role))
  } else {
    hasAccess = isOwner || membership !== null
  }

  return {
    hasAccess,
    role,
    ownerId: board.ownerId,
    isOwner,
  }
}

/**
 * Simple boolean check for board access (for backwards compatibility)
 */
export async function hasBoardAccess(
  boardId: string,
  userId: string,
  requireEditor = false
): Promise<boolean> {
  const result = await verifyBoardAccess(boardId, userId, requireEditor)
  return result.hasAccess
}
