import { apiClient } from '@/core/api/api-client'
import type { PaymentsFilters, PaymentsResponse } from '../types/payment.types'

export async function fetchPayments(
  page: number,
  limit: number,
  filters: PaymentsFilters = {},
): Promise<PaymentsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (filters.search)  params.set('search', filters.search)
  if (filters.status)  params.set('status', filters.status)
  if (filters.period)  params.set('period', filters.period)
  const res = await apiClient(`/payments?${params}`)
  if (!res.ok) throw new Error('Failed to load payments.')
  const json = await res.json()
  return json.data
}
