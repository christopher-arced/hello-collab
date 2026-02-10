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
): Promise<{ card: Card; boardId: string } | null> {
  const { hasAccess, boardId } = await verifyListAccess(listId, userId, true)
  if (!hasAccess || !boardId) return null

  const card = await prisma.$transaction(async (tx) => {
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

  return { card, boardId }
}

export async function updateCard(
  cardId: string,
  userId: string,
  data: UpdateCardInput
): Promise<{ card: Card; boardId: string } | null> {
  const { hasAccess, card: cardInfo } = await verifyCardAccess(cardId, userId, true)
  if (!hasAccess || !cardInfo) return null

  const card = await prisma.card.update({
    where: { id: cardId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() ?? null }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
      ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl?.trim() ?? null }),
    },
    select: cardSelect,
  })

  return { card, boardId: cardInfo.boardId }
}

export async function deleteCard(
  cardId: string,
  userId: string
): Promise<{ deleted: boolean; listId: string | null; boardId: string | null }> {
  const { hasAccess, card } = await verifyCardAccess(cardId, userId, true)
  if (!hasAccess || !card) return { deleted: false, listId: null, boardId: null }

  await prisma.card.delete({
    where: { id: cardId },
  })

  return { deleted: true, listId: card.listId, boardId: card.boardId }
}

export async function moveCard(
  cardId: string,
  userId: string,
  data: MoveCardInput
): Promise<{ card: Card; fromListId: string; boardId: string } | null> {
  const { hasAccess, card: cardInfo } = await verifyCardAccess(cardId, userId, true)
  if (!hasAccess || !cardInfo) return null

  // Verify target list is on the same board
  const targetList = await prisma.list.findUnique({
    where: { id: data.toListId },
    select: { boardId: true },
  })

  if (!targetList || targetList.boardId !== cardInfo.boardId) {
    return null
  }

  // Get current card position for same-list move handling
  const currentCard = await prisma.card.findUnique({
    where: { id: cardId },
    select: { position: true, listId: true },
  })

  if (!currentCard) return null

  const fromListId = currentCard.listId

  const movedCard = await prisma.$transaction(async (tx) => {
    const isSameList = currentCard.listId === data.toListId

    if (isSameList) {
      // Same list move - shift only cards between old and new positions
      if (currentCard.position < data.position) {
        // Moving down: decrement positions in between
        await tx.card.updateMany({
          where: {
            listId: data.toListId,
            position: { gt: currentCard.position, lte: data.position },
          },
          data: { position: { decrement: 1 } },
        })
      } else if (currentCard.position > data.position) {
        // Moving up: increment positions in between
        await tx.card.updateMany({
          where: {
            listId: data.toListId,
            position: { gte: data.position, lt: currentCard.position },
          },
          data: { position: { increment: 1 } },
        })
      }
    } else {
      // Different list move - make room in target list
      await tx.card.updateMany({
        where: {
          listId: data.toListId,
          position: { gte: data.position },
        },
        data: { position: { increment: 1 } },
      })

      // Close the gap in source list
      await tx.card.updateMany({
        where: {
          listId: currentCard.listId,
          position: { gt: currentCard.position },
        },
        data: { position: { decrement: 1 } },
      })
    }

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

  return { card: movedCard, fromListId, boardId: cardInfo.boardId }
}

export async function reorderCards(
  listId: string,
  userId: string,
  data: ReorderCardsInput
): Promise<{ cards: Card[]; boardId: string } | null> {
  const { hasAccess, boardId } = await verifyListAccess(listId, userId, true)
  if (!hasAccess || !boardId) return null

  const cards = await prisma.$transaction(async (tx) => {
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

  if (!cards) return null
  return { cards, boardId }
}
