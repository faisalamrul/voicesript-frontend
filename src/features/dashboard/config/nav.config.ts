import {
  IconLayoutDashboard,
  IconFileText,
  IconMicrophone,
  IconSettings,
  IconCreditCard,
  IconUsersGroup,
  IconEye,
} from '@tabler/icons-react'
import type { UserRole } from '@/shared/types'

export type NavItem = { to: string; label: string; icon: React.ElementType; end: boolean }
export type NavGroup = { groupLabel: string; items: NavItem[] }
export type NavSection = NavItem | NavGroup

export function isGroup(section: NavSection): section is NavGroup {
  return 'groupLabel' in section
}

const navConfig: Record<UserRole, NavSection[]> = {
  admin: [
    { to: '/', label: 'Jobs', icon: IconLayoutDashboard, end: true },
    { to: '/reporter', label: 'Reporter', icon: IconFileText, end: false },
    { to: '/reviewer', label: 'Reviewer', icon: IconEye, end: false },
    { to: '/users', label: 'Users', icon: IconUsersGroup, end: false },
    { to: '/record', label: 'Record', icon: IconMicrophone, end: false },
    { to: '/settings', label: 'Settings', icon: IconSettings, end: false },
    {
      groupLabel: 'Finance',
      items: [
        { to: '/payments', label: 'Payments', icon: IconCreditCard, end: false },
      ],
    },
  ],

  reporter: [
    { to: '/', label: 'Jobs', icon: IconLayoutDashboard, end: true },
    { to: '/reporter', label: 'Reporter', icon: IconFileText, end: false },
    { to: '/record', label: 'Record', icon: IconMicrophone, end: false },
  ],

  reviewer: [
    { to: '/', label: 'Jobs', icon: IconLayoutDashboard, end: true },
    { to: '/reviewer', label: 'Reviewer', icon: IconEye, end: false },
    { to: '/record', label: 'Record', icon: IconMicrophone, end: false },
  ],
}

export function getNavByRole(role: UserRole): NavSection[] {
  return navConfig[role]
}
