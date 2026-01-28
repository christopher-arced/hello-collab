import { Router } from 'express'
import {
  createCardSchema,
  updateCardSchema,
  moveCardSchema,
  reorderCardsSchema,
} from '@hello/validation'
import { create, getByList, update, remove, move, reorder } from '../controllers/cards.controller'
import { authMiddleware } from '../middleware/auth'
import { validateBody } from '../middleware/validate'

const router = Router()

// List-scoped routes: /api/lists/:listId/cards
router.get('/lists/:listId/cards', authMiddleware, getByList)
router.post('/lists/:listId/cards', authMiddleware, validateBody(createCardSchema), create)
router.patch(
  '/lists/:listId/cards/reorder',
  authMiddleware,
  validateBody(reorderCardsSchema),
  reorder
)

// Card-specific routes: /api/cards/:id
router.patch('/cards/:id', authMiddleware, validateBody(updateCardSchema), update)
router.delete('/cards/:id', authMiddleware, remove)
router.patch('/cards/:id/move', authMiddleware, validateBody(moveCardSchema), move)

export default router
