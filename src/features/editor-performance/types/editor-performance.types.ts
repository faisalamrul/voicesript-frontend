export type EditorJobStatus = 'ASSIGNED' | 'TRANSCRIBED' | 'REVIEWED' | 'COMPLETED' | 'REJECTED'

export interface EditorListItem {
  id: string
  name: string
  email: string
  city: string
  has_active_job: boolean
  created_at: string
}

export interface EditorStats {
  total_jobs: number
  total_earned: number
  jobs_completed: number
  pending_earnings: number
}

export interface EditorJob {
  id: string
  case_name: string
  status: EditorJobStatus
  duration: number
  editor_payment: number | null
  assigned_at: string
  reviewed_at: string | null
  completed_at: string | null
}

export interface EditorListPagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface EditorListResponse {
  users: EditorListItem[]
  pagination: EditorListPagination
}

export interface EditorDetailResponse {
  profile: EditorListItem
  stats: EditorStats
  jobs: EditorJob[]
  pagination: EditorListPagination
}
