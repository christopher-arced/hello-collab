import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { apiRateLimit } from './middleware/rateLimit'
import authRoutes from './routes/auth'
import boardsRoutes from './routes/boards'
import boardMembersRoutes from './routes/boardMembers'
import listsRoutes from './routes/lists'
import cardsRoutes from './routes/cards'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    throw new Error('CORS_ORIGIN environment variable is required in production')
  }
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'

  app.use(
    cors({
      origin: corsOrigin,
      credentials: true,
    })
  )
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/api', apiRateLimit)
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get('/api', (_req, res) => {
    res.json({ message: 'HelloCollab API - Real-time Task Management' })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/boards', boardsRoutes)
  app.use('/api/boards', boardMembersRoutes)
  app.use('/api', listsRoutes)
  app.use('/api', cardsRoutes)

  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error(err.stack)
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      })
    }
  )

  return app
}
