import { useQuery } from '@tanstack/react-query'
import { fetchReporterList } from '../api/reporter-performance.api'

export function useReporterList(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ['reporter-list', page, limit, search],
    queryFn: () => fetchReporterList(page, limit, search),
    staleTime: 30_000,
  })
}
