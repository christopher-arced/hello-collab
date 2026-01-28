import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Role } from '@hello/types'
import { ChevronDownIcon } from '@/components/icons'
import { ROLE_CONFIG, ALL_ROLES } from '@/constants/roles'

interface RoleSelectorProps {
  currentRole: Role
  onRoleChange: (role: Role) => void
  disabled?: boolean
}

export function RoleSelector({ currentRole, onRoleChange, disabled = false }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.right,
      })
    }
    setIsOpen(!isOpen)
  }

  const config = ROLE_CONFIG[currentRole]

  const dropdown = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          style={{ top: position.top, left: position.left }}
          className="fixed -translate-x-full bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-lg shadow-lg z-50 py-1 min-w-[100px]"
        >
          {ALL_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                onRoleChange(role)
                setIsOpen(false)
              }}
              disabled={disabled}
              className={`w-full px-3 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 ${
                currentRole === role
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-theme-text dark:text-theme-dark-text'
              }`}
            >
              {ROLE_CONFIG[role].label}
            </button>
          ))}
        </div>,
        document.body
      )
    : null

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`px-2 py-1 rounded text-xs font-medium ${config.colorClass} hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1`}
      >
        {config.label}
        <ChevronDownIcon size={12} />
      </button>
      {dropdown}
    </div>
  )
}
