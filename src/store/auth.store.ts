import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Menu } from '@/shared/types'

interface AuthState {
  user: User | null
  allowedMenus: Menu[]
  isAuthenticated: boolean
  login: (payload: { user: User; allowedMenus: Menu[] }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      allowedMenus: [],
      isAuthenticated: false,
      login: ({ user, allowedMenus }) =>
        set({ user, allowedMenus, isAuthenticated: true }),
      logout: () =>
        set({ user: null, allowedMenus: [], isAuthenticated: false }),
    }),
    {
      name: 'auth',
      version: 3,
      migrate: () => ({
        user: null,
        allowedMenus: [],
        isAuthenticated: false,
      }),
    },
  ),
)
