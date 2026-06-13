import { useQuery } from '@tanstack/react-query'
import { fetchPayments } from '../api/payments.api'
import type { PaymentsFilters } from '../types/payment.types'

export function usePayments(page: number, limit: number, filters: PaymentsFilters = {}) {
  return useQuery({
    queryKey: ['payments', page, limit, filters],
    queryFn: () => fetchPayments(page, limit, filters),
    staleTime: 30_000,
  })
}
