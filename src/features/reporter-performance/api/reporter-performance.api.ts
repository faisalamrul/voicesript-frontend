import { apiClient } from '@/core/api/api-client'
import type { Job } from '@/features/jobs/types/job.types'
import type { ReporterDetailResponse, ReporterListResponse } from '../types/reporter-performance.types'

export async function fetchReporterList(
  page: number,
  limit: number,
  search?: string,
): Promise<ReporterListResponse> {
  const params = new URLSearchParams({ role: 'reporter', page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  const res = await apiClient(`/admin/users?${params}`)
  if (!res.ok) throw new Error('Failed to load reporters.')
  const json = await res.json()
  return json.data
}

export async function fetchReporterDetail(
  reporterId: string,
  page: number,
  limit: number,
): Promise<ReporterDetailResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const res = await apiClient(`/admin/reporters/${reporterId}?${params}`)
  if (!res.ok) throw new Error('Failed to load reporter detail.')
  const json = await res.json()
  return json.data
}

export async function fetchJobDetail(jobId: string): Promise<Job> {
  const res = await apiClient(`/jobs/${jobId}`)
  if (!res.ok) throw new Error('Failed to load job.')
  const json = await res.json()
  return json.data.job
}
