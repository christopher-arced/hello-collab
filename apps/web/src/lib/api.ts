import type { ApiResponse } from '@hello/types'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  details?: Record<string, string[]>

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('accessToken')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data: ApiResponse<T> = await response.json()

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error || 'Request failed',
      response.status,
      data.details
    )
  }

  return data.data as T
}
