import { Link, useParams } from 'react-router-dom'
import {
  IconArrowLeft, IconBuilding, IconClock, IconCoin, IconMapPin, IconUser, IconWifi,
} from '@tabler/icons-react'
import { useJobDetail } from './hooks/use-job-detail'
import { JobTimelineSteps } from './components/job-timeline'
import { formatRupiah } from '@/shared/utils/format'
import { RATE_PER_MINUTE_IDR } from '@/shared/constants'
import type { JobStatus } from './types/job.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<JobStatus, { bg: string; text: string; label: string }> = {
  NEW:         { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'New'         },
  ASSIGNED:    { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Assigned'    },
  TRANSCRIBED: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Transcribed' },
  REVIEWED:    { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Reviewed'    },
  COMPLETED:   { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Completed'   },
  REJECTED:    { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Rejected'    },
}

function StatusBadge({ status }: { status: JobStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, children }: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-base last:border-0">
      <div className="w-7 h-7 rounded-lg bg-bg-surface flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
        <Icon size={14} className="text-text-tertiary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-text-primary">{children}</div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { data: job, isLoading, isError } = useJobDetail(jobId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl" aria-busy="true" aria-label="Loading job details">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" aria-hidden="true" />
        <div className="bg-white rounded-2xl border border-border-base p-6 space-y-4 animate-pulse" aria-hidden="true">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-64 bg-gray-200 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-border-base">
              <div className="w-7 h-7 rounded-lg bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-gray-200 rounded w-16" />
                <div className="h-3.5 bg-gray-100 rounded w-40" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-border-base p-6 space-y-6 animate-pulse" aria-hidden="true">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-5">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="h-3.5 bg-gray-200 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-44" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-text-secondary">Job not found.</p>
        <Link to="/jobs" className="text-sm text-primary hover:underline">← Back to jobs</Link>
      </div>
    )
  }

  const isRemote     = job.location?.toUpperCase() === 'REMOTE'
  const estimatedPay = formatRupiah(Math.floor(job.duration / 60) * RATE_PER_MINUTE_IDR)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Back link */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors w-fit"
      >
        <IconArrowLeft size={15} aria-hidden="true" />
        My Jobs
      </Link>

      {/* Job info card */}
      <div className="bg-white rounded-2xl border border-border-base p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-1">Case</p>
            <h1 className="text-xl font-bold text-text-primary">{job.case_name}</h1>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="divide-y divide-border-base">
          <DetailRow icon={isRemote ? IconWifi : IconMapPin} label="Location">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                isRemote ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {isRemote
                  ? <IconWifi size={10} aria-hidden="true" />
                  : <IconMapPin size={10} aria-hidden="true" />}
                {job.location?.toUpperCase() ?? '—'}
              </span>
              {job.city && <span className="text-text-secondary">{job.city}</span>}
            </div>
          </DetailRow>

          <DetailRow icon={IconClock} label="Duration">
            <span className="font-mono">{formatDuration(job.duration)}</span>
          </DetailRow>

          <DetailRow icon={IconCoin} label="Estimated Payment">
            <span className="font-semibold text-green-700">{estimatedPay}</span>
            <span className="text-xs text-text-tertiary ml-1.5">
              based on Rp {RATE_PER_MINUTE_IDR.toLocaleString('id-ID')}/min
            </span>
          </DetailRow>

          <DetailRow icon={IconUser} label="Reporter">
            {job.reporter_name ?? <span className="text-text-tertiary italic">Not assigned</span>}
          </DetailRow>

          <DetailRow icon={IconBuilding} label="Editor">
            {job.editor_name ?? <span className="text-text-tertiary italic">Not assigned</span>}
          </DetailRow>
        </div>
      </div>

      {/* Timeline card */}
      <div className="bg-white rounded-2xl border border-border-base p-6">
        <h2 className="text-sm font-semibold text-text-primary mb-6">Timeline</h2>
        <JobTimelineSteps job={job} />
      </div>

    </div>
  )
}
