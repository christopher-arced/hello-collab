import { Router } from 'express'
import { create, getBoards, getBoard, update, remove } from '../controllers/boards.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/', authMiddleware, getBoards)
router.post('/', authMiddleware, create)
router.get('/:id', authMiddleware, getBoard)
router.patch('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, remove)

export default router
