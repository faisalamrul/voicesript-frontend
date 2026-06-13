import type { UserRole } from '@/shared/types'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  city: string
  created_at: string
}
