export interface PaymentSummary {
  total_payout: number
  reporter_total: number
  reporter_minutes: number
  editor_total: number
  editor_jobs: number
  pending_total: number
  completed_jobs: number
  pending_jobs: number
}

export interface PaymentJob {
  id: string
  case_name: string
  duration: number
  status: string
  reporter_name: string | null
  reporter_payment: number | null
  editor_name: string | null
  editor_payment: number | null
  completed_at: string | null
}

export interface PaymentsPagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface PaymentsResponse {
  summary: PaymentSummary
  jobs: PaymentJob[]
  pagination: PaymentsPagination
}

export interface PaymentsFilters {
  search?: string
  status?: 'paid' | 'pending'
  period?: 'month' | 'last'
}
