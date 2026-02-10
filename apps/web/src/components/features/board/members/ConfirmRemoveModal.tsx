import type { BoardMember } from '@hello/types'
import { Modal, Button } from '@/components/common'

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
    <Modal isOpen={!!member} onClose={onClose} title={title}>
      <p className="text-theme-text-secondary dark:text-theme-dark-text-secondary mb-6">
        {isCurrentUser ? (
          'Are you sure you want to leave this board? You will lose access to it.'
        ) : (
          <>
            Are you sure you want to remove{' '}
            <strong className="text-theme-text dark:text-theme-dark-text">
              {member.user?.name}
            </strong>{' '}
            from this board?
          </>
        )}
      </p>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          loading={isLoading}
          onClick={onConfirm}
          className="flex-1 !bg-red-500 hover:!bg-red-600"
        >
          {isLoading ? 'Removing...' : confirmText}
        </Button>
      </div>
    </Modal>
  )
}
