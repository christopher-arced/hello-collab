import { ReactNode } from 'react'
import Modal from './Modal'
import Button from './Button'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  children: ReactNode
  confirmLabel?: string
  loadingLabel?: string
  isLoading?: boolean
  variant?: 'danger' | 'primary'
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  loadingLabel,
  isLoading = false,
  variant = 'danger',
}: ConfirmModalProps) => {
  const variantClasses = variant === 'danger' ? '!bg-red-500 hover:!bg-red-600' : ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-theme-text-secondary dark:text-theme-dark-text-secondary mb-6">
        {children}
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          loading={isLoading}
          onClick={onConfirm}
          className={`flex-1 ${variantClasses}`}
        >
          {isLoading ? (loadingLabel ?? confirmLabel) : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmModal
