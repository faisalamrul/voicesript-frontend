import { useMemo } from 'react'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef } from 'mantine-react-table'
import { Badge } from '@mantine/core'
import { IconTrash, IconPencil } from '@tabler/icons-react'
import Swal from 'sweetalert2'
import type { AppUser } from '../types/user.types'
import type { UserRole } from '@/shared/types'

const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  admin:    { label: 'Admin',    color: 'green' },
  reporter: { label: 'Reporter', color: 'blue' },
  reviewer: { label: 'Reviewer', color: 'orange' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface UsersTableProps {
  users: AppUser[]
  onEditRole: (user: AppUser) => void
  onDelete: (id: string) => void
}

export function UsersTable({ users, onEditRole, onDelete }: UsersTableProps) {
  async function handleDelete(user: AppUser) {
    const result = await Swal.fire({
      title: 'Hapus user?',
      text: `${user.name} (${user.email}) akan dihapus permanen.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })
    if (result.isConfirmed) {
      onDelete(user.id)
      Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'User berhasil dihapus.', confirmButtonColor: '#1F3A2F', timer: 1500, timerProgressBar: true })
    }
  }


  const columns = useMemo<MRT_ColumnDef<AppUser>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nama',
        size: 180,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 220,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 120,
        Cell: ({ cell }) => {
          const role = cell.getValue<UserRole>()
          const config = ROLE_CONFIG[role]
          return <Badge color={config.color} variant="light" size="sm">{config.label}</Badge>
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Dibuat',
        size: 130,
        Cell: ({ cell }) => formatDate(cell.getValue<string>()),
      },
      {
        id: 'actions',
        header: 'Aksi',
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditRole(row.original)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary border border-border-base rounded-lg hover:bg-bg-surface transition-colors"
            >
              <IconPencil size={13} />
              Edit Role
            </button>
            <button
              onClick={() => handleDelete(row.original)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              <IconTrash size={13} />
              Hapus
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  const table = useMantineReactTable({
    columns,
    data: users,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    enableColumnFilters: false,
    initialState: { density: 'xs' },
    mantinePaperProps: { shadow: 'none', withBorder: false },
    mantineTableProps: { striped: true, highlightOnHover: true },
  })

  return <MantineReactTable table={table} />
}
