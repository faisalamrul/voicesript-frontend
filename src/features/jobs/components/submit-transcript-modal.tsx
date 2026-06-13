import { useState, useEffect, useRef } from 'react'
import { IconFileText, IconX, IconCheck, IconLoader2, IconClock } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { useFocusTrap } from '@/shared/hooks/use-focus-trap'
import { submitTranscript } from '../api/jobs.api'
import { formatDurationLabel } from '../utils/modal-helpers'
import { SWAL_PRIMARY } from '@/shared/constants'
import type { Job } from '../types/job.types'

interface SubmitTranscriptModalProps {
  job: Job
  onClose: () => void
}

export function SubmitTranscriptModal({ job, onClose }: SubmitTranscriptModalProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useFocusTrap<HTMLDivElement>()
  const queryClient = useQueryClient()

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit() {
    setLoading(true)
    Swal.fire({
      title: 'Submitting...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    })
    try {
      await submitTranscript(job.id, notes)
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
      await Swal.fire({
        icon: 'success',
        title: 'Submitted!',
        text: 'Transcript has been submitted successfully.',
        confirmButtonColor: SWAL_PRIMARY,
        timer: 2000,
        timerProgressBar: true,
      })
      onClose()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to submit transcript.',
        confirmButtonColor: SWAL_PRIMARY,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Submit Transcript"
        className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-primary flex items-start gap-3 px-5 py-5 rounded-t-2xl">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-white/10 flex items-center justify-center" aria-hidden="true">
            <IconFileText size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white">Submit Transcript</h3>
            <p className="text-xs text-white/60 mt-0.5 truncate">{job.case_name}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IconX size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Job info strip */}
        <div className="px-5 pt-4">
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-subtle flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <IconClock size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Duration</p>
              <p className="text-sm font-semibold text-gray-800">{formatDurationLabel(job.duration)}</p>
            </div>
            <div className="ml-auto">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider text-right">Status after</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-100 text-cyan-700">
                TRANSCRIBED
              </span>
            </div>
          </div>
        </div>

        {/* Notes field */}
        <div className="px-5 pt-4">
          <label htmlFor="transcript-notes" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Transcript Notes <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="transcript-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes or comments about the transcript..."
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-border-base rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary resize-none text-text-primary placeholder:text-gray-300"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 mt-3 bg-bg-surface border-t border-border-base flex items-center justify-end gap-2 rounded-b-2xl">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            disabled={loading}
            className="h-9 px-5 text-sm text-text-secondary border border-border-base rounded-lg bg-white hover:bg-white/80 transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <IconLoader2 size={14} className="animate-spin" aria-hidden="true" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <IconCheck size={14} aria-hidden="true" />
                <span>Submit Transcript</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
