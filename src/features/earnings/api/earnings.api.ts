import { apiClient } from '@/core/api/api-client'
import type { EarningsPeriod, EarningsResponse } from '../types/earnings.types'

export type EarningsRole = 'reporter' | 'editor'

export async function fetchEarnings(
  page: number,
  limit: number,
  role: EarningsRole,
  period?: EarningsPeriod,
): Promise<EarningsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (period && period !== 'all') params.set('period', period)
  const res = await apiClient(`/${role}/earnings?${params}`)
  if (!res.ok) throw new Error('Failed to load earnings.')
  const json = await res.json()
  return json.data
}
