import { useState, useEffect, useRef } from 'react'
import { IconUserCheck, IconMapPin, IconWifi, IconX, IconCheck, IconLoader2 } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { useFocusTrap } from '@/shared/hooks/use-focus-trap'
import { useReporters } from '../hooks/use-reporters'
import { assignReporter } from '../api/jobs.api'
import { getInitials, formatDurationLabel } from '../utils/modal-helpers'
import { SWAL_PRIMARY } from '@/shared/constants'
import type { Job } from '../types/job.types'
import type { Reporter } from '../api/jobs.api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPay(seconds: number) {
  const pay = Math.floor(seconds / 60) * 2000
  return `Rp ${pay.toLocaleString('id-ID')}`
}

// ─── Reporter Tag ─────────────────────────────────────────────────────────────

function ReporterTag({ reporter, jobLocation, jobCity }: {
  reporter: Reporter
  jobLocation: string
  jobCity: string
}) {
  if (reporter.has_active_job) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">
        On job
      </span>
    )
  }
  const isPhysical = jobLocation.toUpperCase() === 'PHYSICAL'
  if (isPhysical && reporter.city === jobCity) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
        <IconMapPin size={10} aria-hidden="true" />
        Same city · recommended
      </span>
    )
  }
  if (reporter.city === 'Remote') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
        Remote — allowed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 text-gray-500">
      Allowed
    </span>
  )
}

// ─── Reporter Row ─────────────────────────────────────────────────────────────

function ReporterRow({ reporter, jobLocation, jobCity, selected, onSelect }: {
  reporter: Reporter
  jobLocation: string
  jobCity: string
  selected: boolean
  onSelect: () => void
}) {
  const disabled = reporter.has_active_job
  const isRemote = reporter.city === 'Remote'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all
        ${selected
          ? 'border-primary bg-primary-subtle'
          : disabled
          ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 cursor-pointer'
        }`}
    >
      <span className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-semibold
        ${selected ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}
        aria-hidden="true"
      >
        {getInitials(reporter.name)}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${selected ? 'text-primary' : 'text-gray-900'}`}>
          {reporter.name}
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
          {isRemote ? <IconWifi size={11} aria-hidden="true" /> : <IconMapPin size={11} aria-hidden="true" />}
          {reporter.city} · {reporter.has_active_job ? 'on job' : 'available'}
        </p>
      </div>

      <ReporterTag reporter={reporter} jobLocation={jobLocation} jobCity={jobCity} />

      {selected && <IconCheck size={16} className="text-primary flex-shrink-0" aria-hidden="true" />}
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface AssignReporterModalProps {
  job: Job
  onClose: () => void
}

export function AssignReporterModal({ job, onClose }: AssignReporterModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useFocusTrap<HTMLDivElement>()
  const queryClient = useQueryClient()

  const { data: reporters = [], isLoading: loadingReporters } = useReporters()

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isPhysical = job.location.toUpperCase() === 'PHYSICAL'

  const sorted = [...reporters].sort((a, b) => {
    if (a.has_active_job !== b.has_active_job) return a.has_active_job ? 1 : -1
    if (isPhysical) return (a.city === job.city ? 0 : 1) - (b.city === job.city ? 0 : 1)
    return 0
  })

  const selected = reporters.find((r) => r.id === selectedId)

  async function handleConfirm() {
    if (!selectedId) return
    setLoading(true)
    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    })
    try {
      await assignReporter(job.id, selectedId)
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
      await queryClient.invalidateQueries({ queryKey: ['reporters'] })
      await Swal.fire({
        icon: 'success',
        title: 'Reporter Assigned!',
        text: `${selected?.name} has been assigned to this job.`,
        confirmButtonColor: SWAL_PRIMARY,
        timer: 2000,
        timerProgressBar: true,
      })
      onClose()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Failed to assign reporter.',
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
        aria-label="Assign Reporter"
        className="bg-white rounded-2xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-primary flex items-start gap-3 px-5 py-5 rounded-t-2xl">
          <div className="w-9 h-9 flex-shrink-0 rounded-xl bg-white/10 flex items-center justify-center" aria-hidden="true">
            <IconUserCheck size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white">Assign Reporter</h3>
            <p className="text-xs text-white/60 mt-0.5 truncate">
              {job.case_name} · {isPhysical ? `Physical · ${job.city}` : 'Remote'}
            </p>
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
          <div className="bg-gray-50 rounded-xl px-4 py-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Duration</p>
              <p className="text-sm font-semibold text-gray-800">{formatDurationLabel(job.duration)}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Reporter pay</p>
              <p className="text-sm font-semibold text-emerald-600">{formatPay(job.duration)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Rp 2.000/menit</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Status after</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
                ASSIGNED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            {isPhysical ? (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 flex-shrink-0">
                  <IconMapPin size={10} aria-hidden="true" />
                  {job.city}
                </span>
                <span className="text-xs text-gray-400">Same-city reporters are recommended.</span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-50 text-violet-700 flex-shrink-0">
                  <IconWifi size={10} aria-hidden="true" />
                  Remote
                </span>
                <span className="text-xs text-gray-400">Any available reporter can be assigned.</span>
              </>
            )}
          </div>
        </div>

        {/* Reporter list */}
        <div className="px-5 pt-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            {isPhysical ? 'Reporters — same city first' : 'Available reporters'}
          </p>

          {loadingReporters ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <IconLoader2 size={18} className="animate-spin mr-2" aria-hidden="true" />
              <span className="text-sm">Loading reporters...</span>
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No reporters found.</p>
          ) : (
            <div className="flex flex-col gap-2 pb-2">
              {sorted.map((reporter) => (
                <ReporterRow
                  key={reporter.id}
                  reporter={reporter}
                  jobLocation={job.location}
                  jobCity={job.city}
                  selected={selectedId === reporter.id}
                  onSelect={() => setSelectedId(reporter.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-bg-surface border-t border-border-base flex items-center justify-between">
          <p className="text-xs text-gray-400" role="status" aria-live="polite">
            {selected
              ? <span className="text-gray-600 font-medium">{selected.name} selected</span>
              : 'Select a reporter to continue'
            }
          </p>
          <div className="flex items-center gap-2">
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
              onClick={handleConfirm}
              disabled={!selectedId || loading}
              className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              {loading ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconCheck size={14} aria-hidden="true" />
                  <span>Assign Reporter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
