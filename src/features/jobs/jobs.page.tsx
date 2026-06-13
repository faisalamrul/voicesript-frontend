import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { useAuthStore } from '@/store/auth.store'
import { JobsTable } from './components/jobs-table'
import { CreateJobModal } from './components/create-job-modal'
import { TranscriptDetail } from './components/transcript-detail'
import type { Job } from './types/job.types'

export function JobsPage() {
  useDocumentTitle('Jobs')
  const [isOpen, setIsOpen] = useState(false)
  const [viewingJob, setViewingJob] = useState<Job | null>(null)
  const userRole = useAuthStore((s) => s.user?.role)
  const isAdmin = userRole === 'admin'

  if (viewingJob) {
    return <TranscriptDetail job={viewingJob} onBack={() => setViewingJob(null)} />
  }

  return (
    <>
      <div>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Jobs</h1>
            <p className="mt-2 text-text-secondary">All active and completed transcription jobs.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              <IconPlus size={16} aria-hidden="true" />
              Add Job
            </button>
          )}
        </div>

        <JobsTable onViewTranscript={setViewingJob} />
      </div>

      <CreateJobModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
