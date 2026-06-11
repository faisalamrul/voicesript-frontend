import type { User, Menu } from '@/shared/types'

const BASE_URL = 'http://localhost:3000/api/v1'

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: User
    tokens: {
      access_token: string
    }
    allowed_menus: Menu[]
  }
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Login gagal. Periksa kembali email dan password.')
  }

  return json
}

export async function refreshTokenApi(): Promise<{ access_token: string }> {
  const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) throw new Error('Session expired')

  const json = await res.json()
  return json.data ?? json
}

export async function logoutApi(): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    // best-effort — clear local state regardless
  })
}
