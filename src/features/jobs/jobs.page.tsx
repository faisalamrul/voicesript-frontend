import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { useDocumentTitle } from '@/shared/hooks/use-document-title'
import { JobsTable } from './components/jobs-table'
import { JobForm } from './components/job-form'

export function JobsPage() {
  useDocumentTitle('Jobs')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Jobs</h1>
            <p className="mt-2 text-text-secondary">Daftar seluruh pekerjaan yang sedang berjalan maupun sudah selesai.</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <IconPlus size={16} />
            Tambah Job
          </button>
        </div>

        <JobsTable />
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <JobForm
              onCancel={() => setIsOpen(false)}
              onSubmit={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
