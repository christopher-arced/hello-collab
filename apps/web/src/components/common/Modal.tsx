import { useEffect, useRef, useCallback, ReactNode } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (focusableElements.length === 0) return

    const first = focusableElements[0]
    const last = focusableElements[focusableElements.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      trapFocus(e)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, trapFocus])

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-md mx-4 bg-theme-bg-card dark:bg-theme-dark-bg-card border border-theme-border dark:border-theme-dark-border rounded-2xl shadow-xl outline-none"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border dark:border-theme-dark-border">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-theme-text dark:text-theme-dark-text"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-theme-text-secondary dark:text-theme-dark-text-secondary hover:text-theme-text dark:hover:text-theme-dark-text transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 5L5 15M5 5l10 10" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
