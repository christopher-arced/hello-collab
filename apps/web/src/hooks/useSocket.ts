import { useCallback } from 'react'
import { useSocketContext } from '@/contexts/SocketContext'

export function useSocket() {
  const { socket, isConnected, connectionState, connectionError, joinBoard, leaveBoard } =
    useSocketContext()
  return { socket, isConnected, connectionState, connectionError, joinBoard, leaveBoard }
}

export function useBoardRoom() {
  const { socket, isConnected, joinBoard, leaveBoard } = useSocketContext()

  const on = useCallback(
    <T>(event: string, callback: (data: T) => void) => {
      if (!socket) return () => {}
      socket.on(event, callback)
      return () => {
        socket.off(event, callback)
      }
    },
    [socket]
  )

  return { socket, isConnected, on, joinBoard, leaveBoard }
}
