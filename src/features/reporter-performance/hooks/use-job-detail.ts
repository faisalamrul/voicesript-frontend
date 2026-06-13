import { useQuery } from '@tanstack/react-query'
import { fetchJobDetail } from '../api/reporter-performance.api'

export function useJobDetail(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-detail', jobId],
    queryFn: () => fetchJobDetail(jobId!),
    enabled: !!jobId,
    staleTime: 30_000,
  })
}
