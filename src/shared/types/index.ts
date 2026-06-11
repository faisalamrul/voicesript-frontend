export type UserRole = 'admin' | 'reporter' | 'reviewer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Menu {
  id: string
  title: string
  path: string
  icon: string
  label: string
  sort_order: number
}

export interface ApiResponse<T> {
  data: T
  message: string
}
