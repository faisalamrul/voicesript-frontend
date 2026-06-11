import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-bg-base">
      <h1 className="text-6xl font-bold text-primary-subtle">404</h1>
      <p className="mt-4 text-xl text-text-primary">Page not found</p>
      <Link
        to="/"
        className="mt-6 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-hover transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
