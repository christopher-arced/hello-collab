import type { Request, Response } from 'express'
import type { AddBoardMemberInput, UpdateBoardMemberInput } from '@hello/validation'
import type { ApiResponse, BoardMember } from '@hello/types'
import {
  getBoardMembers,
  addBoardMember,
  updateMemberRole,
  removeBoardMember,
} from '../services/boardMembers.service'
import { emitMemberAdded, emitMemberUpdated, emitMemberRemoved } from '../sockets/emitter'

export async function getMembers(req: Request, res: Response) {
  try {
    const { id: boardId } = req.params
    const members = await getBoardMembers(boardId, req.user!.id)

    if (!members) {
      return res.status(404).json({
        success: false,
        error: 'Board not found or access denied',
      } satisfies ApiResponse)
    }

    return res.json({ success: true, data: members } satisfies ApiResponse<BoardMember[]>)
  } catch (error) {
    console.error('Get board members error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to get board members',
    } satisfies ApiResponse)
  }
}

export async function addMember(req: Request, res: Response) {
  try {
    const { id: boardId } = req.params
    const data = req.body as AddBoardMemberInput

    const result = await addBoardMember(boardId, req.user!.id, data)

    if ('error' in result) {
      const status = result.error.includes('not found') ? 404 : 403
      return res.status(status).json({
        success: false,
        error: result.error,
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitMemberAdded(result.boardId, result.member, req.user!.id)

    return res.status(201).json({
      success: true,
      data: result.member,
    } satisfies ApiResponse<BoardMember>)
  } catch (error) {
    console.error('Add board member error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to add board member',
    } satisfies ApiResponse)
  }
}

export async function updateRole(req: Request, res: Response) {
  try {
    const { id: boardId, userId: targetUserId } = req.params
    const data = req.body as UpdateBoardMemberInput

    const result = await updateMemberRole(boardId, req.user!.id, targetUserId, data)

    if ('error' in result) {
      const status = result.error.includes('not found') ? 404 : 403
      return res.status(status).json({
        success: false,
        error: result.error,
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitMemberUpdated(result.boardId, result.member, req.user!.id)

    return res.json({
      success: true,
      data: result.member,
    } satisfies ApiResponse<BoardMember>)
  } catch (error) {
    console.error('Update member role error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to update member role',
    } satisfies ApiResponse)
  }
}

export async function removeMember(req: Request, res: Response) {
  try {
    const { id: boardId, userId: targetUserId } = req.params

    const result = await removeBoardMember(boardId, req.user!.id, targetUserId)

    if ('error' in result) {
      const status = result.error.includes('not found') ? 404 : 403
      return res.status(status).json({
        success: false,
        error: result.error,
      } satisfies ApiResponse)
    }

    // Emit real-time event
    emitMemberRemoved(result.boardId, result.userId, req.user!.id)

    return res.json({ success: true, data: null } satisfies ApiResponse<null>)
  } catch (error) {
    console.error('Remove board member error:', error)
    return res.status(500).json({
      success: false,
      error: 'Failed to remove board member',
    } satisfies ApiResponse)
  }
}
