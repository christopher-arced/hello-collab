import { useState, useRef, useEffect, useCallback } from 'react'
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
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setFocusedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handleScroll = () => {
      setIsOpen(false)
      setFocusedIndex(-1)
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [isOpen])

  // Focus the active menu item when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus()
    }
  }, [isOpen, focusedIndex])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          setFocusedIndex((prev) => {
            let next = prev + 1
            while (next < items.length && items[next].disabled) next++
            return next < items.length ? next : prev
          })
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          setFocusedIndex((prev) => {
            let next = prev - 1
            while (next >= 0 && items[next].disabled) next--
            return next >= 0 ? next : prev
          })
          break
        }
        case 'Escape': {
          e.preventDefault()
          setIsOpen(false)
          setFocusedIndex(-1)
          triggerRef.current?.focus()
          break
        }
        case 'Home': {
          e.preventDefault()
          const firstEnabled = items.findIndex((item) => !item.disabled)
          if (firstEnabled >= 0) setFocusedIndex(firstEnabled)
          break
        }
        case 'End': {
          e.preventDefault()
          for (let i = items.length - 1; i >= 0; i--) {
            if (!items[i].disabled) {
              setFocusedIndex(i)
              break
            }
          }
          break
        }
      }
    },
    [isOpen, items]
  )

  const handleTriggerClick = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 11,
        left: rect.right,
      })
    }
    if (isOpen) {
      setFocusedIndex(-1)
    } else {
      // Focus first enabled item when opening
      const firstEnabled = items.findIndex((item) => !item.disabled)
      setFocusedIndex(firstEnabled >= 0 ? firstEnabled : -1)
    }
    setIsOpen(!isOpen)
    onMenuOpen?.()
  }

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault()
        handleTriggerClick()
      }
    }
  }

  return (
    <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className={
          triggerClassName ??
          'p-1.5 rounded transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreHorizontalIcon size={triggerSize} />
      </button>

      {isOpen && (
        <div
          className={`fixed ${menuWidth} rounded-lg z-50 overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg`}
          style={{ top: position.top, left: position.left }}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={item.label}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              role="menuitem"
              tabIndex={focusedIndex === index ? 0 : -1}
              onClick={() => {
                setIsOpen(false)
                setFocusedIndex(-1)
                item.onClick()
              }}
              disabled={item.disabled}
              className={`w-full px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
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
