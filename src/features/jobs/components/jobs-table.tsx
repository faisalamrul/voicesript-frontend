import { useEffect, useMemo, useState } from 'react'
import { MantineReactTable, useMantineReactTable, type MRT_ColumnDef, type MRT_PaginationState } from 'mantine-react-table'
import { IconRefresh, IconMapPin, IconWifi, IconClock, IconCalendar, IconFileText, IconSearch } from '@tabler/icons-react'
import Swal from 'sweetalert2'
import { useQueryClient } from '@tanstack/react-query'
import { useJobs } from '../hooks/use-jobs'
import { useAuthStore } from '@/store/auth.store'
import { completeJob } from '../api/jobs.api'
import { AssignReporterModal } from './assign-reporter-modal'
import { AssignEditorModal } from './assign-editor-modal'
import { SubmitTranscriptModal } from './submit-transcript-modal'
import { SWAL_PRIMARY } from '@/shared/constants'
import type { Job, JobStatus } from '../types/job.types'
import type { UserRole } from '@/shared/types'

// ─── Status ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<JobStatus, { label: string; dot: string; text: string; bg: string }> = {
  NEW:         { label: 'New',         dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50'   },
  ASSIGNED:    { label: 'Assigned',    dot: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  TRANSCRIBED: { label: 'Transcribed', dot: 'bg-cyan-400',   text: 'text-cyan-700',   bg: 'bg-cyan-50'   },
  REVIEWED:    { label: 'Reviewed',    dot: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
  COMPLETED:   { label: 'Completed',   dot: 'bg-green-400',  text: 'text-green-700',  bg: 'bg-green-50'  },
  REJECTED:    { label: 'Rejected',    dot: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50'    },
}

function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, dot: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-50' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {cfg.label}
    </span>
  )
}

// ─── Action ───────────────────────────────────────────────────────────────────
const BTN = 'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all active:scale-95'

function ActionCell({ job, role, onAssignReporter, onAssignEditor, onSubmitTranscript, onViewTranscript, onJobCompleted }: {
  job: Job
  role: UserRole | undefined
  onAssignReporter: (job: Job) => void
  onAssignEditor: (job: Job) => void
  onSubmitTranscript: (job: Job) => void
  onViewTranscript: ((job: Job) => void) | undefined
  onJobCompleted: () => void
}) {
  if (role === 'editor') {
    if (job.status === 'TRANSCRIBED')
      return <button onClick={() => onViewTranscript?.(job)} className={`${BTN} text-cyan-700 border-cyan-200 bg-cyan-50 hover:bg-cyan-100 hover:border-cyan-300`}>View Transcript</button>
    return <span className="text-text-tertiary text-sm select-none" aria-label="No action">—</span>
  }

  if (role === 'reporter') {
    if (job.status === 'ASSIGNED')
      return <button onClick={() => onSubmitTranscript(job)} className={`${BTN} text-primary border-primary/30 bg-primary-subtle hover:bg-primary/10 hover:border-primary/50`}>Submit Transcript</button>
    if (job.status === 'TRANSCRIBED')
      return job.editor_id
        ? (
          <div className="flex flex-col gap-0.5" aria-label={`In review · ${job.editor_name}`}>
            <span className="text-[11px] font-semibold text-cyan-600" aria-hidden="true">In review</span>
            <span className="text-[11px] text-text-tertiary" aria-hidden="true">{job.editor_name}</span>
          </div>
        )
        : (
          <div className="flex flex-col gap-0.5" aria-label="Awaiting reviewer">
            <span className="text-[11px] font-semibold text-amber-600" aria-hidden="true">Awaiting reviewer</span>
            <span className="text-[11px] text-text-tertiary" aria-hidden="true">Not yet assigned</span>
          </div>
        )
    return <span className="text-text-tertiary text-sm select-none" aria-label="No action">—</span>
  }

  // admin
  if (job.status === 'NEW')
    return <button onClick={() => onAssignReporter(job)} className={`${BTN} text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300`}>Assign Reporter</button>
  if (job.status === 'ASSIGNED')
    return (
      <div className="flex flex-col gap-0.5" aria-label={`In progress · ${job.reporter_name}`}>
        <span className="text-[11px] font-semibold text-yellow-600" aria-hidden="true">In progress</span>
        <span className="text-[11px] text-text-tertiary" aria-hidden="true">{job.reporter_name}</span>
      </div>
    )
  if (job.status === 'TRANSCRIBED')
    return job.editor_id
      ? (
        <div className="flex flex-col gap-0.5" aria-label={`In review · ${job.editor_name}`}>
          <span className="text-[11px] font-semibold text-cyan-600" aria-hidden="true">In review</span>
          <span className="text-[11px] text-text-tertiary" aria-hidden="true">{job.editor_name}</span>
        </div>
      )
      : <button onClick={() => onAssignEditor(job)} className={`${BTN} text-cyan-700 border-cyan-200 bg-cyan-50 hover:bg-cyan-100 hover:border-cyan-300`}>Assign Editor</button>
  if (job.status === 'REVIEWED') {
    async function handleComplete() {
      const result = await Swal.fire({
        title: 'Mark as Completed?',
        text: 'This will finalize the job and move it to Completed status.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: SWAL_PRIMARY,
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, complete it',
        cancelButtonText: 'Cancel',
      })
      if (!result.isConfirmed) return
      Swal.fire({ title: 'Processing...', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() })
      try {
        await completeJob(job.id)
        onJobCompleted()
        Swal.fire({ icon: 'success', title: 'Completed!', text: 'Job has been marked as completed.', confirmButtonColor: SWAL_PRIMARY, timer: 2000, timerProgressBar: true })
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err instanceof Error ? err.message : 'Failed to complete job.', confirmButtonColor: SWAL_PRIMARY })
      }
    }
    return <button onClick={handleComplete} className={`${BTN} text-green-700 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300`}>Mark Completed</button>
  }
  return <span className="text-text-tertiary text-sm select-none" aria-label="No action">—</span>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(seconds: number): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Table ────────────────────────────────────────────────────────────────────
interface JobsTableProps {
  onViewTranscript?: (job: Job) => void
}

export function JobsTable({ onViewTranscript }: JobsTableProps) {
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [assigningJob, setAssigningJob] = useState<Job | null>(null)
  const [assigningEditorJob, setAssigningEditorJob] = useState<Job | null>(null)
  const [transcribingJob, setTranscribingJob] = useState<Job | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchBy, setSearchBy] = useState<'name' | 'city'>('name')
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('')
  const [locationFilter, setLocationFilter] = useState<'physical' | 'remote' | ''>('')
  const userRole = useAuthStore((s) => s.user?.role)
  const isAdmin = userRole === 'admin'
  const isReporter = userRole === 'reporter'
  const isEditor = userRole === 'editor'
  const queryClient = useQueryClient()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearch, searchBy, statusFilter, locationFilter])

  const filters = useMemo(() => ({
    search:   searchBy === 'name' ? debouncedSearch || undefined : undefined,
    city:     searchBy === 'city' ? debouncedSearch || undefined : undefined,
    status:   statusFilter   || undefined,
    location: locationFilter || undefined,
  }), [debouncedSearch, searchBy, statusFilter, locationFilter])

  const { data, isLoading, isError, refetch, isFetching } = useJobs(
    pagination.pageIndex + 1,
    pagination.pageSize,
    filters,
  )

  const columns = useMemo<MRT_ColumnDef<Job>[]>(
    () => [
      {
        accessorKey: 'case_name',
        header: 'Case Name',
        size: 260,
        Cell: ({ cell }) => (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-subtle flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <IconFileText size={14} className="text-primary" />
            </div>
            <span className="font-medium text-text-primary text-sm leading-snug">{cell.getValue<string>()}</span>
          </div>
        ),
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        size: 110,
        Cell: ({ cell }) => (
          <div className="flex items-center gap-1.5 text-text-secondary">
            <IconClock size={13} className="text-text-tertiary flex-shrink-0" aria-hidden="true" />
            <span className="font-mono text-xs tracking-wide">{formatDuration(cell.getValue<number>())}</span>
          </div>
        ),
      },
      {
        id: 'location',
        header: 'Location',
        size: 160,
        accessorFn: (row) => row.location,
        Cell: ({ row }) => {
          const loc = row.original.location?.toUpperCase()
          const city = row.original.city
          const isRemote = loc === 'REMOTE'
          return (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                isRemote
                  ? 'bg-violet-50 text-violet-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}>
                {isRemote
                  ? <IconWifi size={10} aria-hidden="true" />
                  : <IconMapPin size={10} aria-hidden="true" />
                }
                {loc ?? '—'}
              </span>
              {city && <span className="text-xs text-text-tertiary">{city}</span>}
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 140,
        Cell: ({ cell }) => <StatusBadge status={cell.getValue<JobStatus>()} />,
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
      ...((isAdmin || isReporter || isEditor) ? [{
        id: 'action',
        header: 'Actions',
        size: 160,
        enableSorting: false,
        Cell: ({ row }: { row: { original: Job } }) => (
          <ActionCell
            job={row.original}
            role={userRole}
            onAssignReporter={setAssigningJob}
            onAssignEditor={setAssigningEditorJob}
            onSubmitTranscript={setTranscribingJob}
            onViewTranscript={onViewTranscript}
            onJobCompleted={() => queryClient.invalidateQueries({ queryKey: ['jobs'] })}
          />
        ),
      } satisfies MRT_ColumnDef<Job>] : []),
    ],
    [userRole, isAdmin, isReporter, isEditor, onViewTranscript, queryClient],
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
      ? { color: 'red', children: 'Failed to load jobs.' }
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
      const status = row.original.status
      const leftColor: Record<JobStatus, string> = {
        NEW:         '#3b82f6',
        ASSIGNED:    '#eab308',
        TRANSCRIBED: '#06b6d4',
        REVIEWED:    '#f97316',
        COMPLETED:   '#22c55e',
        REJECTED:    '#ef4444',
      }
      return {
        style: {
          borderLeft: `3px solid ${leftColor[status] ?? 'transparent'}`,
        },
      }
    },
    enableGlobalFilter: false,
    renderTopToolbarCustomActions: () => (
      <div className="flex items-center h-9 border border-border-base rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition">
        <label htmlFor="jobs-search-by" className="sr-only">Search by</label>
        <select
          id="jobs-search-by"
          value={searchBy}
          onChange={(e) => {
            setSearchBy(e.target.value as 'name' | 'city')
            setSearchInput('')
          }}
          className="h-full pl-3 pr-2 text-xs bg-bg-surface text-text-secondary border-r border-border-base focus:outline-none cursor-pointer shrink-0"
        >
          <option value="name">Name</option>
          <option value="city">City</option>
        </select>
        <div className="relative flex items-center">
          <IconSearch size={13} className="absolute left-2.5 text-text-tertiary pointer-events-none" aria-hidden="true" />
          <label htmlFor="jobs-search-input" className="sr-only">
            {searchBy === 'name' ? 'Search by case name' : 'Search by city'}
          </label>
          <input
            id="jobs-search-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={searchBy === 'name' ? 'Search case name...' : 'Search by city...'}
            className="h-9 pl-8 pr-3 text-xs bg-white focus:outline-none w-52"
          />
        </div>
      </div>
    ),
    renderToolbarInternalActions: () => (
      <div className="flex items-center gap-2 px-2 py-1">
        {/* Status */}
        <label htmlFor="jobs-status-filter" className="sr-only">Filter by status</label>
        <select
          id="jobs-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as JobStatus | '')}
          className="h-8 px-2.5 text-xs border border-border-base rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-text-secondary cursor-pointer"
        >
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="TRANSCRIBED">Transcribed</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* Location */}
        <div className="flex items-center border border-border-base rounded-lg overflow-hidden text-xs">
          {(['', 'physical', 'remote'] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              aria-pressed={locationFilter === loc}
              onClick={() => setLocationFilter(loc)}
              className={`h-8 px-3 transition-colors ${
                locationFilter === loc
                  ? 'bg-primary text-white font-medium'
                  : 'bg-white text-text-secondary hover:bg-bg-surface'
              }`}
            >
              {loc === '' ? 'All' : loc === 'physical' ? 'Physical' : 'Remote'}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-xs px-3 h-8 rounded-lg border border-border-base text-text-secondary hover:bg-bg-surface transition-colors"
        >
          <IconRefresh size={13} aria-hidden="true" />
          <span>Refresh</span>
        </button>
      </div>
    ),
  })

  return (
    <>
      <MantineReactTable table={table} />
      {assigningJob && (
        <AssignReporterModal job={assigningJob} onClose={() => setAssigningJob(null)} />
      )}
      {assigningEditorJob && (
        <AssignEditorModal job={assigningEditorJob} onClose={() => setAssigningEditorJob(null)} />
      )}
      {transcribingJob && (
        <SubmitTranscriptModal job={transcribingJob} onClose={() => setTranscribingJob(null)} />
      )}
    </>
  )
}
