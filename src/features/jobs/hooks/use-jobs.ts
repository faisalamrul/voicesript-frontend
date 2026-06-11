import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'
import type { Job } from '../types/job.types'

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

export function useJobs(page: number, limit: number) {
  return useQuery<JobsData>({
    queryKey: ['jobs', page, limit],
    queryFn: async () => {
      const res = await apiClient(`/jobs?page=${page}&limit=${limit}`)
      if (!res.ok) throw new Error('Gagal memuat data jobs')
      const json = await res.json()
      return json.data
    },
    refetchInterval: 5_000,
    staleTime: 0,
  })
}
