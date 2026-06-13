import { useQuery } from '@tanstack/react-query'
import { fetchJobById } from '../api/jobs.api'

export function useJobDetail(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJobById(jobId!),
    enabled: !!jobId,
    staleTime: 30_000,
  })
}
