import { apiClient } from '@/core/api/api-client'
import type { Job } from '@/features/jobs/types/job.types'
import type { EditorDetailResponse, EditorListResponse } from '../types/editor-performance.types'

export async function fetchEditorList(
  page: number,
  limit: number,
  search?: string,
): Promise<EditorListResponse> {
  const params = new URLSearchParams({ role: 'editor', page: String(page), limit: String(limit) })
  if (search) params.set('search', search)
  const res = await apiClient(`/admin/users?${params}`)
  if (!res.ok) throw new Error('Failed to load editors.')
  const json = await res.json()
  return json.data
}

export async function fetchEditorDetail(
  editorId: string,
  page: number,
  limit: number,
): Promise<EditorDetailResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const res = await apiClient(`/admin/editors/${editorId}?${params}`)
  if (!res.ok) throw new Error('Failed to load editor detail.')
  const json = await res.json()
  return json.data
}

export async function fetchEditorJobDetail(jobId: string): Promise<Job> {
  const res = await apiClient(`/jobs/${jobId}`)
  if (!res.ok) throw new Error('Failed to load job.')
  const json = await res.json()
  return json.data.job
}
