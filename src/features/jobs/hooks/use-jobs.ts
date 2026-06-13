import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'
import type { Job, JobStatus } from '../types/job.types'

export interface JobsPagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface JobsData {
  jobs: Job[]
  pagination: JobsPagination
}

export interface JobsFilters {
  search?: string
  status?: JobStatus
  location?: string
  city?: string
}

export function useJobs(page: number, limit: number, filters: JobsFilters = {}) {
  return useQuery<JobsData>({
    queryKey: ['jobs', page, limit, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (filters.search)   params.set('search', filters.search)
      if (filters.status)   params.set('status', filters.status)
      if (filters.location) params.set('location', filters.location)
      if (filters.city)     params.set('city', filters.city)
      const res = await apiClient(`/jobs?${params}`)
      if (!res.ok) throw new Error('Failed to load jobs.')
      const json = await res.json()
      return json.data
    },
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    staleTime: 0, // always treat cached data as stale — polling keeps it fresh
  })
}
