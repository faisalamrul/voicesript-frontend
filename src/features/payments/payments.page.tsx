import { useEffect, useMemo, useState } from 'react'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_PaginationState } from 'mantine-react-table'
import { IconDownload, IconSearch, IconX, IconCash, IconUser, IconEdit, IconClock, IconCircleCheck, IconHourglass } from '@tabler/icons-react'
import { usePayments } from './hooks/use-payments'
import type { PaymentJob, PaymentsFilters } from './types/payment.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function exportCSV(jobs: PaymentJob[]) {
  const headers = ['Case', 'Duration (min)', 'Reporter', 'Reporter Pay', 'Editor', 'Editor Pay', 'Status', 'Completed At']
  const rows = jobs.map((j) => [
    j.case_name,
    Math.floor((j.duration || 0) / 60),
    j.reporter_name || '—',
    j.reporter_payment ? formatRupiah(j.reporter_payment) : '—',
    j.editor_name || '—',
    j.editor_payment ? formatRupiah(j.editor_payment) : '—',
    j.status === 'COMPLETED' ? 'Paid' : 'Pending',
    j.completed_at ? new Date(j.completed_at).toLocaleDateString('id-ID') : '—',
  ])
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type CardVariant = 'primary' | 'blue' | 'orange' | 'amber' | 'green' | 'violet'

const CARD_VARIANTS: Record<CardVariant, { topBar: string; iconBg: string; iconColor: string; valueColor: string }> = {
  primary: { topBar: 'bg-primary',    iconBg: 'bg-primary-subtle', iconColor: 'text-primary',     valueColor: 'text-primary'     },
  blue:    { topBar: 'bg-blue-500',   iconBg: 'bg-blue-50',        iconColor: 'text-blue-600',    valueColor: 'text-blue-700'    },
  orange:  { topBar: 'bg-orange-400', iconBg: 'bg-orange-50',      iconColor: 'text-orange-500',  valueColor: 'text-orange-600'  },
  amber:   { topBar: 'bg-amber-400',  iconBg: 'bg-amber-50',       iconColor: 'text-amber-500',   valueColor: 'text-amber-600'   },
  green:   { topBar: 'bg-green-500',  iconBg: 'bg-green-50',       iconColor: 'text-green-600',   valueColor: 'text-green-700'   },
  violet:  { topBar: 'bg-violet-400', iconBg: 'bg-violet-50',      iconColor: 'text-violet-500',  valueColor: 'text-violet-700'  },
}

interface SummaryCardProps {
  title: string
  value: number
  sub: string
  icon: React.ElementType
  variant: CardVariant
  format?: 'rupiah' | 'count'
  loading: boolean
}

function SummaryCard({ title, value, sub, icon: Icon, variant, format = 'rupiah', loading }: SummaryCardProps) {
  const styles = CARD_VARIANTS[variant]
  const displayValue = format === 'count' ? value.toLocaleString('id-ID') : formatRupiah(value)

  if (loading) {
    return (
      <div
        className="bg-white rounded-2xl border border-border-base overflow-hidden"
        aria-busy="true"
        aria-label={`${title} loading`}
      >
        <div className="h-1 bg-border-base" aria-hidden="true" />
        <div className="p-5 animate-pulse" aria-hidden="true">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2.5">
              <div className="h-2.5 bg-gray-200 rounded w-20" />
              <div className="h-7 bg-gray-200 rounded w-36" />
              <div className="h-2.5 bg-gray-200 rounded w-24" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gray-200 ml-4 flex-shrink-0" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border-base overflow-hidden">
      <div className={`h-1 ${styles.topBar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">{title}</p>
            <p className={`text-[22px] font-black ${styles.valueColor} leading-none mb-2`}>{displayValue}</p>
            <p className="text-xs text-text-tertiary">{sub}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 ${styles.iconBg}`} aria-hidden="true">
            <Icon size={20} className={styles.iconColor} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentBadge({ job }: { job: PaymentJob }) {
  if (job.status === 'COMPLETED')
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Paid</span>
  if (job.status === 'REJECTED')
    return <span className="text-text-tertiary text-sm">—</span>
  if (job.reporter_name || job.editor_name)
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">Pending</span>
  return <span className="text-text-tertiary text-sm">—</span>
}

function PayCell({ amount, isPaid }: { amount: number | null; isPaid: boolean }) {
  if (amount === null) return <span className="text-text-tertiary">—</span>
  if (isPaid) return <span className="font-medium text-gray-800">{formatRupiah(amount)}</span>
  return (
    <span className="text-gray-400 italic">
      {formatRupiah(amount)}
      <span className="sr-only"> (pending)</span>
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PaymentsPage() {
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [search, setSearch]                   = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus]                   = useState<'all' | 'paid' | 'pending'>('all')
  const [period, setPeriod]                   = useState<'all' | 'month' | 'last'>('all')
  const [exportStatus, setExportStatus]       = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearch, status, period])

  const filters = useMemo<PaymentsFilters>(() => ({
    search: debouncedSearch || undefined,
    status: status !== 'all' ? status : undefined,
    period: period !== 'all' ? period : undefined,
  }), [debouncedSearch, status, period])

  const { data, isLoading, isError, isFetching } = usePayments(
    pagination.pageIndex + 1,
    pagination.pageSize,
    filters,
  )

  const summary = data?.summary
  const jobs    = data?.jobs ?? []

  const hasFilters = !!search || status !== 'all' || period !== 'all'

  function handleReset() {
    setSearch('')
    setDebouncedSearch('')
    setStatus('all')
    setPeriod('all')
  }

  const columns = useMemo<MRT_ColumnDef<PaymentJob>[]>(() => [
    {
      accessorKey: 'case_name',
      header: 'Case',
      size: 240,
      Cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary text-sm">{row.original.case_name}</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            {Math.floor((row.original.duration || 0) / 60)} mnt · {formatDate(row.original.completed_at)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'reporter_name',
      header: 'Reporter',
      size: 160,
      Cell: ({ cell }) => (
        <span className="text-sm text-text-secondary">{cell.getValue<string | null>() ?? <span className="text-text-tertiary">—</span>}</span>
      ),
    },
    {
      accessorKey: 'reporter_payment',
      header: 'Rep. Pay',
      size: 140,
      Cell: ({ row }) => (
        <PayCell amount={row.original.reporter_payment} isPaid={row.original.status === 'COMPLETED'} />
      ),
    },
    {
      accessorKey: 'editor_name',
      header: 'Editor',
      size: 160,
      Cell: ({ cell }) => (
        <span className="text-sm text-text-secondary">{cell.getValue<string | null>() ?? <span className="text-text-tertiary">—</span>}</span>
      ),
    },
    {
      accessorKey: 'editor_payment',
      header: 'Ed. Pay',
      size: 140,
      Cell: ({ row }) => (
        <PayCell amount={row.original.editor_payment} isPaid={row.original.status === 'COMPLETED'} />
      ),
    },
    {
      id: 'pay_status',
      header: 'Status',
      size: 120,
      Cell: ({ row }) => <PaymentBadge job={row.original} />,
    },
  ], [])

  const table = useMantineReactTable({
    columns,
    data: jobs,
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
      ? { color: 'red', children: <span role="alert">Failed to load data.</span> }
      : undefined,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
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
        <label htmlFor="payments-search" className="sr-only">Search by case, reporter, or editor</label>
        <div className="relative flex items-center">
          <IconSearch size={13} className="absolute left-2.5 text-text-tertiary pointer-events-none" aria-hidden="true" />
          <input
            id="payments-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search case, reporter, editor..."
            className="h-9 pl-8 pr-3 text-xs bg-white focus:outline-none w-56"
          />
        </div>
      </div>
    ),
    renderToolbarInternalActions: () => (
      <div className="flex items-center gap-2 px-2 py-1">
        <label htmlFor="payments-status" className="sr-only">Filter status</label>
        <select
          id="payments-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="h-8 px-2.5 text-xs border border-border-base rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-text-secondary cursor-pointer"
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg border border-border-base text-text-secondary hover:bg-bg-surface transition-colors"
          >
            <IconX size={12} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>
    ),
  })

  return (
    <div className="flex flex-col gap-6">

      {/* Top bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Payments</h1>
          <p className="mt-1 text-sm text-text-secondary">Financial summary of all jobs</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <label htmlFor="payments-period" className="sr-only">Filter period</label>
          <select
            id="payments-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="h-9 px-3 text-sm border border-border-base rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-text-secondary cursor-pointer"
          >
            <option value="all">All time</option>
            <option value="month">This month</option>
            <option value="last">Last month</option>
          </select>
          <button
            onClick={() => { exportCSV(jobs); setExportStatus('CSV download started.') }}
            disabled={jobs.length === 0}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <IconDownload size={15} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Payout"    value={summary?.total_payout ?? 0}    sub="reporter + editor"                                    icon={IconCash}         variant="primary" loading={isLoading} />
        <SummaryCard title="Reporter"        value={summary?.reporter_total ?? 0}  sub={`${summary?.reporter_minutes ?? 0} minutes paid`}     icon={IconUser}         variant="blue"    loading={isLoading} />
        <SummaryCard title="Editor"          value={summary?.editor_total ?? 0}    sub={`${summary?.editor_jobs ?? 0} jobs completed`}         icon={IconEdit}         variant="orange"  loading={isLoading} />
        <SummaryCard title="Pending"         value={summary?.pending_total ?? 0}   sub="not yet completed"                                    icon={IconClock}        variant="amber"   loading={isLoading} />
        <SummaryCard title="Jobs Completed"  value={summary?.completed_jobs ?? 0}  sub="marked as COMPLETED"                                  icon={IconCircleCheck}  variant="green"   format="count" loading={isLoading} />
        <SummaryCard title="Jobs Pending"    value={summary?.pending_jobs ?? 0}    sub="awaiting completion"                                   icon={IconHourglass}    variant="violet"  format="count" loading={isLoading} />
      </div>

      {/* Table */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {isFetching ? 'Loading payment data, please wait.' : ''}
      </span>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{exportStatus}</span>
      <MantineReactTable table={table} />

    </div>
  )
}
