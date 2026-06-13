import { IconBriefcase, IconCheck, IconCircleCheck, IconEdit, IconFileText, IconUser } from '@tabler/icons-react'
import type { Job } from '../types/job.types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

type TimelineKey =
  | 'created_at'
  | 'reporter_assigned_at'
  | 'submitted_at'
  | 'editor_assigned_at'
  | 'reviewed_at'
  | 'completed_at'

const STEPS: { key: TimelineKey; title: string; icon: React.ElementType }[] = [
  { key: 'created_at',           title: 'Job Created',          icon: IconBriefcase   },
  { key: 'reporter_assigned_at', title: 'Reporter Assigned',    icon: IconUser        },
  { key: 'submitted_at',         title: 'Transcript Submitted', icon: IconFileText    },
  { key: 'editor_assigned_at',   title: 'Editor Assigned',      icon: IconEdit        },
  { key: 'reviewed_at',          title: 'Reviewed',             icon: IconCheck       },
  { key: 'completed_at',         title: 'Completed',            icon: IconCircleCheck },
]

export function JobTimelineSteps({ job }: { job: Job }) {
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
