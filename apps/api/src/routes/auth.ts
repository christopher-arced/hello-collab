import { Router } from 'express'
import { registerSchema, loginSchema } from '@hello/validation'
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth'
import { validateBody } from '../middleware/validate'
import { authRateLimit } from '../middleware/rateLimit'

const router = Router()

router.post('/register', authRateLimit, validateBody(registerSchema), register)
router.post('/login', authRateLimit, validateBody(loginSchema), login)
router.post('/logout', logout)
router.get('/me', authMiddleware, getCurrentUser)

export default router
