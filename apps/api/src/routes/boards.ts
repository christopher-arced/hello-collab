import { Router } from 'express'
import { create, getBoards } from '../controllers/boards.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/', authMiddleware, getBoards)
router.post('/', authMiddleware, create)

export default router
