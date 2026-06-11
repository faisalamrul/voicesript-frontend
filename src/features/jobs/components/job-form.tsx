import { useState } from 'react'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { createJobApi } from '../api/jobs.api'

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
function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text-primary mb-1">
      {children}
    </label>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-text-tertiary mt-0.5 leading-relaxed">{children}</p>
}

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
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

  function handleChange(field: keyof TimeValue, raw: string) {
    const num = raw.replace(/\D/g, '').slice(0, 2)
    onChange({ ...value, [field]: num })
  }

  const segments: { field: keyof TimeValue; label: string; max: number }[] = [
    { field: 'hours', label: 'Hours', max: 23 },
    { field: 'minutes', label: 'Minutes', max: 59 },
    { field: 'seconds', label: 'Seconds', max: 59 },
  ]

  return (
    <div>
      <div className="flex items-end gap-2">
        {segments.map((seg, i) => (
          <div key={seg.field} className="flex items-end gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 w-full">
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-widest">
                {seg.label}
              </span>
              <input
                id={seg.field}
                type="number"
                min={0}
                max={seg.max}
                value={value[seg.field]}
                onChange={(e) => handleChange(seg.field, e.target.value)}
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
            <span className="text-xs text-text-tertiary">{totalSeconds} detik</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Reporter pay</span>
            <span className="text-base font-semibold text-green-600">{formatRupiah(pay)}</span>
            <span className="text-xs text-text-tertiary">ceil({totalMinutes} min) × Rp 2.000</span>
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
      desc: 'Reporter on-site. Same-city reporter preferred.',
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
      desc: 'Work from anywhere. Any available reporter.',
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
          className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${
            value === opt.value
              ? 'border-primary bg-primary-subtle'
              : 'border-border-base bg-white hover:border-text-tertiary'
          }`}
        >
          <div className={`flex items-center gap-2 font-medium text-sm ${value === opt.value ? 'text-primary' : 'text-text-primary'}`}>
            <span className={value === opt.value ? 'text-primary' : 'text-text-tertiary'}>{opt.icon}</span>
            {opt.label}
            {value === opt.value && (
              <span className="ml-auto">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.09-7.09 1.41 1.41L10 16.5z" />
                </svg>
              </span>
            )}
          </div>
          <p className="text-xs text-text-tertiary leading-relaxed">{opt.desc}</p>
        </button>
      ))}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge() {
  return (
    <div className="flex items-center gap-3 bg-bg-surface border border-border-base rounded-lg px-4 py-3">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white border border-border-base text-text-secondary tracking-wide">
        NEW
      </span>
      <span className="text-xs text-text-tertiary">Auto-set by system — changes as workflow progresses</span>
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
  const [apiError, setApiError] = useState('')

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
    setApiError('')
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setIsLoading(true)
    Swal.fire({
      title: 'Menyimpan...',
      text: 'Mohon tunggu sebentar.',
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
        title: 'Berhasil!',
        text: 'Job baru berhasil dibuat.',
        confirmButtonColor: '#1F3A2F',
        timer: 2000,
        timerProgressBar: true,
      })
      onSubmit()
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.',
        confirmButtonColor: '#1F3A2F',
      })
      setApiError(err instanceof Error ? err.message : 'Terjadi kesalahan.')
    } finally {
      setIsLoading(false)
    }
  }

  const totalSeconds = toTotalSeconds(form.time)
  const isValid = form.case_name.trim() !== '' && totalSeconds > 0 && form.city.trim() !== ''

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl border border-border-base overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border-base flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Tambah Job</h2>
          <p className="text-sm text-text-tertiary mt-0.5">Create a transcription job from court audio.</p>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-surface transition-colors"
        >
          <IconX size={18} />
        </button>
      </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* Case name */}
          <div>
            <Label htmlFor="case_name">Case name</Label>
            <input
              id="case_name"
              type="text"
              value={form.case_name}
              onChange={(e) => handleChange('case_name', e.target.value)}
              placeholder="e.g. State v. Wijaya"
              className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${errors.case_name ? 'border-red-400' : 'border-border-base'}`}
            />
            <ErrorMsg message={errors.case_name} />
          </div>

          {/* Duration */}
          <div>
            <Label>Duration</Label>
            <Hint>Length of the audio recording. Reporter pay is rounded up to the nearest minute (ceil).</Hint>
            <div className="mt-2">
              <DurationInput value={form.time} onChange={(v) => handleChange('time', v)} error={errors.duration} />
            </div>
          </div>

          {/* Location */}
          <div>
            <Label>Location</Label>
            <Hint>Physical = reporter must be on-site. Remote = anyone can work from anywhere.</Hint>
            <div className="mt-2">
              <LocationSelector value={form.location} onChange={(v) => handleChange('location', v)} />
            </div>
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city">City</Label>
            <Hint>Used to match same-city reporters.</Hint>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Bandung"
              className={`w-full h-10 px-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition mt-1 ${errors.city ? 'border-red-400' : 'border-border-base'}`}
            />
            <ErrorMsg message={errors.city} />
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Hint>Not editable — auto-set by system on creation.</Hint>
            <div className="mt-1.5">
              <StatusBadge />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-base flex items-center justify-between gap-3">
          <div className="flex-1">
            {apiError && <p className="text-xs text-red-500">{apiError}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="h-9 px-4 text-sm text-text-secondary border border-border-base rounded-lg hover:bg-bg-surface transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (submitted && !isValid)}
              className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <IconPlus size={16} />
              {isLoading ? 'Menyimpan...' : 'Create job'}
            </button>
          </div>
        </div>
    </div>
  )
}
