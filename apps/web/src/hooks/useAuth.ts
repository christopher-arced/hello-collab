import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { AuthResponse, User, RegisterCredentials, LoginCredentials } from '@hello/types'
import { fetcher, ApiError } from '../lib/api'
import { useAuthStore } from '../stores'

const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
}

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setUser, setLoading, reset } = useAuthStore()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  const { data: fetchedUser, isLoading: isLoadingUser } = useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: async () => {
      try {
        return await fetcher<User>('/api/auth/me')
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null
        }
        throw error
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Sync React Query state with Zustand store
  useEffect(() => {
    if (!isLoadingUser) {
      setUser(fetchedUser ?? null)
    } else {
      setLoading(true)
    }
  }, [fetchedUser, isLoadingUser, setUser, setLoading])

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      fetcher<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
      setUser(data.user)
      navigate('/')
    },
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      fetcher<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
      setUser(data.user)
      navigate('/')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () =>
      fetcher<void>('/api/auth/logout', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.user, null)
      queryClient.clear()
      reset()
      navigate('/login')
    },
    onError: () => {
      queryClient.setQueryData(AUTH_KEYS.user, null)
      queryClient.clear()
      reset()
      navigate('/login')
    },
  })

  return {
    user,
    isAuthenticated,
    isLoading,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error as ApiError | null,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as ApiError | null,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}
