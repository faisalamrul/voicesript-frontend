import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/shared/types'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user)

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}
