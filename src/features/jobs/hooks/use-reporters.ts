import { useQuery } from '@tanstack/react-query'
import { fetchReporters, type Reporter } from '../api/jobs.api'

export function useReporters() {
  return useQuery<Reporter[]>({
    queryKey: ['reporters'],
    queryFn: fetchReporters,
    staleTime: 0,
    gcTime: 0,
  })
}
