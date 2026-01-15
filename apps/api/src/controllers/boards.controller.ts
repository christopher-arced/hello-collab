import type { Request, Response } from 'express'
import { createBoardSchema } from '@hello/validation'
import type { ApiResponse, Board } from '@hello/types'
import { createBoard, findBoards } from '../services/boards.service'

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
