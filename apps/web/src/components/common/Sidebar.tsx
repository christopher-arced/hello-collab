import { Link, useLocation } from 'react-router-dom'
import { useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore, useThemeStore } from '@/stores'
import Logo from '../features/auth/Logo'
import { Avatar } from './Avatar'
import { API_BASE_URL } from '@/lib/api'
import { HomeIcon, NotificationsIcon, SettingsIcon, MoonIcon, SunIcon, LogoutIcon } from '../icons'

interface NavLink {
  icon: React.FC
  label: string
  path: string
}

interface NavAction {
  icon: React.FC
  label: string
  badge?: number
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navLinks: NavLink[] = [{ icon: HomeIcon, label: 'Home', path: '/' }]

const navActions: NavAction[] = [
  { icon: NotificationsIcon, label: 'Notifications', badge: 3 },
  { icon: SettingsIcon, label: 'Settings' },
]

const baseButtonStyles =
  'w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-200 ease-in-out'

const inactiveStyles =
  'text-theme-text-secondary dark:text-theme-dark-text-secondary hover:text-theme-text dark:hover:text-theme-dark-text hover:bg-theme-bg-hover dark:hover:bg-theme-dark-bg-hover'
const activeStyles = 'bg-theme-accent dark:bg-theme-dark-accent text-white'

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { logout, uploadAvatar, isUploadingAvatar } = useAuth()
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { resolvedTheme, toggleTheme } = useThemeStore()
  const location = useLocation()

  const isActive = useCallback(
    (path: string) => {
      if (path === '/') return location.pathname === '/'
      return location.pathname.startsWith(path)
    },
    [location.pathname]
  )

  const handleNavClick = () => {
    onClose?.()
  }

  const sidebarContent = (
    <aside
      className={`w-[72px] min-h-screen bg-theme-bg-secondary dark:bg-theme-dark-bg-secondary border-r border-solid border-theme-border dark:border-theme-dark-border flex flex-col items-center py-4 gap-2 ${
        onClose
          ? 'fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ' +
            (isOpen ? 'translate-x-0' : '-translate-x-full')
          : 'hidden md:flex'
      }`}
    >
      <Logo size="sm" showText={false} />

      <nav className="flex flex-col items-center gap-2">
        {navLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.label}
            title={item.label}
            className={`${baseButtonStyles} ${isActive(item.path) ? activeStyles : inactiveStyles}`}
            onClick={handleNavClick}
          >
            <item.icon />
          </Link>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-2">
        {navActions.map((item) => (
          <button
            key={item.label}
            aria-label={item.label}
            title={item.label}
            className={`${baseButtonStyles} ${inactiveStyles} border-none bg-transparent cursor-pointer`}
          >
            <item.icon />
            {item.badge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-theme-danger dark:bg-theme-dark-danger rounded-full text-[10px] font-semibold text-white flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      <button
        aria-label="Toggle theme"
        title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
        className={`${baseButtonStyles} ${inactiveStyles} border-none bg-transparent cursor-pointer`}
      >
        {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
      </button>

      <button
        type="button"
        aria-label="Change avatar"
        title={user?.name ?? 'User'}
        onClick={() => fileInputRef.current?.click()}
        className={`border-none bg-transparent p-0 cursor-pointer rounded-full ${isUploadingAvatar ? 'opacity-50' : ''}`}
        disabled={isUploadingAvatar}
      >
        <Avatar
          name={user?.name ?? 'User'}
          avatarUrl={user?.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null}
          size="md"
        />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            uploadAvatar(file)
            e.target.value = ''
          }
        }}
      />

      <button
        aria-label="Logout"
        title="Logout"
        onClick={() => logout()}
        className={`${baseButtonStyles} border-none bg-transparent cursor-pointer text-theme-text-secondary dark:text-theme-dark-text-secondary hover:text-theme-danger dark:hover:text-theme-dark-danger hover:bg-theme-bg-hover dark:hover:bg-theme-dark-bg-hover`}
      >
        <LogoutIcon />
      </button>
    </aside>
  )

  // When controlled (has onClose), render with a backdrop on mobile
  if (onClose) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        {sidebarContent}
      </>
    )
  }

  // Uncontrolled: always visible on desktop, hidden on mobile (original behavior)
  return sidebarContent
}

export default Sidebar
