export type EarningsJobStatus = 'ASSIGNED' | 'TRANSCRIBED' | 'REVIEWED' | 'COMPLETED' | 'REJECTED'

export type EarningsPeriod = 'all' | 'month' | 'last'

export interface EarningsSummary {
  total_earned: number
  total_minutes: number
  period_earned: number
  pending: number
}

export interface EarningsWorkStats {
  total_jobs: number
  jobs_this_month: number
  avg_duration_minutes: number
}

export interface EarningsJob {
  id: string
  case_name: string
  status: EarningsJobStatus
  duration: number
  reporter_payment: number | null
  assigned_at: string
  submitted_at: string | null
  reviewed_at: string | null
  completed_at: string | null
}

export interface EarningsPagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface EarningsTurnaroundStats {
  avg_hours: number
  trend: 'improving' | 'stable' | 'slowing' | 'insufficient_data'
  recent_avg_hours: number
  baseline_avg_hours: number
  submitted_jobs_count: number
}

export interface EarningsMonthlyBreakdown {
  month: string
  month_label: string
  earned: number
  minutes: number
  jobs: number
}

export interface EarningsResponse {
  summary: EarningsSummary
  work_stats: EarningsWorkStats
  turnaround_stats?: EarningsTurnaroundStats
  monthly_breakdown?: EarningsMonthlyBreakdown[]
  jobs: EarningsJob[]
  pagination: EarningsPagination
}
