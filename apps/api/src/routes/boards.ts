import { Router } from 'express'
import { createBoardSchema, updateBoardSchema } from '@hello/validation'
import { create, getBoards, getBoard, update, remove } from '../controllers/boards.controller'
import { authMiddleware } from '../middleware/auth'
import { validateBody } from '../middleware/validate'

const router = Router()

router.get('/', authMiddleware, getBoards)
router.post('/', authMiddleware, validateBody(createBoardSchema), create)
router.get('/:id', authMiddleware, getBoard)
router.patch('/:id', authMiddleware, validateBody(updateBoardSchema), update)
router.delete('/:id', authMiddleware, remove)

export default router
