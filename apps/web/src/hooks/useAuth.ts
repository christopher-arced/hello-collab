import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { AuthResponse, User, RegisterCredentials, LoginCredentials } from '@hello/types'
import { fetcher, ApiError } from '../lib/api'

const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
}

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: user, isLoading: isLoadingUser } = useQuery({
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

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) =>
      fetcher<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      // Tokens are now set as HTTP-only cookies by the backend
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
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
      // Tokens are now set as HTTP-only cookies by the backend
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
      navigate('/')
    },
  })

  const logout = () => {
    // TODO: Call backend logout endpoint once implemented to clear HTTP-only cookies
    queryClient.setQueryData(AUTH_KEYS.user, null)
    queryClient.clear()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoadingUser,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error as ApiError | null,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error as ApiError | null,

    logout,
  }
}
