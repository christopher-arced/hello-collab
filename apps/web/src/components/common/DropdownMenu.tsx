import { useState, useRef, useEffect } from 'react'
import { MoreHorizontalIcon } from '../icons'

export interface DropdownMenuItem {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'danger'
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[]
  triggerSize?: number
  triggerClassName?: string
  menuWidth?: string
  ariaLabel?: string
  onMenuOpen?: () => void
}

export default function DropdownMenu({
  items,
  triggerSize = 16,
  triggerClassName,
  menuWidth = 'w-40',
  ariaLabel = 'Options',
  onMenuOpen,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleScroll = () => setIsOpen(false)
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  const handleTriggerClick = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 11,
        left: rect.right,
      })
    }
    setIsOpen(!isOpen)
    onMenuOpen?.()
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        className={
          triggerClassName ??
          'p-1.5 rounded transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        aria-label={ariaLabel}
      >
        <MoreHorizontalIcon size={triggerSize} />
      </button>

      {isOpen && (
        <div
          className={`fixed ${menuWidth} rounded-lg z-50 overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg`}
          style={{ top: position.top, left: position.left }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setIsOpen(false)
                item.onClick()
              }}
              disabled={item.disabled}
              className={`w-full px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${
                item.variant === 'danger'
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
