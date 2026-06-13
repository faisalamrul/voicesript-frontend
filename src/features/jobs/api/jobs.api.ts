import { apiClient } from '@/core/api/api-client'
import type { Job } from '../types/job.types'

export interface CreateJobPayload {
  case_name: string
  duration: number
  location: string
  city: string
}

interface AssignableUser {
  id: string
  name: string
  city: string
  has_active_job: boolean
}

export interface Reporter extends AssignableUser {}
export interface Editor extends AssignableUser {}

export async function createJobApi(payload: CreateJobPayload): Promise<Job> {
  const res = await apiClient('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Failed to create job.')
  }
  return json.data.job
}

export async function fetchReporters(): Promise<Reporter[]> {
  const res = await apiClient('/admin/users?role=reporter&limit=100')
  if (!res.ok) throw new Error('Failed to load reporters.')
  const json = await res.json()
  return json.data.users
}

export async function fetchEditors(): Promise<Editor[]> {
  const res = await apiClient('/admin/users?role=editor&limit=100')
  if (!res.ok) throw new Error('Failed to load editors.')
  const json = await res.json()
  return json.data.users
}

export async function assignEditor(jobId: string, editorId: string): Promise<Job> {
  const res = await apiClient(`/jobs/${jobId}/assign-editor`, {
    method: 'POST',
    body: JSON.stringify({ editor_id: editorId }),
  })
  if (!res.ok) throw new Error(`Failed to assign editor. (${res.status})`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Failed to assign editor.')
  return json.data.job
}

export async function assignReporter(jobId: string, reporterId: string): Promise<Job> {
  const res = await apiClient(`/jobs/${jobId}/assign-reporter`, {
    method: 'POST',
    body: JSON.stringify({ reporter_id: reporterId }),
  })
  if (!res.ok) throw new Error(`Failed to assign reporter. (${res.status})`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Failed to assign reporter.')
  return json.data.job
}

export async function submitTranscript(jobId: string, transcriptNotes: string): Promise<Job> {
  const res = await apiClient(`/jobs/${jobId}/submit-transcript`, {
    method: 'PATCH',
    body: JSON.stringify({ transcript_notes: transcriptNotes }),
  })
  if (!res.ok) throw new Error(`Failed to submit transcript. (${res.status})`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Failed to submit transcript.')
  return json.data.job
}

export async function submitReview(jobId: string, reviewNotes: string): Promise<Job> {
  const res = await apiClient(`/jobs/${jobId}/submit-review`, {
    method: 'PATCH',
    body: JSON.stringify({ review_notes: reviewNotes }),
  })
  if (!res.ok) throw new Error(`Failed to submit review. (${res.status})`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Failed to submit review.')
  return json.data.job
}

export async function completeJob(jobId: string): Promise<Job> {
  const res = await apiClient(`/jobs/${jobId}/complete`, { method: 'PATCH' })
  if (!res.ok) throw new Error(`Failed to complete job. (${res.status})`)
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Failed to complete job.')
  return json.data.job
}
