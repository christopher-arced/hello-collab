import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">HelloCollab</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.name}!</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl mb-4">Your Boards</h2>
        {/* Board list will go here */}
      </main>
    </div>
  )
}
