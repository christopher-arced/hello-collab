import { Router } from 'express'
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authMiddleware, getCurrentUser)

export default router
