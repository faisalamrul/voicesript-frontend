import { useState } from 'react'
import { IconBriefcase, IconMapPin, IconX, IconDeviceFloppy } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { createJobApi } from '../api/jobs.api'
import { SWAL_PRIMARY } from '@/shared/constants'

// ─── Types ────────────────────────────────────────────────────────────────────
type JobLocation = 'physical' | 'remote'

interface TimeValue {
  hours: string
  minutes: string
  seconds: string
}

interface FormValues {
  case_name: string
  location: JobLocation
  city: string
  time: TimeValue
}

interface FormErrors {
  case_name?: string
  duration?: string
  city?: string
}

interface JobFormProps {
  onCancel: () => void
  onSubmit: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const REPORTER_RATE = 2000

function pad(n: string | number): string {
  return String(n).padStart(2, '0')
}

function toTotalSeconds(t: TimeValue): number {
  return (parseInt(t.hours) || 0) * 3600 + (parseInt(t.minutes) || 0) * 60 + (parseInt(t.seconds) || 0)
}

function toDisplayTime(t: TimeValue): string {
  return `${pad(t.hours || 0)}:${pad(t.minutes || 0)}:${pad(t.seconds || 0)}`
}

function calcPay(totalSeconds: number): number {
  return Math.ceil(totalSeconds / 60) * REPORTER_RATE
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
      <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11z" />
      </svg>
      {message}
    </p>
  )
}

// ─── Duration Input ───────────────────────────────────────────────────────────
function DurationInput({ value, onChange, error }: { value: TimeValue; onChange: (v: TimeValue) => void; error?: string }) {
  const totalSeconds = toTotalSeconds(value)
  const totalMinutes = Math.ceil(totalSeconds / 60)
  const pay = calcPay(totalSeconds)

  function handleChange(field: keyof TimeValue, raw: string, max: number) {
    const digits = raw.replace(/\D/g, '').slice(0, 2)
    const clamped = digits !== '' && parseInt(digits) > max ? String(max) : digits
    onChange({ ...value, [field]: clamped })
  }

  const segments: { field: keyof TimeValue; label: string; max: number }[] = [
    { field: 'hours',   label: 'Hours',   max: 99 },
    { field: 'minutes', label: 'Minutes', max: 59 },
    { field: 'seconds', label: 'Seconds', max: 59 },
  ]

  return (
    <div>
      <div className="flex items-end gap-2">
        {segments.map((seg, i) => (
          <div key={seg.field} className="flex items-end gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 w-full">
              <label htmlFor={seg.field} className="text-[10px] font-medium text-text-tertiary uppercase tracking-widest cursor-pointer">
                {seg.label}
              </label>
              <input
                id={seg.field}
                type="number"
                min={0}
                max={seg.max}
                value={value[seg.field]}
                onChange={(e) => handleChange(seg.field, e.target.value, seg.max)}
                placeholder="00"
                className={`w-full h-12 text-center text-xl font-semibold border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${error ? 'border-red-400' : 'border-border-base'}`}
              />
            </div>
            {i < segments.length - 1 && (
              <span className="text-2xl font-light text-text-tertiary pb-2.5">:</span>
            )}
          </div>
        ))}
      </div>

      <ErrorMsg message={error} />

      {totalSeconds > 0 && (
        <div className="mt-3 flex items-center justify-between bg-bg-surface border border-border-base rounded-lg px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Duration</span>
            <span className="text-sm font-semibold text-text-primary">{toDisplayTime(value)}</span>
            <span className="text-xs text-text-tertiary">{totalSeconds} seconds</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Reporter pay</span>
            <span className="text-base font-semibold text-green-600">{formatRupiah(pay)}</span>
            <span className="text-xs text-text-tertiary">ceil({totalMinutes} min) × Rp 2,000</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Location Selector ────────────────────────────────────────────────────────
function LocationSelector({ value, onChange }: { value: JobLocation; onChange: (v: JobLocation) => void }) {
  const options: { value: JobLocation; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: 'physical',
      label: 'Physical',
      desc: 'Reporter must be present at the location.',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      ),
    },
    {
      value: 'remote',
      label: 'Remote',
      desc: 'Reporter can work from anywhere.',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${
            value === opt.value
              ? 'border-primary bg-primary-subtle'
              : 'border-border-base bg-white hover:border-text-tertiary'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={value === opt.value ? 'text-primary' : 'text-text-tertiary'}>{opt.icon}</span>
            {value === opt.value && <span className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <p className={`text-sm font-semibold mt-1 ${value === opt.value ? 'text-primary' : 'text-text-primary'}`}>
            {opt.label}
          </p>
          <p className="text-[11px] text-text-tertiary leading-relaxed">{opt.desc}</p>
        </button>
      ))}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export function JobForm({ onCancel, onSubmit }: JobFormProps) {
  const queryClient = useQueryClient()

  const [form, setForm] = useState<FormValues>({
    case_name: '',
    location: 'physical',
    city: '',
    time: { hours: '0', minutes: '0', seconds: '0' },
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function validate(values: FormValues): FormErrors {
    const errs: FormErrors = {}
    if (!values.case_name.trim()) errs.case_name = 'Case name is required.'
    if (toTotalSeconds(values.time) < 1) errs.duration = 'Duration must be at least 1 second.'
    if (!values.city.trim()) errs.city = 'City is required.'
    return errs
  }

  function handleChange<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    const next = { ...form, [key]: val }
    setForm(next)
    if (submitted) setErrors(validate(next))
  }

  async function handleSubmit() {
    setSubmitted(true)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    Swal.fire({
      title: 'Saving...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    })

    try {
      await createJobApi({
        case_name: form.case_name.trim(),
        duration: toTotalSeconds(form.time),
        location: form.location,
        city: form.city.trim(),
      })
      await queryClient.invalidateQueries({ queryKey: ['jobs'] })
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'New job created successfully.',
        confirmButtonColor: SWAL_PRIMARY,
        timer: 2000,
        timerProgressBar: true,
      })
      onSubmit()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        confirmButtonColor: SWAL_PRIMARY,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isValid = form.case_name.trim() !== '' && toTotalSeconds(form.time) > 0 && form.city.trim() !== ''

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-xl">

      {/* Primary header */}
      <div className="bg-primary px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <IconBriefcase size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Add Job</h2>
            <p className="text-xs text-white/60 mt-0.5">Create a new transcription job</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          aria-label="Close"
          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <IconX size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="px-6 py-6 flex flex-col gap-5">

        {/* Case Name */}
        <div>
          <label htmlFor="case_name" className="block text-sm font-medium text-text-primary mb-1.5">Case Name</label>
          <div className="relative">
            <IconBriefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              id="case_name"
              type="text"
              value={form.case_name}
              onChange={(e) => handleChange('case_name', e.target.value)}
              placeholder="e.g. Case No. 123/Pid.B"
              className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${errors.case_name ? 'border-red-400' : 'border-border-base'}`}
            />
          </div>
          <ErrorMsg message={errors.case_name} />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Duration</label>
          <p className="text-xs text-text-tertiary mb-2">Audio recording duration. Reporter pay is rounded up per minute.</p>
          <DurationInput value={form.time} onChange={(v) => handleChange('time', v)} error={errors.duration} />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Location</label>
          <p className="text-xs text-text-tertiary mb-2">Physical = reporter must be present. Remote = reporter can work from anywhere.</p>
          <LocationSelector value={form.location} onChange={(v) => handleChange('location', v)} />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-text-primary mb-1.5">City</label>
          <div className="relative">
            <IconMapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Bandung"
              className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${errors.city ? 'border-red-400' : 'border-border-base'}`}
            />
          </div>
          <ErrorMsg message={errors.city} />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
          <div className="flex items-center gap-3 bg-bg-surface border border-border-base rounded-lg px-4 py-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-border-base text-text-secondary tracking-wide">
              NEW
            </span>
            <span className="text-xs text-text-tertiary">Set automatically — changes as the job progresses</span>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-bg-surface border-t border-border-base flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="h-9 px-5 text-sm text-text-secondary border border-border-base rounded-lg bg-white hover:bg-white/80 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || (submitted && !isValid)}
          className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-sm"
        >
          <IconDeviceFloppy size={15} />
          {isLoading ? 'Saving...' : 'Create Job'}
        </button>
      </div>
    </div>
  )
}
