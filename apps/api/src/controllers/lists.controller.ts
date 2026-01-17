import type { Request, Response } from 'express'
import { createListSchema, updateListSchema, reorderListsSchema } from '@hello/validation'
import type { ApiResponse, List } from '@hello/types'
import {
  createList,
  getListsByBoard,
  updateList,
  deleteList,
  reorderLists,
} from '../services/lists.service'

export async function getByBoard(req: Request, res: Response) {
  try {
    const { boardId } = req.params
    const lists = await getListsByBoard(boardId, req.user!.id)

    if (!lists) {
      return res.status(404).json({
        success: false,
        error: 'Board not found or access denied',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: lists } satisfies ApiResponse<List[]>)
  } catch (error) {
    console.error('Get lists error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get lists',
    } satisfies ApiResponse)
  }
}

export async function create(req: Request, res: Response) {
  try {
    const { boardId } = req.params
    const result = createListSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const list = await createList(boardId, req.user!.id, result.data)

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'Board not found or access denied',
      } satisfies ApiResponse)
    }

    return res.status(201).json({
      success: true,
      data: list,
    } satisfies ApiResponse<List>)
  } catch (error) {
    console.error('Create list error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to create list',
    } satisfies ApiResponse)
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params
    const result = updateListSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const list = await updateList(id, req.user!.id, result.data)

    if (!list) {
      return res.status(404).json({
        success: false,
        error: 'List not found or access denied',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: list } satisfies ApiResponse<List>)
  } catch (error) {
    console.error('Update list error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update list',
    } satisfies ApiResponse)
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params
    const deleted = await deleteList(id, req.user!.id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'List not found or access denied',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: null } satisfies ApiResponse<null>)
  } catch (error) {
    console.error('Delete list error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to delete list',
    } satisfies ApiResponse)
  }
}

export async function reorder(req: Request, res: Response) {
  try {
    const { boardId } = req.params
    const result = reorderListsSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies ApiResponse)
    }

    const lists = await reorderLists(boardId, req.user!.id, result.data)

    if (!lists) {
      return res.status(404).json({
        success: false,
        error: 'Board not found, access denied, or invalid list IDs',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: lists } satisfies ApiResponse<List[]>)
  } catch (error) {
    console.error('Reorder lists error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to reorder lists',
    } satisfies ApiResponse)
  }
}
