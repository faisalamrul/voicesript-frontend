import { useAuthStore } from '@/store/auth.store'
import { refreshTokenApi } from '@/features/auth/api/auth.api'

const BASE_URL = 'http://localhost:3000/api/v1'

export async function apiClient(path: string, options: RequestInit = {}): Promise<Response> {
  const makeRequest = () =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> | undefined),
      },
      credentials: 'include',
    })

  let res = await makeRequest()

  if (res.status === 401) {
    try {
      await refreshTokenApi()
      res = await makeRequest()
    } catch {
      useAuthStore.getState().logout()
      window.location.href = '/auth/login'
    }
  }

  return res
}
