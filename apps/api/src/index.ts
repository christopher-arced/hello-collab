import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { createApp } from './app'

dotenv.config()

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const app = createApp()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})

io.on('connection', (socket) => {
  // eslint-disable-next-line no-console
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    // eslint-disable-next-line no-console
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3000

// eslint-disable-next-line no-console
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

export { app, io }
