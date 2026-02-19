import { Router } from 'express'
import { registerSchema, loginSchema } from '@hello/validation'
import {
  register,
  login,
  logout,
  getCurrentUser,
  uploadAvatar,
  removeAvatar,
} from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth'
import { validateBody } from '../middleware/validate'
import { authRateLimit } from '../middleware/rateLimit'
import { avatarUpload } from '../middleware/upload'

const router = Router()

router.post('/register', authRateLimit, validateBody(registerSchema), register)
router.post('/login', authRateLimit, validateBody(loginSchema), login)
router.post('/logout', logout)
router.get('/me', authMiddleware, getCurrentUser)
router.post('/avatar', authMiddleware, avatarUpload, uploadAvatar)
router.delete('/avatar', authMiddleware, removeAvatar)

export default router
