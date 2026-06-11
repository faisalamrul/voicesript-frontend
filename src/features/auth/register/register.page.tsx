import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    // TODO: connect to API
    navigate('/auth/login')
  }

  return (
    <div className="bg-white rounded-2xl border border-border-base shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Daftar</h1>
        <p className="mt-1 text-sm text-text-secondary">VoiceScript</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Nama</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Nama lengkap"
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-bg-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="email@contoh.com"
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-bg-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="Min. 8 karakter"
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-bg-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Konfirmasi Password</label>
          <input
            type="password"
            name="confirmPassword"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Ulangi password"
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-bg-base"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          Daftar
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-text-secondary">
        Sudah punya akun?{' '}
        <Link to="/auth/login" className="text-primary font-medium hover:text-primary-hover hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  )
}
