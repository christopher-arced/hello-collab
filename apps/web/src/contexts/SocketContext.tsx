import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { SOCKET_EVENTS } from '@hello/types'
import { API_BASE_URL } from '@/lib/api'

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

interface SocketContextValue {
  socket: Socket | null
  isConnected: boolean
  connectionState: ConnectionState
  connectionError: string | null
  joinBoard: (boardId: string) => void
  leaveBoard: (boardId: string) => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function useSocketContext(): SocketContextValue {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Track current board for reconnection
  const currentBoardRef = useRef<string | null>(null)

  useEffect(() => {
    // Create socket connection with credentials
    const newSocket = io(API_BASE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    newSocket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('Socket connected:', newSocket.id)
      setConnectionState('connected')
      setConnectionError(null)

      // Rejoin board if we were in one before disconnect
      if (currentBoardRef.current) {
        newSocket.emit(SOCKET_EVENTS.JOIN_BOARD, { boardId: currentBoardRef.current })
      }
    })

    newSocket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('Socket disconnected:', reason)
      setConnectionState('disconnected')

      // Don't show error for intentional disconnects
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        setConnectionError(null)
      }
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      setConnectionState('error')

      // Provide user-friendly error messages
      if (error.message.includes('Authentication')) {
        setConnectionError('Please log in to enable real-time updates')
      } else if (error.message.includes('xhr poll error')) {
        setConnectionError('Unable to connect to server')
      } else {
        setConnectionError(error.message)
      }
    })

    newSocket.on(SOCKET_EVENTS.ERROR, (error: { message: string }) => {
      console.error('Socket error:', error.message)
      // Don't set connectionError for operational errors, just log them
    })

    setSocket(newSocket)

    return () => {
      currentBoardRef.current = null
      newSocket.close()
    }
  }, [])

  const joinBoard = useCallback(
    (boardId: string) => {
      if (socket && connectionState === 'connected') {
        currentBoardRef.current = boardId
        socket.emit(SOCKET_EVENTS.JOIN_BOARD, { boardId })
      }
    },
    [socket, connectionState]
  )

  const leaveBoard = useCallback(
    (boardId: string) => {
      if (socket && connectionState === 'connected') {
        if (currentBoardRef.current === boardId) {
          currentBoardRef.current = null
        }
        socket.emit(SOCKET_EVENTS.LEAVE_BOARD, { boardId })
      }
    },
    [socket, connectionState]
  )

  const isConnected = connectionState === 'connected'

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectionState,
        connectionError,
        joinBoard,
        leaveBoard,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
