import { createBrowserRouter, Navigate } from 'react-router-dom'
import { DashboardLayout } from './layouts/dashboard-layout'
import { AuthLayout } from './layouts/auth-layout'
import { AuthGuard } from '@/core/guards/auth.guard'
import { RoleGuard } from '@/core/guards/role.guard'
import { GuestGuard } from '@/core/guards/guest.guard'
import { LoginPage } from '@/features/auth/login/login.page'
import { RegisterPage } from '@/features/auth/register/register.page'
import { ForbiddenPage } from '@/shared/components/forbidden.page'
import { NotFoundPage } from '@/shared/components/not-found.page'
import { JobsPage } from '@/features/jobs/jobs.page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/jobs" replace /> },

      { path: 'jobs', element: <JobsPage /> },

      {
        path: 'admin/reporters',
        lazy: async () => {
          const { ReporterPage } = await import('@/features/reporter/reporter.page')
          return {
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <ReporterPage />
              </RoleGuard>
            ),
          }
        },
      },
      {
        path: 'admin/editors',
        lazy: async () => {
          const { EditorPage } = await import('@/features/editor/editor.page')
          return {
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <EditorPage />
              </RoleGuard>
            ),
          }
        },
      },
      {
        path: 'admin/users',
        lazy: async () => {
          const { UsersPage } = await import('@/features/users/users.page')
          return {
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <UsersPage />
              </RoleGuard>
            ),
          }
        },
      },
      {
        path: 'finance/payments',
        lazy: async () => {
          const { PaymentsPage } = await import('@/features/payments/payments.page')
          return {
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <PaymentsPage />
              </RoleGuard>
            ),
          }
        },
      },
      {
        path: 'earnings',
        lazy: async () => {
          const { EarningsPage } = await import('@/features/earnings/earnings.page')
          return { element: <EarningsPage /> }
        },
      },
      {
        path: 'record',
        lazy: async () => {
          const { RecordPage } = await import('@/features/record/record.page')
          return { element: <RecordPage /> }
        },
      },
      {
        path: 'settings',
        lazy: async () => {
          const { SettingsPage } = await import('@/features/settings/settings.page')
          return {
            element: (
              <RoleGuard allowedRoles={['admin']}>
                <SettingsPage />
              </RoleGuard>
            ),
          }
        },
      },
      {
        path: 'profile',
        lazy: async () => {
          const { ProfilePage } = await import('@/features/profile/profile.page')
          return { element: <ProfilePage /> }
        },
      },
    ],
  },
  {
    path: '/auth',
    element: <GuestGuard><AuthLayout /></GuestGuard>,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
])
