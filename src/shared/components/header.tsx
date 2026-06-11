import { Link } from 'react-router-dom'
import { IconUser } from '@tabler/icons-react'
import { useAuthStore } from '@/store/auth.store'

export function Header() {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="h-16 border-b border-border-base px-6 flex items-center justify-end" style={{ backgroundColor: '#FAFAF8' }}>
      <Link
        to="/profile"
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-bg-surface transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-primary-subtle flex items-center justify-center flex-shrink-0">
          <IconUser size={16} className="text-primary" />
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-text-primary leading-tight">{user?.name}</p>
          <p className="text-xs text-text-tertiary leading-tight capitalize">{user?.role.replace('_', ' ')}</p>
        </div>
      </Link>
    </header>
  )
}
