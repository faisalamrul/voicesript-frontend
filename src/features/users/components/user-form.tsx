import { useState, type FormEvent } from 'react'
import { IconX, IconUserPlus, IconMail, IconUser, IconLock, IconShield, IconMapPin } from '@tabler/icons-react'
import type { UserRole } from '@/shared/types'
import type { CreateUserPayload } from '../api/users.api'

interface UserFormProps {
  onCancel: () => void
  onSubmit: (data: CreateUserPayload) => void
}

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: 'admin',    label: 'Admin',    desc: 'Full access to all features' },
  { value: 'reporter', label: 'Reporter', desc: 'Create and manage reports' },
  { value: 'editor',   label: 'Editor',   desc: 'Edit and validate reports' },
]

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">⚠ {message}</p>
}

export function UserForm({ onCancel, onSubmit }: UserFormProps) {
  const [form, setForm] = useState({ name: '', email: '', password: '', city: '', role: 'reporter' as UserRole })
  const [errors, setErrors] = useState<Partial<typeof form>>({})
  const [submitted, setSubmitted] = useState(false)

  function validate(values: typeof form) {
    const errs: Partial<typeof form> = {}
    if (!values.name.trim()) errs.name = 'Name is required.'
    if (!values.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Invalid email format.'
    if (!values.password) errs.password = 'Password is required.'
    else if (values.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    if (!values.city.trim()) errs.city = 'Location is required.'
    return errs
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    if (submitted) setErrors(validate(next))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onSubmit({ name: form.name.trim(), email: form.email.trim(), password: form.password, city: form.city.trim(), role: form.role })
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Colored header strip */}
      <div className="bg-primary px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center" aria-hidden="true">
            <IconUserPlus size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Add User</h2>
            <p className="text-xs text-white/60 mt-0.5">Register a new account with a role</p>
          </div>
        </div>
        <button onClick={onCancel} aria-label="Close" className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <IconX size={18} aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-6 py-6 flex flex-col gap-5">
          {/* Name + Email row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-name" className="block text-sm font-medium text-text-primary mb-1.5">Name</label>
              <div className="relative">
                <IconUser size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  id="user-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.name ? 'border-red-400' : 'border-border-base'}`}
                />
              </div>
              <ErrorMsg message={errors.name} />
            </div>

            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <div className="relative">
                <IconMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  id="user-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.email ? 'border-red-400' : 'border-border-base'}`}
                />
              </div>
              <ErrorMsg message={errors.email} />
            </div>
          </div>

          {/* Password + City row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-password" className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <div className="relative">
                <IconLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  id="user-password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.password ? 'border-red-400' : 'border-border-base'}`}
                />
              </div>
              <ErrorMsg message={errors.password} />
            </div>

            <div>
              <label htmlFor="user-city" className="block text-sm font-medium text-text-primary mb-1.5">City</label>
              <div className="relative">
                <IconMapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  id="user-city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className={`w-full h-10 pl-9 pr-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.city ? 'border-red-400' : 'border-border-base'}`}
                />
              </div>
              <ErrorMsg message={errors.city} />
            </div>
          </div>

          {/* Role cards */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
            <div className="grid grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, role: opt.value }))}
                  aria-pressed={form.role === opt.value}
                  className={`flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all ${
                    form.role === opt.value
                      ? 'border-primary bg-primary-subtle'
                      : 'border-border-base hover:border-text-tertiary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <IconShield size={14} className={form.role === opt.value ? 'text-primary' : 'text-text-tertiary'} aria-hidden="true" />
                    {form.role === opt.value && (
                      <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                    )}
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${form.role === opt.value ? 'text-primary' : 'text-text-primary'}`}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-text-tertiary leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-bg-surface border-t border-border-base flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="h-9 px-5 text-sm text-text-secondary border border-border-base rounded-lg bg-white hover:bg-white/80 transition">
            Cancel
          </button>
          <button type="submit" className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition flex items-center gap-2 shadow-sm">
            <IconUserPlus size={15} aria-hidden="true" />
            Add User
          </button>
        </div>
      </form>
    </div>
  )
}
