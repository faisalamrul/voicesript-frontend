import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { fetchEarnings, type EarningsRole } from '../api/earnings.api'
import type { EarningsPeriod } from '../types/earnings.types'

export function useEarnings(page: number, limit: number, period?: EarningsPeriod) {
  const user = useAuthStore((s) => s.user)
  const role = user?.role as EarningsRole | undefined
  return useQuery({
    queryKey: ['earnings', role, page, limit, period],
    queryFn: () => fetchEarnings(page, limit, role!, period),
    staleTime: 30_000,
    enabled: role === 'reporter' || role === 'editor',
  })
}
