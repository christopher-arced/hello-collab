import type { Request, Response } from 'express'
import { createBoardSchema, updateBoardSchema } from '@hello/validation'
import type { ApiResponse, Board } from '@hello/types'
import {
  createBoard,
  findBoards,
  findBoardById,
  updateBoard,
  deleteBoard,
} from '../services/boards.service'
import { emitBoardUpdated, emitBoardDeleted } from '../sockets/emitter'

export async function getBoards(req: Request, res: Response) {
  try {
    const boards = await findBoards(req.user!.id)

    return res.json({ success: true, data: boards } satisfies ApiResponse<Board[]>)
  } catch (error) {
    console.error('Get boards error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get boards',
    } satisfies ApiResponse)
  }
}

export async function create(req: Request, res: Response) {
  try {
    const result = createBoardSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const board = await createBoard(result.data, req.user!.id)

    return res.status(201).json({
      success: true,
      data: board,
    } satisfies ApiResponse<Board>)
  } catch (error) {
    console.error('Create board error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create board',
    } satisfies ApiResponse)
  }
}

export async function getBoard(req: Request, res: Response) {
  try {
    const { id } = req.params
    const board = await findBoardById(id, req.user!.id)

    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Board not found',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: board } satisfies ApiResponse<Board>)
  } catch (error) {
    console.error('Get board error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get board',
    } satisfies ApiResponse)
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params
    const result = updateBoardSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const board = await updateBoard(id, req.user!.id, result.data)

    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Board not found or access denied',
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitBoardUpdated(id, board, req.user!.id)

    return res.json({ success: true, data: board } satisfies ApiResponse<Board>)
  } catch (error) {
    console.error('Update board error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update board',
    } satisfies ApiResponse)
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params
    const deleted = await deleteBoard(id, req.user!.id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Board not found or access denied',
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitBoardDeleted(id, req.user!.id)

    return res.json({ success: true, data: null } satisfies ApiResponse<null>)
  } catch (error) {
    console.error('Delete board error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete board',
    } satisfies ApiResponse)
  }
}
