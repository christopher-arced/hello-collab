import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import BoardPage from './pages/BoardPage'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { GuestRoute } from './components/routing/GuestRoute'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { SocketProvider } from './contexts/SocketContext'
import { ErrorBoundary } from './components/common'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/board/:id"
                  element={
                    <ProtectedRoute>
                      <BoardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </ThemeProvider>
      </SocketProvider>
    </QueryClientProvider>
  )
}

export default App
