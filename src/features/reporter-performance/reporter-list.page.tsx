import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_PaginationState } from 'mantine-react-table'
import { IconEye, IconSearch } from '@tabler/icons-react'
import { useReporterList } from './hooks/use-reporter-list'
import type { ReporterListItem } from './types/reporter-performance.types'

function AvailabilityBadge({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">On Job</span>
    : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Available</span>
}

export function ReporterListPage() {
  const navigate = useNavigate()

  const [pagination, setPagination]           = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch]                   = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearch])

  const { data, isLoading, isError, isFetching } = useReporterList(
    pagination.pageIndex + 1,
    pagination.pageSize,
    debouncedSearch || undefined,
  )

  const columns = useMemo<MRT_ColumnDef<ReporterListItem>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Reporter',
      Cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            aria-hidden="true"
          >
            {row.original.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-text-primary text-sm">{row.original.name}</p>
            <p className="text-xs text-text-tertiary">{row.original.city}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      Cell: ({ cell }) => (
        <span className="text-sm text-text-secondary">{cell.getValue<string>()}</span>
      ),
    },
    {
      id: 'availability',
      header: 'Availability',
      size: 140,
      Cell: ({ row }) => <AvailabilityBadge active={row.original.has_active_job} />,
    },
    {
      id: 'action',
      header: '',
      size: 120,
      enableSorting: false,
      Cell: ({ row }) => (
        <button
          onClick={() => navigate(`/admin/reporters/${row.original.id}`)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          <IconEye size={14} aria-hidden="true" />
          View detail
        </button>
      ),
    },
  ], [navigate])

  const table = useMantineReactTable({
    columns,
    data: data?.users ?? [],
    manualPagination: true,
    rowCount: data?.pagination?.total ?? 0,
    onPaginationChange: setPagination,
    state: {
      pagination,
      isLoading,
      showProgressBars: isFetching,
      showAlertBanner: isError,
    },
    mantineToolbarAlertBannerProps: isError
      ? { color: 'red', children: 'Failed to load reporters.' }
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
    renderTopToolbarCustomActions: () => (
      <div className="flex items-center h-9 border border-border-base rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition">
        <label htmlFor="reporters-search" className="sr-only">Search reporters</label>
        <div className="relative flex items-center">
          <IconSearch size={13} className="absolute left-2.5 text-text-tertiary pointer-events-none" aria-hidden="true" />
          <input
            id="reporters-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reporters..."
            className="h-9 pl-8 pr-3 text-xs bg-white focus:outline-none w-52"
          />
        </div>
      </div>
    ),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Reporters</h1>
        <p className="mt-1 text-sm text-text-secondary">Monitor reporter performance and availability</p>
      </div>
      <MantineReactTable table={table} />
    </div>
  )
}
