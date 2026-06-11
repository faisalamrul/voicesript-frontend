import { useState } from 'react'
import { IconX, IconDeviceFloppy, IconShield, IconUser, IconMail } from '@tabler/icons-react'
import type { UserRole } from '@/shared/types'
import type { AppUser } from '../types/user.types'

interface EditRoleFormProps {
  user: AppUser
  onCancel: () => void
  onSubmit: (id: string, role: UserRole) => void
}

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  { value: 'admin',    label: 'Admin',    desc: 'Akses penuh ke semua fitur' },
  { value: 'reporter', label: 'Reporter', desc: 'Membuat dan mengelola laporan' },
  { value: 'reviewer', label: 'Reviewer', desc: 'Mereview dan memvalidasi laporan' },
]

export function EditRoleForm({ user, onCancel, onSubmit }: EditRoleFormProps) {
  const [role, setRole] = useState<UserRole>(user.role)

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Colored header */}
      <div className="bg-primary px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <IconShield size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Edit Role</h2>
            <p className="text-xs text-white/60 mt-0.5">Hanya role yang dapat diubah</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
          <IconX size={18} />
        </button>
      </div>

      <div className="px-6 py-6 flex flex-col gap-5">
        {/* User info — readonly */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Nama</label>
            <div className="relative">
              <IconUser size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                disabled
                value={user.name}
                className="w-full h-10 pl-9 pr-3 border border-border-base rounded-lg text-sm bg-bg-surface text-text-tertiary cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <div className="relative">
              <IconMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                disabled
                value={user.email}
                className="w-full h-10 pl-9 pr-3 border border-border-base rounded-lg text-sm bg-bg-surface text-text-tertiary cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border-base" />

        {/* Role selector */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Role
            <span className="ml-2 text-xs font-normal text-accent">(dapat diubah)</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all ${
                  role === opt.value
                    ? 'border-primary bg-primary-subtle'
                    : 'border-border-base hover:border-text-tertiary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <IconShield size={14} className={role === opt.value ? 'text-primary' : 'text-text-tertiary'} />
                  {role === opt.value && <span className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className={`text-sm font-semibold mt-1 ${role === opt.value ? 'text-primary' : 'text-text-primary'}`}>
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
          Batal
        </button>
        <button
          type="button"
          onClick={() => onSubmit(user.id, role)}
          disabled={role === user.role}
          className="h-9 px-5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-sm"
        >
          <IconDeviceFloppy size={15} />
          Simpan
        </button>
      </div>
    </div>
  )
}
