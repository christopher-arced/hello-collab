import { prisma } from '@hello/database'
import type {
  CreateCardInput,
  UpdateCardInput,
  MoveCardInput,
  ReorderCardsInput,
} from '@hello/validation'
import type { Card } from '@hello/types'

const cardSelect = {
  id: true,
  title: true,
  description: true,
  listId: true,
  position: true,
  dueDate: true,
  coverUrl: true,
  createdAt: true,
  updatedAt: true,
} as const

async function verifyListAccess(
  listId: string,
  userId: string,
  requireEditor = false
): Promise<{ hasAccess: boolean; boardId: string | null }> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: {
      boardId: true,
      board: {
        select: {
          id: true,
          ownerId: true,
          members: {
            where: { userId },
            select: { role: true },
          },
        },
      },
    },
  })

  if (!list) return { hasAccess: false, boardId: null }

  const board = list.board
  const isOwner = board.ownerId === userId
  const membership = board.members[0]

  if (requireEditor) {
    const hasEditAccess = isOwner || (membership && ['OWNER', 'EDITOR'].includes(membership.role))
    return { hasAccess: !!hasEditAccess, boardId: list.boardId }
  }

  const hasAccess = isOwner || !!membership
  return { hasAccess, boardId: list.boardId }
}

async function verifyCardAccess(
  cardId: string,
  userId: string,
  requireEditor = false
): Promise<{ hasAccess: boolean; card: { listId: string; boardId: string } | null }> {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: {
      listId: true,
      list: {
        select: {
          boardId: true,
          board: {
            select: {
              ownerId: true,
              members: {
                where: { userId },
                select: { role: true },
              },
            },
          },
        },
      },
    },
  })

  if (!card) return { hasAccess: false, card: null }

  const board = card.list.board
  const isOwner = board.ownerId === userId
  const membership = board.members[0]

  if (requireEditor) {
    const hasEditAccess = isOwner || (membership && ['OWNER', 'EDITOR'].includes(membership.role))
    return {
      hasAccess: !!hasEditAccess,
      card: { listId: card.listId, boardId: card.list.boardId },
    }
  }

  const hasAccess = isOwner || !!membership
  return { hasAccess, card: { listId: card.listId, boardId: card.list.boardId } }
}

export async function getCardsByList(listId: string, userId: string): Promise<Card[] | null> {
  const { hasAccess } = await verifyListAccess(listId, userId)
  if (!hasAccess) return null

  return prisma.card.findMany({
    where: { listId },
    select: cardSelect,
    orderBy: { position: 'asc' },
  })
}

export async function createCard(
  listId: string,
  userId: string,
  data: CreateCardInput
): Promise<Card | null> {
  const { hasAccess } = await verifyListAccess(listId, userId, true)
  if (!hasAccess) return null

  return prisma.$transaction(async (tx) => {
    const maxPosition = await tx.card.aggregate({
      where: { listId },
      _max: { position: true },
    })

    const position = data.position ?? (maxPosition._max.position ?? -1) + 1

    return tx.card.create({
      data: {
        title: data.title.trim(),
        description: data.description?.trim() ?? null,
        listId,
        position,
      },
      select: cardSelect,
    })
  })
}

export async function updateCard(
  cardId: string,
  userId: string,
  data: UpdateCardInput
): Promise<Card | null> {
  const { hasAccess } = await verifyCardAccess(cardId, userId, true)
  if (!hasAccess) return null

  return prisma.card.update({
    where: { id: cardId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() ?? null }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl?.trim() ?? null }),
    },
    select: cardSelect,
  })
}

export async function deleteCard(cardId: string, userId: string): Promise<boolean> {
  const { hasAccess } = await verifyCardAccess(cardId, userId, true)
  if (!hasAccess) return false

  await prisma.card.delete({
    where: { id: cardId },
  })

  return true
}

export async function moveCard(
  cardId: string,
  userId: string,
  data: MoveCardInput
): Promise<Card | null> {
  const { hasAccess, card } = await verifyCardAccess(cardId, userId, true)
  if (!hasAccess || !card) return null

  // Verify target list is on the same board
  const targetList = await prisma.list.findUnique({
    where: { id: data.toListId },
    select: { boardId: true },
  })

  if (!targetList || targetList.boardId !== card.boardId) {
    return null
  }

  return prisma.$transaction(async (tx) => {
    // Shift cards in target list to make room at the target position
    await tx.card.updateMany({
      where: {
        listId: data.toListId,
        position: { gte: data.position },
      },
      data: {
        position: { increment: 1 },
      },
    })

    // Move the card to the target list at the target position
    return tx.card.update({
      where: { id: cardId },
      data: {
        listId: data.toListId,
        position: data.position,
      },
      select: cardSelect,
    })
  })
}

export async function reorderCards(
  listId: string,
  userId: string,
  data: ReorderCardsInput
): Promise<Card[] | null> {
  const { hasAccess } = await verifyListAccess(listId, userId, true)
  if (!hasAccess) return null

  return prisma.$transaction(async (tx) => {
    const existingCards = await tx.card.findMany({
      where: { listId },
      select: { id: true },
    })

    const existingIds = new Set(existingCards.map((c) => c.id))
    const validIds = data.cardIds.every((id) => existingIds.has(id))

    if (!validIds || data.cardIds.length !== existingCards.length) {
      return null
    }

    for (let index = 0; index < data.cardIds.length; index++) {
      await tx.card.update({
        where: { id: data.cardIds[index] },
        data: { position: index },
      })
    }

    return tx.card.findMany({
      where: { listId },
      select: cardSelect,
      orderBy: { position: 'asc' },
    })
  })
}
