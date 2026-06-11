import { useNavigate } from 'react-router-dom'

export function ForbiddenPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-bg-base">
      <h1 className="text-6xl font-bold text-primary-subtle">403</h1>
      <p className="mt-4 text-xl text-text-primary">Access denied</p>
      <p className="mt-2 text-sm text-text-secondary">You don't have permission to view this page.</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-hover transition-colors"
      >
        Go back
      </button>
    </div>
  )
}
