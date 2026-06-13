import { Link, useParams } from 'react-router-dom'
import { IconArrowLeft, IconBriefcase, IconCheck, IconCircleCheck, IconEdit, IconFileText, IconUser } from '@tabler/icons-react'
import { useEditorJobDetail } from './hooks/use-editor-job-detail'
import type { Job, JobStatus } from '@/features/jobs/types/job.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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

// ─── Timeline ─────────────────────────────────────────────────────────────────

type TimelineKey =
  | 'created_at'
  | 'reporter_assigned_at'
  | 'submitted_at'
  | 'editor_assigned_at'
  | 'reviewed_at'
  | 'completed_at'

interface TimelineStep {
  key: TimelineKey
  title: string
  icon: React.ElementType
}

const STEPS: TimelineStep[] = [
  { key: 'created_at',           title: 'Job Created',          icon: IconBriefcase   },
  { key: 'reporter_assigned_at', title: 'Reporter Assigned',    icon: IconUser        },
  { key: 'submitted_at',         title: 'Transcript Submitted', icon: IconFileText    },
  { key: 'editor_assigned_at',   title: 'Editor Assigned',      icon: IconEdit        },
  { key: 'reviewed_at',          title: 'Reviewed',             icon: IconCheck       },
  { key: 'completed_at',         title: 'Completed',            icon: IconCircleCheck },
]

function JobTimelineSteps({ job }: { job: Job }) {
  return (
    <div>
      {STEPS.map((step, index) => {
        const timestamp = job[step.key] as string | null
        const isDone    = !!timestamp
        const isLast    = index === STEPS.length - 1

        return (
          <div key={step.key} className="flex gap-5">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                isDone
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-border-base text-text-tertiary'
              }`}>
                <step.icon size={15} aria-hidden="true" />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 min-h-8 ${isDone ? 'bg-primary/25' : 'bg-border-base'}`} />
              )}
            </div>
            <div className={`flex-1 pt-1.5 ${isLast ? '' : 'pb-8'}`}>
              <p className={`font-semibold text-sm ${isDone ? 'text-text-primary' : 'text-text-tertiary'}`}>
                {step.title}
              </p>
              {timestamp ? (
                <p className="text-xs text-text-tertiary mt-0.5">{formatDateTime(timestamp)}</p>
              ) : (
                <p className="text-xs text-text-tertiary italic mt-0.5">Pending</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EditorJobTimelinePage() {
  const { editorId, jobId } = useParams<{ editorId: string; jobId: string }>()
  const { data: job, isLoading, isError } = useEditorJobDetail(jobId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-2xl border border-border-base p-6 space-y-3 animate-pulse">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-64 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
        <div className="bg-white rounded-2xl border border-border-base p-6 space-y-6 animate-pulse">
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
        <Link to={`/admin/editors/${editorId}`} className="text-sm text-primary hover:underline">
          ← Back to editor
        </Link>
      </div>
    )
  }

  const editorName = job.editor_name ?? 'Editor'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-tertiary">
        <Link to="/admin/editors" className="hover:text-text-primary transition-colors">Editors</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/admin/editors/${editorId}`} className="hover:text-text-primary transition-colors">{editorName}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-text-secondary truncate">{job.case_name}</span>
      </div>

      {/* Back link */}
      <Link
        to={`/admin/editors/${editorId}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors w-fit -mt-3"
      >
        <IconArrowLeft size={15} aria-hidden="true" />
        {editorName}
      </Link>

      {/* Job header */}
      <div className="bg-white rounded-2xl border border-border-base p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Case</p>
            <h1 className="text-xl font-bold text-text-primary">{job.case_name}</h1>
            <p className="text-sm text-text-secondary mt-1">{editorName}</p>
          </div>
          <StatusBadge status={job.status} />
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
