export type JobStatus = 'NEW' | 'ASSIGNED' | 'TRANSCRIBED' | 'REVIEWED' | 'COMPLETED' | 'REJECTED'

export interface Job {
  id: string
  case_name: string
  duration: number
  location: string
  city: string
  status: JobStatus
  reporter_id: string | null
  reporter_name: string | null
  editor_id: string | null
  editor_name: string | null
  transcript_notes: string | null
  review_notes: string | null
  submitted_at: string | null
  reviewed_at: string | null
  created_at: string
  reporter_assigned_at: string | null
  editor_assigned_at: string | null
  completed_at: string | null
}
