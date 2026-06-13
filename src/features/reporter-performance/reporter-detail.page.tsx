import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_PaginationState } from 'mantine-react-table'
import { IconArrowLeft, IconBriefcase, IconCalendar, IconCash, IconCircleCheck, IconClock, IconEye, IconMail, IconMapPin } from '@tabler/icons-react'
import { useReporterDetail } from './hooks/use-reporter-detail'
import type { ReporterJob, ReporterJobStatus } from './types/reporter-performance.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type CardVariant = 'primary' | 'blue' | 'green' | 'amber'

const CARD_VARIANTS: Record<CardVariant, { topBar: string; iconBg: string; iconColor: string; valueColor: string }> = {
  primary: { topBar: 'bg-primary',   iconBg: 'bg-primary-subtle', iconColor: 'text-primary',    valueColor: 'text-primary'    },
  blue:    { topBar: 'bg-blue-500',  iconBg: 'bg-blue-50',        iconColor: 'text-blue-600',   valueColor: 'text-blue-700'   },
  green:   { topBar: 'bg-green-500', iconBg: 'bg-green-50',       iconColor: 'text-green-600',  valueColor: 'text-green-700'  },
  amber:   { topBar: 'bg-amber-400', iconBg: 'bg-amber-50',       iconColor: 'text-amber-500',  valueColor: 'text-amber-600'  },
}

interface StatCardProps {
  title: string
  value: string
  sub: string
  icon: React.ElementType
  variant: CardVariant
}

function StatCard({ title, value, sub, icon: Icon, variant }: StatCardProps) {
  const s = CARD_VARIANTS[variant]
  return (
    <div className="bg-white rounded-2xl border border-border-base overflow-hidden">
      <div className={`h-1 ${s.topBar}`} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">{title}</p>
            <p className={`text-[22px] font-black ${s.valueColor} leading-none mb-2`}>{value}</p>
            <p className="text-xs text-text-tertiary">{sub}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 ${s.iconBg}`} aria-hidden="true">
            <Icon size={20} className={s.iconColor} />
          </div>
        </div>
      </div>
    </div>
  )
}

function AvailabilityBadge({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">On Job</span>
    : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Available</span>
}

const STATUS_STYLES: Record<ReporterJobStatus, { bg: string; text: string; label: string }> = {
  ASSIGNED:    { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Assigned'    },
  TRANSCRIBED: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Transcribed' },
  REVIEWED:    { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Reviewed'    },
  COMPLETED:   { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Completed'   },
  REJECTED:    { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Rejected'    },
}

function StatusBadge({ status }: { status: ReporterJobStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function PaymentCell({ job }: { job: ReporterJob }) {
  if (job.status === 'COMPLETED' && job.reporter_payment !== null)
    return <span className="font-medium text-gray-800 text-sm">{formatRupiah(job.reporter_payment)}</span>
  if (job.status === 'REVIEWED') {
    const estimated = Math.floor(job.duration / 60) * 2000
    return <span className="text-gray-400 italic text-sm">{formatRupiah(estimated)}</span>
  }
  return <span className="text-text-tertiary text-sm">—</span>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ReporterDetailPage() {
  const { reporterId } = useParams<{ reporterId: string }>()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading, isError, isFetching } = useReporterDetail(
    reporterId,
    pagination.pageIndex + 1,
    pagination.pageSize,
  )

  const reporter = data?.profile ?? null
  const stats    = data?.stats   ?? null
  const jobs     = data?.jobs    ?? []

  const columns = useMemo<MRT_ColumnDef<ReporterJob>[]>(() => [
    {
      accessorKey: 'case_name',
      header: 'Case',
      Cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary text-sm">{row.original.case_name}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{formatDate(row.original.assigned_at)}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 140,
      Cell: ({ cell }) => <StatusBadge status={cell.getValue<ReporterJobStatus>()} />,
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      size: 110,
      Cell: ({ cell }) => {
        const mins = Math.floor(cell.getValue<number>() / 60)
        return <span className="text-sm text-text-secondary">{mins > 0 ? `${mins} min` : '—'}</span>
      },
    },
    {
      id: 'payment',
      header: 'Payment',
      size: 140,
      Cell: ({ row }) => <PaymentCell job={row.original} />,
    },
    {
      id: 'action',
      header: '',
      size: 120,
      enableSorting: false,
      Cell: ({ row }) => (
        <button
          onClick={() => navigate(`/admin/reporters/${reporterId}/jobs/${row.original.id}`)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          <IconEye size={14} aria-hidden="true" />
          View timeline
        </button>
      ),
    },
  ], [navigate, reporterId])

  const table = useMantineReactTable({
    columns,
    data: jobs,
    manualPagination: true,
    rowCount: data?.pagination?.total ?? 0,
    onPaginationChange: setPagination,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableHiding: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    state: {
      pagination,
      isLoading,
      showProgressBars: isFetching,
      showAlertBanner: isError,
    },
    mantineToolbarAlertBannerProps: isError
      ? { color: 'red', children: 'Failed to load job history.' }
      : undefined,
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
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-2xl border border-border-base overflow-hidden">
          <div className="bg-gray-100 px-6 py-5 h-20 animate-pulse" />
          <div className="px-6 py-4 space-y-2">
            <div className="h-3.5 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-3.5 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-3.5 bg-gray-200 rounded w-36 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border-base overflow-hidden">
              <div className="h-1 bg-gray-200" />
              <div className="p-5 animate-pulse space-y-2.5">
                <div className="h-2.5 bg-gray-200 rounded w-20" />
                <div className="h-7 bg-gray-200 rounded w-36" />
                <div className="h-2.5 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!reporter || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-text-secondary">Reporter not found.</p>
        <Link to="/admin/reporters" className="text-sm text-primary hover:underline">← Back to Reporters</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Breadcrumb */}
      <Link
        to="/admin/reporters"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors w-fit"
      >
        <IconArrowLeft size={15} aria-hidden="true" />
        Reporters
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-border-base overflow-hidden">

        {/* Top band — identity */}
        <div className="bg-primary-subtle px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black flex-shrink-0"
              aria-hidden="true"
            >
              {reporter.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{reporter.name}</h1>
          </div>
          <AvailabilityBadge active={reporter.has_active_job} />
        </div>

        {/* Bottom section — contact & meta */}
        <div className="px-6 py-4 border-t border-border-base flex flex-col gap-1.5">
          <span className="flex items-center gap-2 text-sm text-text-secondary">
            <IconMail size={13} aria-hidden="true" className="text-text-tertiary flex-shrink-0" />
            {reporter.email}
          </span>
          <span className="flex items-center gap-2 text-sm text-text-secondary">
            <IconMapPin size={13} aria-hidden="true" className="text-text-tertiary flex-shrink-0" />
            {reporter.city}
          </span>
          <span className="flex items-center gap-2 text-sm text-text-tertiary">
            <IconCalendar size={13} aria-hidden="true" className="text-text-tertiary flex-shrink-0" />
            Member since {formatDate(reporter.created_at)}
          </span>
        </div>

      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Jobs"
          value={stats.total_jobs.toLocaleString()}
          sub="all time assigned"
          icon={IconBriefcase}
          variant="primary"
        />
        <StatCard
          title="Total Earned"
          value={formatRupiah(stats.total_earned)}
          sub="from completed jobs"
          icon={IconCash}
          variant="blue"
        />
        <StatCard
          title="Jobs Completed"
          value={stats.jobs_completed.toLocaleString()}
          sub="marked COMPLETED"
          icon={IconCircleCheck}
          variant="green"
        />
        <StatCard
          title="Pending Earnings"
          value={formatRupiah(stats.pending_earnings)}
          sub="REVIEWED, awaiting payment"
          icon={IconClock}
          variant="amber"
        />
      </div>

      {/* Job history */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-text-primary">Job History</h2>
        <MantineReactTable table={table} />
      </div>

    </div>
  )
}
