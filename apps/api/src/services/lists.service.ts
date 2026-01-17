import { prisma } from '@hello/database'
import type { CreateListInput, UpdateListInput, ReorderListsInput } from '@hello/validation'
import type { List } from '@hello/types'

const listSelect = {
  id: true,
  title: true,
  boardId: true,
  position: true,
  createdAt: true,
  updatedAt: true,
} as const

async function verifyBoardAccess(
  boardId: string,
  userId: string,
  requireEditor = false
): Promise<boolean> {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: requireEditor
        ? [
            { ownerId: userId },
            { members: { some: { userId, role: { in: ['OWNER', 'EDITOR'] } } } },
          ]
        : [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  })
  return !!board
}

export async function getListsByBoard(boardId: string, userId: string): Promise<List[] | null> {
  const hasAccess = await verifyBoardAccess(boardId, userId)
  if (!hasAccess) return null

  return prisma.list.findMany({
    where: { boardId },
    select: listSelect,
    orderBy: { position: 'asc' },
  })
}

export async function createList(
  boardId: string,
  userId: string,
  data: CreateListInput
): Promise<List | null> {
  const hasAccess = await verifyBoardAccess(boardId, userId, true)
  if (!hasAccess) return null

  const maxPosition = await prisma.list.aggregate({
    where: { boardId },
    _max: { position: true },
  })

  const position = data.position ?? (maxPosition._max.position ?? -1) + 1

  return prisma.list.create({
    data: {
      title: data.title,
      boardId,
      position,
    },
    select: listSelect,
  })
}

export async function updateList(
  listId: string,
  userId: string,
  data: UpdateListInput
): Promise<List | null> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { boardId: true },
  })

  if (!list) return null

  const hasAccess = await verifyBoardAccess(list.boardId, userId, true)
  if (!hasAccess) return null

  return prisma.list.update({
    where: { id: listId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.position !== undefined && { position: data.position }),
    },
    select: listSelect,
  })
}

export async function deleteList(listId: string, userId: string): Promise<boolean> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { boardId: true },
  })

  if (!list) return false

  const hasAccess = await verifyBoardAccess(list.boardId, userId, true)
  if (!hasAccess) return false

  await prisma.list.delete({
    where: { id: listId },
  })

  return true
}

export async function reorderLists(
  boardId: string,
  userId: string,
  data: ReorderListsInput
): Promise<List[] | null> {
  const hasAccess = await verifyBoardAccess(boardId, userId, true)
  if (!hasAccess) return null

  const existingLists = await prisma.list.findMany({
    where: { boardId },
    select: { id: true },
  })

  const existingIds = new Set(existingLists.map((l) => l.id))
  const validIds = data.listIds.every((id) => existingIds.has(id))

  if (!validIds || data.listIds.length !== existingLists.length) {
    return null
  }

  await prisma.$transaction(
    data.listIds.map((id, index) =>
      prisma.list.update({
        where: { id },
        data: { position: index },
      })
    )
  )

  return prisma.list.findMany({
    where: { boardId },
    select: listSelect,
    orderBy: { position: 'asc' },
  })
}
