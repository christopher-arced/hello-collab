import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  )
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.get('/api', (_req, res) => {
    res.json({ message: 'HelloCollab API - Real-time Task Management' })
  })

  app.use('/api/auth', authRoutes)

  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      // eslint-disable-next-line no-console
      console.error(err.stack)
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      })
    }
  )

  return app
}
