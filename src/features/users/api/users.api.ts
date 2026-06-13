import { apiClient } from '@/core/api/api-client'
import type { UserRole } from '@/shared/types'
import type { AppUser } from '../types/user.types'

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
  city: string
}

export interface UsersPagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface UsersData {
  users: AppUser[]
  pagination: UsersPagination
}

export async function fetchUsers(page: number, limit: number): Promise<UsersData> {
  const res = await apiClient(`/admin/users?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Failed to load users.')
  const json = await res.json()
  return json.data
}

export async function createUser(payload: CreateUserPayload): Promise<AppUser> {
  const res = await apiClient('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to create user.')
  return json.data.user
}

export async function updateUserRole(id: string, role: string): Promise<AppUser> {
  const res = await apiClient(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update role.')
  return json.data.user
}
