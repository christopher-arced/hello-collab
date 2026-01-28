import { Router } from 'express'
import { createListSchema, updateListSchema, reorderListsSchema } from '@hello/validation'
import { create, getByBoard, update, remove, reorder } from '../controllers/lists.controller'
import { authMiddleware } from '../middleware/auth'
import { validateBody } from '../middleware/validate'

const router = Router()

// Board-scoped routes: /api/boards/:boardId/lists
router.get('/boards/:boardId/lists', authMiddleware, getByBoard)
router.post('/boards/:boardId/lists', authMiddleware, validateBody(createListSchema), create)
router.patch(
  '/boards/:boardId/lists/reorder',
  authMiddleware,
  validateBody(reorderListsSchema),
  reorder
)

// List-specific routes: /api/lists/:id
router.patch('/lists/:id', authMiddleware, validateBody(updateListSchema), update)
router.delete('/lists/:id', authMiddleware, remove)

export default router
