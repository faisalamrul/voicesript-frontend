import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { loginApi } from '../api/auth.api'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await loginApi(email, password)
      login({
        user: res.data.user,
        allowedMenus: res.data.allowed_menus,
      })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border-base shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Sign In</h1>
        <p className="mt-1 text-sm text-text-secondary">VoiceScript</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            disabled={isLoading}
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-bg-base disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={isLoading}
            className="w-full border border-border-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-bg-base disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-primary font-medium hover:text-primary-hover hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}
