const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? 'Request failed')
  }

  return res.json() as Promise<T>
}

export const apiService = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: 'GET', ...init }),

  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), ...init }),

  put: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), ...init }),

  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: 'DELETE', ...init }),
}
