import Sidebar from '@/components/common/Sidebar'
import { UserAvatar } from '@/components/common'
import { CreateIcon } from '@/components/icons'
import { useAuthStore } from '@/stores'

const stats = [
  { label: 'Active Boards', value: '12', trend: '+2 this week' },
  { label: 'Total Tasks', value: '64', trend: '8 completed today' },
  { label: 'Team Members', value: '8', trend: '2 online now' },
  { label: 'Due Soon', value: '5', trend: 'Next 3 days' },
]

const boards = [
  { name: 'Product Roadmap', tasks: 24, members: 5, color: '#6366f1' },
  { name: 'Marketing Campaign', tasks: 18, members: 3, color: '#8b5cf6' },
  { name: 'Bug Tracker', tasks: 42, members: 6, color: '#d946ef' },
  { name: 'Design System', tasks: 15, members: 4, color: '#22c55e' },
]

const activities = [
  {
    user: 'Sarah',
    action: 'moved',
    item: '"Update landing page"',
    target: 'In Progress',
    time: '2m ago',
  },
  { user: 'Mike', action: 'completed', item: '"Fix login bug"', target: '', time: '15m ago' },
  { user: 'Emma', action: 'commented on', item: '"API integration"', target: '', time: '1h ago' },
  { user: 'John', action: 'created', item: '"New feature request"', target: '', time: '2h ago' },
]

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-theme-dark-bg flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto">
          {/* Welcome Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[28px] font-semibold text-theme-dark-text">
                Good afternoon, {firstName}
              </h1>
              <p className="text-[15px] text-theme-dark-text-secondary mt-2">
                Here's what's happening with your projects today.
              </p>
            </div>
            <button
              type="button"
              className="px-5 py-3 bg-theme-gradient border-none rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center gap-2 shadow-accent-glow-dark hover:opacity-90 transition-opacity"
            >
              <CreateIcon size={16} /> New Board
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-theme-dark-bg-card border border-theme-dark-border rounded-2xl p-5"
              >
                <p className="text-sm text-theme-dark-text-secondary mb-1">{stat.label}</p>
                <p className="text-[32px] font-semibold text-theme-dark-text">{stat.value}</p>
                <p className="text-xs text-theme-dark-text-muted mt-1">{stat.trend}</p>
              </div>
            ))}
          </div>

          {/* Boards Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-theme-dark-text">Your Boards</h2>
              <button
                type="button"
                className="text-sm text-theme-dark-accent hover:text-theme-dark-accent-hover transition-colors bg-transparent border-none cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {boards.map((board) => (
                <button
                  type="button"
                  key={board.name}
                  className="bg-theme-dark-bg-card border border-theme-dark-border rounded-2xl p-5 cursor-pointer hover:border-theme-dark-border-hover transition-colors text-left"
                  aria-label={`Open ${board.name} board`}
                >
                  <div
                    className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: board.color }}
                    aria-hidden="true"
                  >
                    {board.name?.[0] || '?'}
                  </div>
                  <h3 className="text-base font-medium text-theme-dark-text mb-2">{board.name}</h3>
                  <div className="flex items-center justify-between text-sm text-theme-dark-text-secondary">
                    <span>{board.tasks} tasks</span>
                    <span>{board.members} members</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-theme-dark-text mb-4">Recent Activity</h2>
            <div className="bg-theme-dark-bg-card border border-theme-dark-border rounded-2xl divide-y divide-theme-dark-border">
              {activities.map((activity, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-3">
                  <UserAvatar name={activity.user} />
                  <p className="flex-1 text-sm text-theme-dark-text-secondary">
                    <span className="text-theme-dark-text font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="text-theme-dark-accent">{activity.item}</span>
                    {activity.target && (
                      <>
                        {' '}
                        to <span className="text-theme-dark-text">{activity.target}</span>
                      </>
                    )}
                  </p>
                  <span className="text-xs text-theme-dark-text-muted">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
