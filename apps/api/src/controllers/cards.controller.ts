import type { Request, Response } from 'express'
import {
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  reorderCardsSchema,
} from '@hello/validation'
import type { ApiResponse, Card } from '@hello/types'
import {
  createCard,
  getCardsByList,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
} from '../services/cards.service'
import {
  emitCardCreated,
  emitCardUpdated,
  emitCardDeleted,
  emitCardMoved,
  emitCardsReordered,
} from '../sockets/emitter'

export async function getByList(req: Request, res: Response) {
  try {
    const { listId } = req.params
    const cards = await getCardsByList(listId, req.user!.id)

    if (!cards) {
      return res.status(404).json({
        success: false,
        error: 'List not found or access denied',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: cards } satisfies ApiResponse<Card[]>)
  } catch (error) {
    console.error('Get cards error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get cards',
    } satisfies ApiResponse)
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { listId } = req.params
    const validation = createCardSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const result = await createCard(listId, req.user!.id, validation.data)

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'List not found or access denied',
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitCardCreated(result.boardId, result.card, req.user!.id)

    return res.status(201).json({
      success: true,
      data: result.card,
    } satisfies ApiResponse<Card>)
  } catch (error) {
    console.error('Create card error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create card',
    } satisfies ApiResponse)
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params
    const validation = updateCardSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const result = await updateCard(id, req.user!.id, validation.data)

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Card not found or access denied',
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitCardUpdated(result.boardId, result.card, req.user!.id)

    return res.json({ success: true, data: result.card } satisfies ApiResponse<Card>)
  } catch (error) {
    console.error('Update card error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update card',
    } satisfies ApiResponse)
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { deleted, listId, boardId } = await deleteCard(id, req.user!.id)

    if (!deleted || !listId || !boardId) {
      return res.status(404).json({
        success: false,
        error: 'Card not found or access denied',
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitCardDeleted(boardId, id, listId, req.user!.id)

    return res.json({ success: true, data: null } satisfies ApiResponse<null>)
  } catch (error) {
    console.error('Delete card error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete card',
    } satisfies ApiResponse)
  }
}

export async function move(req: Request, res: Response) {
  try {
    const { id } = req.params
    const validation = moveCardSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const result = await moveCard(id, req.user!.id, validation.data)

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Card not found, access denied, or target list invalid',
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitCardMoved(result.boardId, result.card, result.fromListId, req.user!.id)

    return res.json({ success: true, data: result.card } satisfies ApiResponse<Card>)
  } catch (error) {
    console.error('Move card error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to move card',
    } satisfies ApiResponse)
  }
}

export async function reorder(req: Request, res: Response) {
  try {
    const { listId } = req.params
    const validation = reorderCardsSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const result = await reorderCards(listId, req.user!.id, validation.data)

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'List not found, access denied, or invalid card IDs',
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitCardsReordered(result.boardId, listId, result.cards, req.user!.id)

    return res.json({ success: true, data: result.cards } satisfies ApiResponse<Card[]>)
  } catch (error) {
    console.error('Reorder cards error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to reorder cards',
    } satisfies ApiResponse)
  }
}
