import type { BoardMember } from '@hello/types'
import { ConfirmModal } from '@/components/common'

interface ConfirmRemoveModalProps {
  member: BoardMember | null
  isCurrentUser: boolean
  isLoading: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmRemoveModal({
  member,
  isCurrentUser,
  isLoading,
  onConfirm,
  onClose,
}: ConfirmRemoveModalProps) {
  if (!member) return null

  const title = isCurrentUser ? 'Leave Board' : 'Remove Member'
  const confirmText = isCurrentUser ? 'Leave Board' : 'Remove'

  return (
    <ConfirmModal
      isOpen={!!member}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      confirmLabel={confirmText}
      loadingLabel="Removing..."
      isLoading={isLoading}
      variant="danger"
    >
      {isCurrentUser ? (
        'Are you sure you want to leave this board? You will lose access to it.'
      ) : (
        <>
          Are you sure you want to remove{' '}
          <strong className="text-theme-text dark:text-theme-dark-text">{member.user?.name}</strong>{' '}
          from this board?
        </>
      )}
    </ConfirmModal>
  )
}
