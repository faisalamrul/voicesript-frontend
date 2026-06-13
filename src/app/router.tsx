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
        path: 'jobs/:jobId',
        lazy: async () => {
          const { JobDetailPage } = await import('@/features/jobs/job-detail.page')
          return { element: <JobDetailPage /> }
        },
      },

      {
        path: 'admin/reporters',
        lazy: async () => {
          const { ReporterListPage } = await import('@/features/reporter-performance/reporter-list.page')
          return { element: <RoleGuard allowedRoles={['admin']}><ReporterListPage /></RoleGuard> }
        },
      },
      {
        path: 'admin/reporters/:reporterId',
        lazy: async () => {
          const { ReporterDetailPage } = await import('@/features/reporter-performance/reporter-detail.page')
          return { element: <RoleGuard allowedRoles={['admin']}><ReporterDetailPage /></RoleGuard> }
        },
      },
      {
        path: 'admin/reporters/:reporterId/jobs/:jobId',
        lazy: async () => {
          const { JobTimelinePage } = await import('@/features/reporter-performance/job-timeline.page')
          return { element: <RoleGuard allowedRoles={['admin']}><JobTimelinePage /></RoleGuard> }
        },
      },
      {
        path: 'admin/editors',
        lazy: async () => {
          const { EditorListPage } = await import('@/features/editor-performance/editor-list.page')
          return { element: <RoleGuard allowedRoles={['admin']}><EditorListPage /></RoleGuard> }
        },
      },
      {
        path: 'admin/editors/:editorId',
        lazy: async () => {
          const { EditorDetailPage } = await import('@/features/editor-performance/editor-detail.page')
          return { element: <RoleGuard allowedRoles={['admin']}><EditorDetailPage /></RoleGuard> }
        },
      },
      {
        path: 'admin/editors/:editorId/jobs/:jobId',
        lazy: async () => {
          const { EditorJobTimelinePage } = await import('@/features/editor-performance/editor-job-timeline.page')
          return { element: <RoleGuard allowedRoles={['admin']}><EditorJobTimelinePage /></RoleGuard> }
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
