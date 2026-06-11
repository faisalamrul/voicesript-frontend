import { useMemo, useState } from 'react'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_PaginationState } from 'mantine-react-table'
import { Badge } from '@mantine/core'
import { useJobs } from '../hooks/use-jobs'
import type { Job, JobStatus } from '../types/job.types'

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string }> = {
  NEW:         { label: 'New',         color: 'blue' },
  IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
  SUBMITTED:   { label: 'Submitted',   color: 'cyan' },
  IN_REVIEW:   { label: 'In Review',   color: 'orange' },
  DONE:        { label: 'Done',        color: 'green' },
  REJECTED:    { label: 'Rejected',    color: 'red' },
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function JobsTable() {
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading, isError, refetch, isFetching } = useJobs(
    pagination.pageIndex + 1,
    pagination.pageSize,
  )

  const columns = useMemo<MRT_ColumnDef<Job>[]>(
    () => [
      {
        accessorKey: 'case_name',
        header: 'Case',
        size: 260,
      },
      {
        accessorKey: 'duration',
        header: 'Durasi',
        size: 90,
        Cell: ({ cell }) => formatDuration(cell.getValue<number>()),
      },
      {
        id: 'location',
        header: 'Lokasi',
        size: 150,
        accessorFn: (row) => `${row.location ? row.location.toUpperCase() : '—'} - ${row.city ?? ''}`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        Cell: ({ cell }) => {
          const status = cell.getValue<JobStatus>()
          const config = STATUS_CONFIG[status] ?? { label: status, color: 'gray' }
          return <Badge color={config.color} variant="light" size="sm">{config.label}</Badge>
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Dibuat',
        size: 130,
        Cell: ({ cell }) => formatDate(cell.getValue<string>()),
      },
    ],
    [],
  )

  const table = useMantineReactTable({
    columns,
    data: data?.jobs ?? [],
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
      ? { color: 'red', children: 'Gagal memuat data.' }
      : undefined,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    enableColumnFilters: false,
    initialState: { density: 'xs' },
    mantinePaperProps: {
      shadow: 'none',
      withBorder: false,
    },
    mantineTableProps: {
      striped: true,
      highlightOnHover: true,
    },
    renderTopToolbarCustomActions: () => (
      <button
        onClick={() => refetch()}
        className="text-xs px-3 py-1.5 rounded-lg border border-border-base text-text-secondary hover:bg-bg-surface transition-colors"
      >
        Refresh
      </button>
    ),
  })

  return <MantineReactTable table={table} />
}
