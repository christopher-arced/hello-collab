import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '@/components/common/Sidebar'
import { UserAvatar } from '@/components/common'
import { CreateIcon } from '@/components/icons'
import { useAuthStore } from '@/stores'
import { useBoards } from '@/hooks/useBoards'
import CreateBoardModal from '@/components/features/boards/CreateBoardModal'

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { boards, isLoading } = useBoards()
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="h-screen max-h-screen bg-theme-bg dark:bg-theme-dark-bg flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto">
          {/* Welcome Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-[28px] font-semibold text-theme-text dark:text-theme-dark-text">
                Good afternoon, {firstName}
              </h1>
              <p className="text-[15px] text-theme-text-secondary dark:text-theme-dark-text-secondary mt-2">
                Here's what's happening with your projects today.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 bg-theme-gradient border-none rounded-[10px] text-white text-sm font-medium cursor-pointer flex items-center gap-2 shadow-accent-glow-dark hover:opacity-90 transition-opacity"
            >
              <CreateIcon size={16} /> New Board
            </button>
          </div>

          {/* Boards Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-theme-text dark:text-theme-dark-text mb-4">
              Recent Boards
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden animate-pulse">
                    <div className="h-24 bg-black/10 dark:bg-white/10" />
                    <div className="bg-theme-bg-card dark:bg-theme-dark-bg-card p-4">
                      <div className="h-5 bg-black/10 dark:bg-white/10 rounded mb-3 w-3/4" />
                      <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {boards.map((board) => (
                    <button
                      type="button"
                      key={board.id}
                      onClick={() => navigate(`/board/${board.id}`)}
                      className="rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl dark:shadow-black/20 dark:hover:shadow-accent-glow-dark hover:-translate-y-1 transition-all duration-200 text-left group"
                      aria-label={`Open ${board.title} board`}
                    >
                      <div
                        className="h-24 w-full transition-opacity group-hover:opacity-90"
                        style={{ backgroundColor: board.bgColor }}
                        aria-hidden="true"
                      />
                      <div className="bg-theme-bg-card dark:bg-theme-dark-bg-card p-4">
                        <h3 className="text-[15px] font-semibold text-theme-text dark:text-theme-dark-text mb-3">
                          {board.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex -space-x-1.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-theme-bg-card dark:border-theme-dark-bg-card" />
                              <div className="w-5 h-5 rounded-full bg-green-500 border-2 border-theme-bg-card dark:border-theme-dark-bg-card" />
                              <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-theme-bg-card dark:border-theme-dark-bg-card" />
                            </div>
                            {(board.members?.length ?? 0) > 3 && (
                              <span className="ml-1.5 text-xs text-theme-text-muted dark:text-theme-dark-text-muted">
                                +{(board.members?.length ?? 0) - 3}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-theme-text-muted dark:text-theme-dark-text-muted">
                            {board.lists?.reduce(
                              (acc, list) => acc + (list.cards?.length ?? 0),
                              0
                            ) ?? 0}{' '}
                            cards
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Create new board card */}
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="rounded-xl border-2 border-dashed border-theme-border dark:border-theme-dark-border hover:border-theme-text-muted dark:hover:border-theme-dark-text-muted transition-colors cursor-pointer bg-transparent flex flex-col items-center justify-center min-h-[156px]"
                    aria-label="Create new board"
                  >
                    <div className="w-10 h-10 rounded-full bg-theme-text-muted/20 dark:bg-theme-dark-text-muted/20 flex items-center justify-center mb-3">
                      <CreateIcon
                        size={20}
                        className="text-theme-text-muted dark:text-theme-dark-text-muted"
                      />
                    </div>
                    <span className="text-sm text-theme-text-muted dark:text-theme-dark-text-muted">
                      Create new board
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-theme-text dark:text-theme-dark-text mb-4">
              Recent Activity
            </h2>
            <div className="bg-theme-bg-card dark:bg-theme-dark-bg-card border border-theme-border dark:border-theme-dark-border rounded-2xl divide-y divide-theme-border dark:divide-theme-dark-border">
              {activities.map((activity, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-3">
                  <UserAvatar name={activity.user} />
                  <p className="flex-1 text-sm text-theme-text-secondary dark:text-theme-dark-text-secondary">
                    <span className="text-theme-text dark:text-theme-dark-text font-medium">
                      {activity.user}
                    </span>{' '}
                    {activity.action}{' '}
                    <span className="text-theme-accent dark:text-theme-dark-accent">
                      {activity.item}
                    </span>
                    {activity.target && (
                      <>
                        {' '}
                        to{' '}
                        <span className="text-theme-text dark:text-theme-dark-text">
                          {activity.target}
                        </span>
                      </>
                    )}
                  </p>
                  <span className="text-xs text-theme-text-muted dark:text-theme-dark-text-muted">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <CreateBoardModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  )
}
