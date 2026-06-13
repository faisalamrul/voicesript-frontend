import { useQuery } from '@tanstack/react-query'
import { fetchEarnings } from '../api/earnings.api'
import type { EarningsPeriod } from '../types/earnings.types'

export function useEarnings(page: number, limit: number, period?: EarningsPeriod) {
  return useQuery({
    queryKey: ['earnings', page, limit, period],
    queryFn: () => fetchEarnings(page, limit, period),
    staleTime: 30_000,
  })
}
