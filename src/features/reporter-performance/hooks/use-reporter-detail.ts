import { useQuery } from '@tanstack/react-query'
import { fetchReporterDetail } from '../api/reporter-performance.api'

export function useReporterDetail(reporterId: string | undefined, page: number, limit: number) {
  return useQuery({
    queryKey: ['reporter-detail', reporterId, page, limit],
    queryFn: () => fetchReporterDetail(reporterId!, page, limit),
    enabled: !!reporterId,
    staleTime: 30_000,
  })
}
