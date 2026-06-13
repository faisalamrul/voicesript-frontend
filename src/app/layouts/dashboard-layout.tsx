import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/features/dashboard/components/sidebar'
import { Header } from '@/shared/components/header'

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
