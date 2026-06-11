import { useState } from 'react'
import type { AppUser } from '../types/user.types'
import type { UserRole } from '@/shared/types'

const MOCK_USERS: AppUser[] = [
  { id: '1', name: 'Super Admin', email: 'admin@voicescript.com', role: 'admin', created_at: '2026-01-01T00:00:00.000Z' },
  { id: '2', name: 'Budi Santoso', email: 'budi@voicescript.com', role: 'reporter', created_at: '2026-02-10T08:30:00.000Z' },
  { id: '3', name: 'Rina Marlina', email: 'rina@voicescript.com', role: 'reviewer', created_at: '2026-02-15T09:00:00.000Z' },
  { id: '4', name: 'Ahmad Fauzi', email: 'ahmad@voicescript.com', role: 'reporter', created_at: '2026-03-01T10:00:00.000Z' },
  { id: '5', name: 'Dewi Kusuma', email: 'dewi@voicescript.com', role: 'reporter', created_at: '2026-03-20T11:00:00.000Z' },
  { id: '6', name: 'Hendra Wijaya', email: 'hendra@voicescript.com', role: 'reviewer', created_at: '2026-04-05T13:00:00.000Z' },
]

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS)

  function addUser(data: Omit<AppUser, 'id' | 'created_at'>) {
    const newUser: AppUser = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    setUsers((prev) => [newUser, ...prev])
  }

  function updateRole(id: string, role: UserRole) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
  }

  function deleteUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return { users, addUser, updateRole, deleteUser }
}
