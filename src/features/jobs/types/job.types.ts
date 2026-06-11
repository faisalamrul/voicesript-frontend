export type JobStatus = 'NEW' | 'IN_PROGRESS' | 'SUBMITTED' | 'IN_REVIEW' | 'DONE' | 'REJECTED'

export interface Job {
  id: string
  case_name: string
  duration: number
  location: string
  city: string
  status: JobStatus
  reporter_id: string | null
  editor_id: string | null
  transcript_notes: string | null
  review_notes: string | null
  submitted_at: string | null
  reviewed_at: string | null
  created_at: string
}
