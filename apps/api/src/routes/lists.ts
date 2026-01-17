import { Router } from 'express'
import { create, getByBoard, update, remove, reorder } from '../controllers/lists.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Board-scoped routes: /api/boards/:boardId/lists
router.get('/boards/:boardId/lists', authMiddleware, getByBoard)
router.post('/boards/:boardId/lists', authMiddleware, create)
router.patch('/boards/:boardId/lists/reorder', authMiddleware, reorder)

// List-specific routes: /api/lists/:id
router.patch('/lists/:id', authMiddleware, update)
router.delete('/lists/:id', authMiddleware, remove)

export default router
