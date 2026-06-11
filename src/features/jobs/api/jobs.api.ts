import { apiClient } from '@/core/api/api-client'
import type { Job } from '../types/job.types'

export interface CreateJobPayload {
  case_name: string
  duration: number
  location: string
  city: string
}

export async function createJobApi(payload: CreateJobPayload): Promise<Job> {
  const res = await apiClient('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'Gagal membuat job.')
  }
  return json.data.job
}
