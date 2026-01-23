import type { Request, Response } from 'express'
import type {
  CreateCardInput,
  UpdateCardInput,
  MoveCardInput,
  ReorderCardsInput,
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
    const data = req.body as CreateCardInput

    const card = await createCard(listId, req.user!.id, data)

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'List not found or access denied',
      } satisfies ApiResponse)
    }

    return res.status(201).json({
      success: true,
      data: card,
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
    const data = req.body as UpdateCardInput

    const card = await updateCard(id, req.user!.id, data)

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found or access denied',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: card } satisfies ApiResponse<Card>)
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
    const deleted = await deleteCard(id, req.user!.id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Card not found or access denied',
      } satisfies ApiResponse)
    }

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
    const data = req.body as MoveCardInput

    const card = await moveCard(id, req.user!.id, data)

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found, access denied, or target list invalid',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: card } satisfies ApiResponse<Card>)
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
    const data = req.body as ReorderCardsInput

    const cards = await reorderCards(listId, req.user!.id, data)

    if (!cards) {
      return res.status(404).json({
        success: false,
        error: 'List not found, access denied, or invalid card IDs',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: cards } satisfies ApiResponse<Card[]>)
  } catch (error) {
    console.error('Reorder cards error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to reorder cards',
    } satisfies ApiResponse)
  }
}
