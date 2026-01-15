import { Link, useLocation } from 'react-router-dom'
import { useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore, useThemeStore } from '@/stores'
import { getInitials } from '@/utils'
import Logo from '../features/auth/Logo'
import {
  HomeIcon,
  BoardsIcon,
  NotificationsIcon,
  SettingsIcon,
  MoonIcon,
  SunIcon,
  LogoutIcon,
} from '../icons'

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

const navLinks: NavLink[] = [
  { icon: HomeIcon, label: 'Home', path: '/' },
  { icon: BoardsIcon, label: 'Boards', path: '/boards' },
]

const navActions: NavAction[] = [
  { icon: NotificationsIcon, label: 'Notifications', badge: 3 },
  { icon: SettingsIcon, label: 'Settings' },
]

const baseButtonStyles =
  'w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-200 ease-in-out'

const inactiveStyles =
  'text-theme-text-secondary dark:text-theme-dark-text-secondary hover:text-theme-text dark:hover:text-theme-dark-text hover:bg-theme-bg-hover dark:hover:bg-theme-dark-bg-hover'
const activeStyles = 'bg-theme-accent dark:bg-theme-dark-accent text-white'

const Sidebar = () => {
  const { logout } = useAuth()
  const { user } = useAuthStore()
  const { resolvedTheme, toggleTheme } = useThemeStore()
  const location = useLocation()

  const isActive = useCallback(
    (path: string) => {
      if (path === '/') return location.pathname === '/'
      return location.pathname.startsWith(path)
    },
    [location.pathname]
  )

  return (
    <aside className="w-[72px] min-h-screen bg-theme-bg-secondary dark:bg-theme-dark-bg-secondary border-r border-solid border-theme-border dark:border-theme-dark-border flex flex-col items-center py-4 gap-2">
      <Logo size="sm" showText={false} />

      <nav className="flex flex-col items-center gap-2">
        {navLinks.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            aria-label={item.label}
            title={item.label}
            className={`${baseButtonStyles} ${isActive(item.path) ? activeStyles : inactiveStyles}`}
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

      <div
        className="w-11 h-11 bg-theme-gradient rounded-full flex items-center justify-center text-sm font-semibold text-white cursor-pointer"
        title={user?.name ?? 'User'}
      >
        {user?.name ? getInitials(user.name) : '??'}
      </div>

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
}

export default Sidebar
