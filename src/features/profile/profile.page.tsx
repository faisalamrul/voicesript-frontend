import { useAuthStore } from '@/store/auth.store'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { IconUser } from '@tabler/icons-react'

export function ProfilePage() {
  useDocumentTitle('Profile')
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold text-text-primary">Profile</h1>
      <p className="mt-2 text-text-secondary">Your account details.</p>

      <div className="mt-8 bg-white border border-border-base rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-subtle flex items-center justify-center flex-shrink-0">
            <IconUser size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{user?.name}</p>
            <p className="text-sm text-text-secondary">{user?.email}</p>
            <span className="mt-1 inline-block text-xs font-medium bg-accent-subtle text-accent-hover px-2 py-0.5 rounded-full capitalize">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
