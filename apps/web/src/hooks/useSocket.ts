import { useEffect, useCallback } from 'react'
import { useSocketContext } from '@/contexts/SocketContext'

export function useSocket() {
  const { socket, isConnected, connectionState, connectionError, joinBoard, leaveBoard } =
    useSocketContext()
  return { socket, isConnected, connectionState, connectionError, joinBoard, leaveBoard }
}

export function useBoardRoom(boardId: string | undefined) {
  const { socket, isConnected, joinBoard, leaveBoard } = useSocketContext()

  useEffect(() => {
    if (!boardId || !isConnected) return

    joinBoard(boardId)

    return () => {
      leaveBoard(boardId)
    }
  }, [boardId, isConnected, joinBoard, leaveBoard])

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

  return { socket, isConnected, on }
}
