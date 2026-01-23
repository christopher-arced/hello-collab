import { Router } from 'express'
import { create, getByList, update, remove, move, reorder } from '../controllers/cards.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// List-scoped routes: /api/lists/:listId/cards
router.get('/lists/:listId/cards', authMiddleware, getByList)
router.post('/lists/:listId/cards', authMiddleware, create)
router.patch('/lists/:listId/cards/reorder', authMiddleware, reorder)

// Card-specific routes: /api/cards/:id
router.patch('/cards/:id', authMiddleware, update)
router.delete('/cards/:id', authMiddleware, remove)
router.patch('/cards/:id/move', authMiddleware, move)

export default router
