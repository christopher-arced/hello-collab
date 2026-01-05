import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api', (_req, res) => {
  res.json({ message: 'HelloCollab API - Real-time Task Management' })
})

app.use('/api/auth', authRoutes)

io.on('connection', (socket) => {
  // eslint-disable-next-line no-console
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    // eslint-disable-next-line no-console
    console.log('Client disconnected:', socket.id)
  })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err.stack)
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

const PORT = process.env.PORT || 3000

// eslint-disable-next-line no-console
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

export { app, io }
