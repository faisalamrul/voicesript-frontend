export type ReporterJobStatus = 'ASSIGNED' | 'TRANSCRIBED' | 'REVIEWED' | 'COMPLETED' | 'REJECTED'

export interface ReporterListItem {
  id: string
  name: string
  email: string
  city: string
  has_active_job: boolean
  created_at: string
}

export interface ReporterStats {
  total_jobs: number
  total_earned: number
  jobs_completed: number
  pending_earnings: number
}

export interface ReporterJob {
  id: string
  case_name: string
  status: ReporterJobStatus
  duration: number
  reporter_payment: number | null
  assigned_at: string
  submitted_at: string | null
  reviewed_at: string | null
  completed_at: string | null
}

export interface ReporterListPagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface ReporterListResponse {
  users: ReporterListItem[]
  pagination: ReporterListPagination
}

export interface ReporterDetailResponse {
  profile: ReporterListItem
  stats: ReporterStats
  jobs: ReporterJob[]
  pagination: ReporterListPagination
}

