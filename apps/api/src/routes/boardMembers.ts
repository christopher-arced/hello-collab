import { Router } from 'express'
import { validateBody } from '../middleware/validate'
import { authMiddleware } from '../middleware/auth'
import { addBoardMemberSchema, updateBoardMemberSchema } from '@hello/validation'
import {
  getMembers,
  addMember,
  updateRole,
  removeMember,
} from '../controllers/boardMembers.controller'

const router = Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/boards/:id/members - List all members
router.get('/:id/members', getMembers)

// POST /api/boards/:id/members - Add a member by email
router.post('/:id/members', validateBody(addBoardMemberSchema), addMember)

// PATCH /api/boards/:id/members/:userId - Update member role
router.patch('/:id/members/:userId', validateBody(updateBoardMemberSchema), updateRole)

// DELETE /api/boards/:id/members/:userId - Remove a member
router.delete('/:id/members/:userId', removeMember)

export default router
