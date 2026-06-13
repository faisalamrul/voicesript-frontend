import { useState } from 'react'
import {
  IconArrowLeft, IconUser, IconMapPin, IconWifi,
  IconClock, IconCalendar, IconAlignLeft, IconCheck,
  IconLoader2, IconCircleCheckFilled,
} from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { formatDurationLabel, getInitials } from '../utils/modal-helpers'
import { submitReview } from '../api/jobs.api'
import { SWAL_PRIMARY } from '@/shared/constants'
import type { Job } from '../types/job.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatPay(seconds: number) {
  const pay = Math.floor(seconds / 60) * 2000
  return `Rp ${pay.toLocaleString('id-ID')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TranscriptDetailProps {
  job: Job
  onBack: () => void
}

export function TranscriptDetail({ job, onBack }: TranscriptDetailProps) {
  const [loading, setLoading] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const queryClient = useQueryClient()

  const isPhysical = job.location?.toUpperCase() === 'PHYSICAL'
  const transcriptContent = job.transcript_notes
  // also guards deep-link access where status may already be REVIEWED/COMPLETED
  const alreadyReviewed = job.status === 'REVIEWED' || job.status === 'COMPLETED'

  async function handleSubmitReview() {
    const result = await Swal.fire({
      title: 'Mark as Reviewed?',
      text: 'This will move the job to Reviewed status.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: SWAL_PRIMARY,
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, mark reviewed',
      cancelButtonText: 'Cancel',
    })
    if (!result.isConfirmed) return

    setLoading(true)
    Swal.fire({
      title: 'Submitting review...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    })
    try {
      await submitReview(job.id, reviewNotes)
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
      await Swal.fire({
        icon: 'success',
        title: 'Reviewed!',
        text: 'Job has been marked as reviewed.',
        confirmButtonColor: SWAL_PRIMARY,
        timer: 2000,
        timerProgressBar: true,
      })
      onBack()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to submit review.',
        confirmButtonColor: SWAL_PRIMARY,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors group"
        >
          <IconArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Jobs
        </button>
        <span className="text-gray-300 select-none" aria-hidden="true">/</span>
        <span className="text-sm text-text-primary font-medium truncate max-w-xs">{job.case_name}</span>
      </div>

      {/* Hero banner */}
      <div className="bg-primary rounded-2xl px-6 py-5 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
              Transcribed
            </span>
          </div>
          <h1 className="text-xl font-bold text-white leading-snug">{job.case_name}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              <IconUser size={12} aria-hidden="true" />
              {job.reporter_name ?? '—'}
            </span>
            <span className="text-white/30 select-none">·</span>
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              <IconClock size={12} aria-hidden="true" />
              {formatDurationLabel(job.duration)}
            </span>
            <span className="text-white/30 select-none">·</span>
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              {isPhysical
                ? <IconMapPin size={12} aria-hidden="true" />
                : <IconWifi size={12} aria-hidden="true" />}
              {isPhysical ? `Physical · ${job.city}` : 'Remote'}
            </span>
            <span className="text-white/30 select-none">·</span>
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              <IconCalendar size={12} aria-hidden="true" />
              {formatDateTime(job.submitted_at)}
            </span>
          </div>
        </div>

        {/* Fee chips */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className="bg-white/10 rounded-xl px-4 py-3 text-right border border-white/10">
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Reporter Fee</p>
            <p className="text-lg font-bold text-white">{formatPay(job.duration)}</p>
            <p className="text-[10px] text-white/40 mt-0.5">Rp 2.000/menit</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 text-right border border-white/10">
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Editor Fee</p>
            <p className="text-lg font-bold text-white">Rp 50.000</p>
            <p className="text-[10px] text-white/40 mt-0.5">Flat fee</p>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Left sidebar */}
        <div className="flex flex-col gap-3">

          {/* Reporter card */}
          <div className="bg-white rounded-2xl border border-border-base p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Reporter</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-subtle flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">
                  {job.reporter_name ? getInitials(job.reporter_name) : '?'}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{job.reporter_name ?? '—'}</p>
                <p className="text-xs text-gray-400 mt-0.5">Reporter</p>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white rounded-2xl border border-border-base p-4 flex flex-col divide-y divide-gray-50">
            <div className="flex items-center gap-3 pb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPhysical ? 'bg-emerald-50' : 'bg-violet-50'}`} aria-hidden="true">
                {isPhysical
                  ? <IconMapPin size={14} className="text-emerald-600" />
                  : <IconWifi size={14} className="text-violet-600" />}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {isPhysical ? `${job.city}` : 'Remote'}
                </p>
              </div>
              {isPhysical && (
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  Physical
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 rounded-lg bg-primary-subtle flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <IconClock size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Duration</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDurationLabel(job.duration)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <IconCalendar size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Submitted</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{formatDateTime(job.submitted_at)}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right: transcript + review */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Transcript card */}
          <div className="bg-white rounded-2xl border border-border-base overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50 bg-gray-50/60">
              <IconAlignLeft size={13} className="text-gray-400" aria-hidden="true" />
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Transcript Notes</p>
            </div>
            <div className="px-6 py-5">
              {transcriptContent ? (
                <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">{transcriptContent}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No transcript notes submitted.</p>
              )}
            </div>
          </div>

          {/* Review action card */}
          {alreadyReviewed ? (
            <div className="bg-green-50 rounded-2xl border border-green-100 px-5 py-4 flex items-center gap-3">
              <IconCircleCheckFilled size={20} className="text-green-500 flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-green-700">Transcript reviewed</p>
                <p className="text-xs text-green-600 mt-0.5">This job has been marked as reviewed and forwarded.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border-base overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/60">
                <p className="text-sm font-semibold text-gray-800">Submit Review</p>
                <p className="text-xs text-gray-400 mt-0.5">This will mark the job as reviewed and notify the admin.</p>
              </div>
              <div className="px-5 py-4 flex flex-col gap-3">
                <div>
                  <label htmlFor="review-notes" className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Review Notes <span className="text-gray-300 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes or feedback for the reporter..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-border-base rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary resize-none text-text-primary placeholder:text-gray-300"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={loading}
                    className="flex items-center gap-2 h-9 px-5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    {loading ? (
                      <>
                        <IconLoader2 size={14} className="animate-spin" aria-hidden="true" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <IconCheck size={14} aria-hidden="true" />
                        <span>Mark as Reviewed</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
