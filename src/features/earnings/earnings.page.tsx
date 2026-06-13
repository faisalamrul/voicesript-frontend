import { useMemo, useState } from 'react'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_PaginationState } from 'mantine-react-table'
import { IconBriefcase, IconCalendarStats, IconCash, IconCircleCheck, IconClock, IconHourglass, IconInfoCircle, IconStopwatch, IconTrendingUp } from '@tabler/icons-react'
import { Tooltip } from '@mantine/core'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { useEarnings } from './hooks/use-earnings'
import { formatRupiah } from '@/shared/utils/format'
import { RATE_PER_MINUTE_IDR } from '@/shared/constants'
import type { EarningsJob, EarningsJobStatus, EarningsPeriod, EarningsTurnaroundStats } from './types/earnings.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function computeTurnaround(assignedAt: string, submittedAt: string | null): string {
  if (!submittedAt) return '—'
  const hours = (new Date(submittedAt).getTime() - new Date(assignedAt).getTime()) / 3_600_000
  if (hours < 0) return '—'
  if (hours < 24) return `${hours.toFixed(1)} hrs`
  return `${(hours / 24).toFixed(1)} days`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type CardVariant = 'primary' | 'blue' | 'green' | 'amber' | 'violet' | 'orange' | 'teal' | 'indigo'

const CARD_VARIANTS: Record<CardVariant, { topBar: string; iconBg: string; iconColor: string; valueColor: string }> = {
  primary: { topBar: 'bg-primary',    iconBg: 'bg-primary-subtle', iconColor: 'text-primary',    valueColor: 'text-primary'    },
  blue:    { topBar: 'bg-blue-500',   iconBg: 'bg-blue-50',        iconColor: 'text-blue-600',   valueColor: 'text-blue-700'   },
  green:   { topBar: 'bg-green-500',  iconBg: 'bg-green-50',       iconColor: 'text-green-600',  valueColor: 'text-green-700'  },
  amber:   { topBar: 'bg-amber-400',  iconBg: 'bg-amber-50',       iconColor: 'text-amber-500',  valueColor: 'text-amber-600'  },
  violet:  { topBar: 'bg-violet-400', iconBg: 'bg-violet-50',      iconColor: 'text-violet-500', valueColor: 'text-violet-700' },
  orange:  { topBar: 'bg-orange-400', iconBg: 'bg-orange-50',      iconColor: 'text-orange-500', valueColor: 'text-orange-600' },
  teal:    { topBar: 'bg-teal-500',   iconBg: 'bg-teal-50',        iconColor: 'text-teal-600',   valueColor: 'text-teal-700'   },
  indigo:  { topBar: 'bg-indigo-500', iconBg: 'bg-indigo-50',      iconColor: 'text-indigo-600', valueColor: 'text-indigo-700' },
}

interface StatCardProps {
  title: string
  value: string
  sub: string
  icon: React.ElementType
  variant: CardVariant
  loading: boolean
  badge?: React.ReactNode
  titleExtra?: React.ReactNode
}

function StatCard({ title, value, sub, icon: Icon, variant, loading, badge, titleExtra }: StatCardProps) {
  const styles = CARD_VARIANTS[variant]

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
            <div className="flex items-center gap-1.5 mb-2.5">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">{title}</p>
              {titleExtra}
            </div>
            <p className={`text-[22px] font-black ${styles.valueColor} leading-none mb-2`}>{value}</p>
            <p className="text-xs text-text-tertiary">{sub}</p>
            {badge && <div className="mt-2">{badge}</div>}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-4 ${styles.iconBg}`} aria-hidden="true">
            <Icon size={20} className={styles.iconColor} />
          </div>
        </div>
      </div>
    </div>
  )
}

const TREND_BADGE: Record<
  Exclude<EarningsTurnaroundStats['trend'], 'insufficient_data'>,
  { arrow: string; label: string; className: string }
> = {
  improving: { arrow: '↑', label: 'Improving', className: 'bg-green-100 text-green-700' },
  stable:    { arrow: '→', label: 'Stable',    className: 'bg-gray-100  text-gray-600'  },
  slowing:   { arrow: '↓', label: 'Slowing',   className: 'bg-red-100   text-red-700'   },
}

function TrendBadge({ trend }: { trend: EarningsTurnaroundStats['trend'] }) {
  if (trend === 'insufficient_data') return null
  const cfg = TREND_BADGE[trend]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.className}`}>
      <span aria-hidden="true">{cfg.arrow} </span>{cfg.label}
    </span>
  )
}

const TREND_SUB: Record<EarningsTurnaroundStats['trend'], string> = {
  improving:        'Getting faster — keep it up',
  stable:           'Consistent pace',
  slowing:          'Pace slowing — check your timeline',
  insufficient_data: 'Submit more jobs for trend data',
}

const STATUS_STYLES: Record<EarningsJobStatus, { bg: string; text: string; label: string }> = {
  ASSIGNED:    { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Assigned'    },
  TRANSCRIBED: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Transcribed' },
  REVIEWED:    { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Reviewed'    },
  COMPLETED:   { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Completed'   },
  REJECTED:    { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Rejected'    },
}

function StatusBadge({ status }: { status: EarningsJobStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

function PaymentCell({ job }: { job: EarningsJob }) {
  if (job.status === 'COMPLETED' && job.reporter_payment !== null)
    return <span className="font-medium text-gray-800 text-sm">{formatRupiah(job.reporter_payment)}</span>
  if (job.status === 'REVIEWED') {
    const estimated = Math.floor(job.duration / 60) * RATE_PER_MINUTE_IDR
    return (
      <span className="text-gray-400 italic text-sm">
        {formatRupiah(estimated)}
        <span className="sr-only"> (estimated, pending)</span>
      </span>
    )
  }
  return <span className="text-text-tertiary text-sm">—</span>
}

interface BusynessStripProps {
  currentMinutes: number
  previousMinutes: number
}

function BusynessStrip({ currentMinutes, previousMinutes }: BusynessStripProps) {
  if (currentMinutes === 0 && previousMinutes === 0) return null

  const isBusier = currentMinutes > previousMinutes
  const pct = previousMinutes > 0
    ? Math.round(Math.abs((currentMinutes - previousMinutes) / previousMinutes) * 100)
    : null

  const bgClass = isBusier ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
  const textClass = isBusier ? 'text-green-700' : 'text-amber-700'

  return (
    <div role="status" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm ${bgClass} ${textClass}`}>
      <IconClock size={15} className="flex-shrink-0" aria-hidden="true" />
      <span>
        This month: <strong>{currentMinutes.toLocaleString('id-ID')} min</strong>
        {' · '}
        Last month: <strong>{previousMinutes.toLocaleString('id-ID')} min</strong>
        {pct !== null && (
          <>
            {' · '}
            <strong>{pct}% {isBusier ? 'busier' : 'quieter'} this month</strong>
          </>
        )}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EarningsPage() {
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [period, setPeriod]         = useState<EarningsPeriod>('all')

  const { data, isLoading, isError, isFetching } = useEarnings(
    pagination.pageIndex + 1,
    pagination.pageSize,
    period,
  )

  const summary    = data?.summary
  const workStats  = data?.work_stats
  const turnaround = data?.turnaround_stats
  const monthly    = data?.monthly_breakdown ?? []
  const jobs       = data?.jobs ?? []

  const periodLabel = period === 'month' ? 'This Month' : period === 'last' ? 'Last Month' : 'All Time'

  const busynessCurrent  = monthly.at(-1)?.minutes ?? 0
  const busynessPrevious = monthly.at(-2)?.minutes ?? 0
  const showBusyness     = monthly.length >= 2

  const columns = useMemo<MRT_ColumnDef<EarningsJob>[]>(() => [
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
      Cell: ({ cell }) => <StatusBadge status={cell.getValue<EarningsJobStatus>()} />,
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
      id: 'turnaround',
      header: 'Turnaround',
      size: 120,
      Cell: ({ row }) => (
        <span className="text-sm text-text-secondary">
          {computeTurnaround(row.original.assigned_at, row.original.submitted_at)}
        </span>
      ),
    },
    {
      id: 'payment',
      header: 'Payment',
      size: 150,
      Cell: ({ row }) => <PaymentCell job={row.original} />,
    },
    {
      accessorKey: 'completed_at',
      header: 'Completed',
      size: 130,
      Cell: ({ cell }) => (
        <span className="text-sm text-text-secondary">{formatDate(cell.getValue<string | null>())}</span>
      ),
    },
  ], [])

  const table = useMantineReactTable({
    columns,
    data: jobs,
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
      ? { color: 'red', children: <span role="alert">Failed to load earnings.</span> }
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
  })

  return (
    <div className="flex flex-col gap-6">

      {/* Top bar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Earnings</h1>
          <p className="mt-1 text-sm text-text-secondary">Track your payment history and work summary</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <label htmlFor="earnings-period" className="sr-only">Filter period</label>
          <select
            id="earnings-period"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as EarningsPeriod)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
            className="h-9 px-3 text-sm border border-border-base rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-text-secondary cursor-pointer"
          >
            <option value="all">All time</option>
            <option value="month">This month</option>
            <option value="last">Last month</option>
          </select>
        </div>
      </div>

      {/* Earnings summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Earned"
          value={formatRupiah(summary?.total_earned ?? 0)}
          sub="from completed jobs"
          icon={IconCash}
          variant="primary"
          loading={isLoading}
        />
        <StatCard
          title={periodLabel}
          value={formatRupiah(summary?.period_earned ?? 0)}
          sub="earnings this period"
          icon={IconTrendingUp}
          variant="green"
          loading={isLoading}
        />
        <StatCard
          title="Pending"
          value={formatRupiah(summary?.pending ?? 0)}
          sub="awaiting completion"
          icon={IconHourglass}
          variant="amber"
          loading={isLoading}
        />
        <StatCard
          title="Total Minutes"
          value={(summary?.total_minutes ?? 0).toLocaleString('id-ID')}
          sub="minutes transcribed"
          icon={IconClock}
          variant="blue"
          loading={isLoading}
        />
      </div>

      {/* Work stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Jobs"
          value={(workStats?.total_jobs ?? 0).toLocaleString()}
          sub="all time assigned"
          icon={IconBriefcase}
          variant="violet"
          loading={isLoading}
        />
        <StatCard
          title="Jobs This Month"
          value={(workStats?.jobs_this_month ?? 0).toLocaleString()}
          sub="assigned this month"
          icon={IconCalendarStats}
          variant="teal"
          loading={isLoading}
        />
        <StatCard
          title="Avg Duration"
          value={`${(workStats?.avg_duration_minutes ?? 0).toLocaleString('id-ID')} min`}
          sub="per job average"
          icon={IconCircleCheck}
          variant="orange"
          loading={isLoading}
        />
        <StatCard
          title="Avg Turnaround"
          value={turnaround ? `${turnaround.avg_hours.toFixed(1)} hrs` : '—'}
          sub={turnaround ? TREND_SUB[turnaround.trend] : 'No data yet'}
          icon={IconStopwatch}
          variant="indigo"
          loading={isLoading}
          badge={turnaround ? <TrendBadge trend={turnaround.trend} /> : undefined}
          titleExtra={
            <Tooltip
              label="Time from job assigned to transcript submitted. Trend compares your 5 most recent jobs against the previous 10 jobs (10% threshold)."
              multiline
              w={280}
              withArrow
              position="top"
            >
              <button
                type="button"
                className="flex items-center text-text-tertiary cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-label="About avg turnaround"
              >
                <IconInfoCircle size={13} aria-hidden="true" />
              </button>
            </Tooltip>
          }
        />
      </div>

      {/* Busyness strip */}
      {showBusyness && (
        <BusynessStrip
          currentMinutes={busynessCurrent}
          previousMinutes={busynessPrevious}
        />
      )}

      {/* Monthly activity chart */}
      <div className="bg-white rounded-2xl border border-border-base p-6">
        <div className="mb-5">
          <p className="text-sm font-semibold text-text-primary">Monthly Activity</p>
          <p className="text-xs text-text-tertiary mt-0.5">Last 6 months — earnings vs minutes transcribed</p>
        </div>
        {monthly.length === 0 ? (
          <div role="status" className="flex items-center justify-center h-[220px] text-sm text-text-tertiary">
            No monthly data available yet.
          </div>
        ) : (
          <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart accessibilityLayer data={monthly} barSize={28} margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-base)" vertical={false} />
              <XAxis
                dataKey="month_label"
                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="earned"
                orientation="left"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <YAxis
                yAxisId="minutes"
                orientation="right"
                tickFormatter={(v) => `${v} min`}
                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <RechartsTooltip
                formatter={(value: number, name: string) => {
                  if (name === 'earned') return [`Rp ${value.toLocaleString('id-ID')}`, 'Earned']
                  return [`${value} min`, 'Minutes']
                }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--color-border-base)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                cursor={{ fill: 'var(--color-bg-surface)' }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => value === 'earned' ? 'Earned (Rp)' : 'Minutes'}
              />
              <Bar yAxisId="earned" dataKey="earned" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="minutes"
                type="monotone"
                dataKey="minutes"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#14b8a6' }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Job history */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-text-primary">Job History</h2>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {isFetching ? 'Loading job history, please wait.' : 'Job history loaded.'}
        </span>
        <MantineReactTable table={table} />
      </div>

    </div>
  )
}
