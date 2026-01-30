import { prisma } from '@hello/database'
import type { CreateListInput, UpdateListInput, ReorderListsInput } from '@hello/validation'
import type { List } from '@hello/types'
import { hasBoardAccess } from '../utils/boardAccess'

const listSelect = {
  id: true,
  title: true,
  boardId: true,
  position: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function getListsByBoard(boardId: string, userId: string): Promise<List[] | null> {
  const hasAccess = await hasBoardAccess(boardId, userId)
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
  const hasAccess = await hasBoardAccess(boardId, userId, true)
  if (!hasAccess) return null

  return prisma.$transaction(async (tx) => {
    const maxPosition = await tx.list.aggregate({
      where: { boardId },
      _max: { position: true },
    })

    const position = data.position ?? (maxPosition._max.position ?? -1) + 1

    return tx.list.create({
      data: {
        title: data.title.trim(),
        boardId,
        position,
      },
      select: listSelect,
    })
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

  const hasAccess = await hasBoardAccess(list.boardId, userId, true)
  if (!hasAccess) return null

  return prisma.list.update({
    where: { id: listId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.position !== undefined && { position: data.position }),
    },
    select: listSelect,
  })
}

export async function deleteList(
  listId: string,
  userId: string
): Promise<{ deleted: boolean; boardId: string | null }> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { boardId: true },
  })

  if (!list) return { deleted: false, boardId: null }

  const hasAccess = await hasBoardAccess(list.boardId, userId, true)
  if (!hasAccess) return { deleted: false, boardId: null }

  await prisma.list.delete({
    where: { id: listId },
  })

  return { deleted: true, boardId: list.boardId }
}

export async function reorderLists(
  boardId: string,
  userId: string,
  data: ReorderListsInput
): Promise<List[] | null> {
  const hasAccess = await hasBoardAccess(boardId, userId, true)
  if (!hasAccess) return null

  return prisma.$transaction(async (tx) => {
    const existingLists = await tx.list.findMany({
      where: { boardId },
      select: { id: true },
    })

    const existingIds = new Set(existingLists.map((l) => l.id))
    const validIds = data.listIds.every((id) => existingIds.has(id))

    if (!validIds || data.listIds.length !== existingLists.length) {
      return null
    }

    for (let index = 0; index < data.listIds.length; index++) {
      await tx.list.update({
        where: { id: data.listIds[index] },
        data: { position: index },
      })
    }

    return tx.list.findMany({
      where: { boardId },
      select: listSelect,
      orderBy: { position: 'asc' },
    })
  })
}
