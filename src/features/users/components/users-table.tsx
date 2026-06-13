import { useMemo, useState } from 'react'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_PaginationState } from 'mantine-react-table'
import { IconUser, IconMail, IconCalendar, IconShield } from '@tabler/icons-react'
import { useUsers } from '../hooks/use-users'
import type { AppUser } from '../types/user.types'
import type { UserRole } from '@/shared/types'

const ROLE_CONFIG: Record<UserRole, { label: string; dot: string; text: string; bg: string; rowBorder: string }> = {
  admin:    { label: 'Admin',    dot: 'bg-green-400',  text: 'text-green-700',  bg: 'bg-green-50',  rowBorder: '#22c55e' },
  reporter: { label: 'Reporter', dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50',   rowBorder: '#3b82f6' },
  editor:   { label: 'Editor',   dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50', rowBorder: '#f97316' },
}

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role] ?? { label: role, dot: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-50', rowBorder: '#9ca3af' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface UsersTableProps {
  onEditRole: (user: AppUser) => void
  currentUserId?: string
}

export function UsersTable({ onEditRole, currentUserId }: UsersTableProps) {
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading, isError, isFetching } = useUsers(
    pagination.pageIndex + 1,
    pagination.pageSize,
  )

  const columns = useMemo<MRT_ColumnDef<AppUser>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        Cell: ({ cell }) => (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-subtle flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <IconUser size={14} className="text-primary" />
            </div>
            <span className="font-medium text-text-primary text-sm">{cell.getValue<string>()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 230,
        Cell: ({ cell }) => (
          <div className="flex items-center gap-1.5 text-text-secondary">
            <IconMail size={13} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
            <span className="text-xs">{cell.getValue<string>()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 130,
        Cell: ({ cell }) => <RoleBadge role={cell.getValue<UserRole>()} />,
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 130,
        Cell: ({ cell }) => (
          <div className="flex items-center gap-1.5 text-text-secondary">
            <IconCalendar size={13} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
            <span className="text-xs">{formatDate(cell.getValue<string>())}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 130,
        enableSorting: false,
        Cell: ({ row }) => {
          const isSelf = row.original.id === currentUserId
          const isAdmin = row.original.role === 'admin'
          const restricted = isSelf || isAdmin
          const restrictReason = isSelf
            ? 'Cannot edit your own account'
            : isAdmin
            ? 'Cannot edit Admin users'
            : undefined
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => !restricted && onEditRole(row.original)}
                aria-disabled={restricted}
                aria-describedby={restricted ? `restrict-${row.original.id}` : undefined}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary border border-border-base rounded-lg hover:bg-bg-surface transition-colors ${restricted ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <IconShield size={13} aria-hidden="true" />
                Edit Role
              </button>
              {restricted && (
                <span id={`restrict-${row.original.id}`} className="sr-only">{restrictReason}</span>
              )}
            </div>
          )
        },
      },
    ],
    [onEditRole, currentUserId],
  )

  const table = useMantineReactTable({
    columns,
    data: data?.users ?? [],
    manualPagination: true,
    rowCount: data?.pagination.total ?? 0,
    onPaginationChange: setPagination,
    state: {
      pagination,
      isLoading,
      showProgressBars: isFetching,
      showAlertBanner: isError,
    },
    mantineToolbarAlertBannerProps: isError
      ? { color: 'red', children: 'Failed to load users.' }
      : undefined,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    enableColumnFilters: false,
    initialState: { density: 'xs' },
    mantinePaperProps: { shadow: 'none', withBorder: false },
    mantineTableProps: { striped: true, highlightOnHover: true },
    mantineTableHeadCellProps: {
      style: {
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--color-text-tertiary)',
        borderBottom: '1px solid var(--color-border-base)',
        paddingTop: '10px',
        paddingBottom: '10px',
      },
    },
    mantineTableBodyRowProps: ({ row }) => {
      const cfg = ROLE_CONFIG[row.original.role]
      return {
        style: {
          borderLeft: `3px solid ${cfg?.rowBorder ?? 'transparent'}`,
        },
      }
    },
  })

  return <MantineReactTable table={table} />
}
