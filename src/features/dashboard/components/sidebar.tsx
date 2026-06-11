import { NavLink, useNavigate } from 'react-router-dom'
import {
  IconGavel,
  IconChevronRight,
  IconLogout,
  IconLayoutDashboard,
  IconUsersGroup,
  IconList,
  IconSettings,
  IconPencil,
  IconFileText,
  IconMicrophone,
  IconCreditCard,
  IconEye,
  IconHome,
  IconBriefcase,
  IconWallet,
  IconChartBar,
} from '@tabler/icons-react'
import { useAuthStore } from '@/store/auth.store'
import { logoutApi } from '@/features/auth/api/auth.api'
import type { Menu } from '@/shared/types'

const ICON_MAP: Record<string, React.ElementType> = {
  'home-icon': IconHome,
  'dashboard-icon': IconLayoutDashboard,
  'users-icon': IconUsersGroup,
  'list-icon': IconList,
  'settings-icon': IconSettings,
  'edit-icon': IconPencil,
  'file-icon': IconFileText,
  'microphone-icon': IconMicrophone,
  'payment-icon': IconCreditCard,
  'eye-icon': IconEye,
  'briefcase-icon': IconBriefcase,
  'wallet-icon': IconWallet,
  'chart-icon': IconChartBar,
}

function MenuLink({ menu }: { menu: Menu }) {
  const Icon = ICON_MAP[menu.icon] ?? IconLayoutDashboard

  return (
    <NavLink
      to={menu.path}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-white text-text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary hover:bg-black/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={16}
            className={isActive ? 'text-primary' : 'text-text-tertiary group-hover:text-text-secondary'}
          />
          <span className="flex-1">{menu.title}</span>
          {isActive && <IconChevronRight size={14} className="text-text-tertiary" />}
        </>
      )}
    </NavLink>
  )
}

function groupMenusByLabel(menus: Menu[]): Map<string, Menu[]> {
  const sorted = [...menus].sort((a, b) => a.sort_order - b.sort_order)
  const grouped = new Map<string, Menu[]>()
  for (const menu of sorted) {
    if (!grouped.has(menu.label)) grouped.set(menu.label, [])
    grouped.get(menu.label)!.push(menu)
  }
  return grouped
}

export function Sidebar() {
  const { user, allowedMenus, logout } = useAuthStore()
  const navigate = useNavigate()

  const grouped = groupMenusByLabel(allowedMenus)

  async function handleLogout() {
    await logoutApi()
    logout()
    navigate('/auth/login')
  }

  return (
    <aside className="w-64 h-screen flex flex-col bg-bg-surface">
      <div className="px-6 py-7 flex items-center gap-2">
        <IconGavel size={18} className="text-primary" />
        <span className="text-lg font-bold tracking-tight text-text-primary">VoiceScript</span>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {Array.from(grouped.entries()).map(([label, menus], groupIndex) => (
          <div key={label} className={groupIndex > 0 ? 'mt-4' : ''}>
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-text-tertiary">
              {label}
            </p>
            <div className="space-y-0.5">
              {menus.map((menu) => (
                <MenuLink key={menu.id} menu={menu} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border-base">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
          <p className="text-xs text-text-tertiary truncate capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <IconLogout size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
