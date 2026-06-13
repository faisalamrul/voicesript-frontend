import type { ReporterListItem, ReporterStats, ReporterJob, JobTimeline } from './types/reporter-performance.types'

export const DUMMY_REPORTERS: ReporterListItem[] = [
  { id: 'r1', name: 'Rina Kartika',  email: 'rina.kartika@example.com',  city: 'Jakarta',    has_active_job: true,  created_at: '2025-09-15T08:00:00Z' },
  { id: 'r2', name: 'Budi Santoso',  email: 'budi.santoso@example.com',  city: 'Bandung',    has_active_job: false, created_at: '2025-10-01T08:00:00Z' },
  { id: 'r3', name: 'Sari Dewi',     email: 'sari.dewi@example.com',     city: 'Surabaya',   has_active_job: false, created_at: '2025-11-20T08:00:00Z' },
  { id: 'r4', name: 'Ahmad Fauzi',   email: 'ahmad.fauzi@example.com',   city: 'Yogyakarta', has_active_job: true,  created_at: '2026-01-05T08:00:00Z' },
  { id: 'r5', name: 'Maya Putri',    email: 'maya.putri@example.com',    city: 'Medan',      has_active_job: false, created_at: '2026-02-14T08:00:00Z' },
]

// Payments: floor(duration / 60) * 2000
export const DUMMY_STATS: Record<string, ReporterStats> = {
  r1: { total_jobs: 4,  total_earned: 420_000, jobs_completed: 2, pending_earnings: 160_000 }, // 90+120min paid; 80min reviewed
  r2: { total_jobs: 3,  total_earned: 480_000, jobs_completed: 2, pending_earnings: 0 },        // 110+130min paid; TRANSCRIBED not yet pending
  r3: { total_jobs: 2,  total_earned: 200_000, jobs_completed: 1, pending_earnings: 120_000 },  // 100min paid; 60min reviewed
  r4: { total_jobs: 2,  total_earned: 150_000, jobs_completed: 1, pending_earnings: 0 },        // 75min paid; ASSIGNED = no pending
  r5: { total_jobs: 3,  total_earned: 320_000, jobs_completed: 2, pending_earnings: 0 },        // 100+60min paid; TRANSCRIBED = no pending
}

export const DUMMY_JOBS: Record<string, ReporterJob[]> = {
  r1: [
    { id: 'j4',  case_name: 'Civil Lawsuit #33',          status: 'ASSIGNED',    duration: 0,    reporter_payment: null,    assigned_at: '2026-06-13T08:00:00Z', submitted_at: null,                   reviewed_at: null,                   completed_at: null },
    { id: 'j3',  case_name: 'Annual General Meeting #44', status: 'REVIEWED',    duration: 4800, reporter_payment: null,    assigned_at: '2026-06-11T09:00:00Z', submitted_at: '2026-06-12T11:00:00Z', reviewed_at: '2026-06-12T16:00:00Z', completed_at: null },
    { id: 'j1',  case_name: 'Arbitration Hearing #88',    status: 'COMPLETED',   duration: 5400, reporter_payment: 180_000, assigned_at: '2026-06-05T10:30:00Z', submitted_at: '2026-06-06T14:00:00Z', reviewed_at: '2026-06-09T16:00:00Z', completed_at: '2026-06-10T11:00:00Z' },
    { id: 'j2',  case_name: 'Criminal Trial #12',         status: 'COMPLETED',   duration: 7200, reporter_payment: 240_000, assigned_at: '2026-05-28T09:00:00Z', submitted_at: '2026-05-30T16:30:00Z', reviewed_at: '2026-06-01T10:00:00Z', completed_at: '2026-06-03T14:00:00Z' },
  ],
  r2: [
    { id: 'j7',  case_name: 'Merger Hearing #67',         status: 'TRANSCRIBED', duration: 3600, reporter_payment: null,    assigned_at: '2026-06-10T10:00:00Z', submitted_at: '2026-06-12T13:00:00Z', reviewed_at: null,                   completed_at: null },
    { id: 'j6',  case_name: 'Tax Dispute #55',            status: 'COMPLETED',   duration: 7800, reporter_payment: 260_000, assigned_at: '2026-06-01T09:00:00Z', submitted_at: '2026-06-04T14:00:00Z', reviewed_at: '2026-06-06T09:00:00Z', completed_at: '2026-06-08T10:30:00Z' },
    { id: 'j5',  case_name: 'Board Meeting #22',          status: 'COMPLETED',   duration: 6600, reporter_payment: 220_000, assigned_at: '2026-05-20T09:00:00Z', submitted_at: '2026-05-22T15:00:00Z', reviewed_at: '2026-05-23T10:00:00Z', completed_at: '2026-05-25T11:00:00Z' },
  ],
  r3: [
    { id: 'j9',  case_name: 'Contract Review #15',        status: 'REVIEWED',    duration: 3600, reporter_payment: null,    assigned_at: '2026-06-11T10:00:00Z', submitted_at: '2026-06-12T09:00:00Z', reviewed_at: '2026-06-12T14:00:00Z', completed_at: null },
    { id: 'j8',  case_name: 'Employment Dispute #99',     status: 'COMPLETED',   duration: 6000, reporter_payment: 200_000, assigned_at: '2026-06-02T09:00:00Z', submitted_at: '2026-06-04T16:00:00Z', reviewed_at: '2026-06-05T10:00:00Z', completed_at: '2026-06-07T14:00:00Z' },
  ],
  r4: [
    { id: 'j11', case_name: 'IP Infringement Case #77',   status: 'ASSIGNED',    duration: 0,    reporter_payment: null,    assigned_at: '2026-06-13T09:00:00Z', submitted_at: null,                   reviewed_at: null,                   completed_at: null },
    { id: 'j10', case_name: 'Bankruptcy Proceeding #41',  status: 'COMPLETED',   duration: 4500, reporter_payment: 150_000, assigned_at: '2026-05-25T09:00:00Z', submitted_at: '2026-05-27T14:00:00Z', reviewed_at: '2026-05-29T10:00:00Z', completed_at: '2026-05-30T11:00:00Z' },
  ],
  r5: [
    { id: 'j14', case_name: 'Lease Agreement #91',        status: 'TRANSCRIBED', duration: 4200, reporter_payment: null,    assigned_at: '2026-06-10T09:00:00Z', submitted_at: '2026-06-12T16:00:00Z', reviewed_at: null,                   completed_at: null },
    { id: 'j13', case_name: 'Property Dispute #63',       status: 'COMPLETED',   duration: 3600, reporter_payment: 120_000, assigned_at: '2026-06-01T09:00:00Z', submitted_at: '2026-06-03T14:00:00Z', reviewed_at: '2026-06-04T10:00:00Z', completed_at: '2026-06-05T11:00:00Z' },
    { id: 'j12', case_name: 'Labor Rights Case #28',      status: 'COMPLETED',   duration: 6000, reporter_payment: 200_000, assigned_at: '2026-05-15T09:00:00Z', submitted_at: '2026-05-17T15:00:00Z', reviewed_at: '2026-05-19T10:00:00Z', completed_at: '2026-05-20T14:00:00Z' },
  ],
}

export const DUMMY_TIMELINES: Record<string, JobTimeline> = {
  j1:  { id: 'j1',  case_name: 'Arbitration Hearing #88',    reporter_id: 'r1', status: 'COMPLETED',   created_at: '2026-06-05T09:00:00Z', reporter_assigned_at: '2026-06-05T10:30:00Z', transcript_submitted_at: '2026-06-06T14:00:00Z', editor_assigned_at: '2026-06-07T09:00:00Z',  reviewed_at: '2026-06-09T16:00:00Z', completed_at: '2026-06-10T11:00:00Z' },
  j2:  { id: 'j2',  case_name: 'Criminal Trial #12',          reporter_id: 'r1', status: 'COMPLETED',   created_at: '2026-05-27T08:00:00Z', reporter_assigned_at: '2026-05-28T09:00:00Z', transcript_submitted_at: '2026-05-30T16:30:00Z', editor_assigned_at: '2026-05-31T09:00:00Z',  reviewed_at: '2026-06-01T10:00:00Z', completed_at: '2026-06-03T14:00:00Z' },
  j3:  { id: 'j3',  case_name: 'Annual General Meeting #44',  reporter_id: 'r1', status: 'REVIEWED',    created_at: '2026-06-10T14:00:00Z', reporter_assigned_at: '2026-06-11T09:00:00Z', transcript_submitted_at: '2026-06-12T11:00:00Z', editor_assigned_at: '2026-06-12T13:00:00Z',  reviewed_at: '2026-06-12T16:00:00Z', completed_at: null },
  j4:  { id: 'j4',  case_name: 'Civil Lawsuit #33',           reporter_id: 'r1', status: 'ASSIGNED',    created_at: '2026-06-12T16:00:00Z', reporter_assigned_at: '2026-06-13T08:00:00Z', transcript_submitted_at: null,                    editor_assigned_at: null,                    reviewed_at: null,                   completed_at: null },
  j5:  { id: 'j5',  case_name: 'Board Meeting #22',           reporter_id: 'r2', status: 'COMPLETED',   created_at: '2026-05-19T10:00:00Z', reporter_assigned_at: '2026-05-20T09:00:00Z', transcript_submitted_at: '2026-05-22T15:00:00Z', editor_assigned_at: '2026-05-22T17:00:00Z',  reviewed_at: '2026-05-23T10:00:00Z', completed_at: '2026-05-25T11:00:00Z' },
  j6:  { id: 'j6',  case_name: 'Tax Dispute #55',             reporter_id: 'r2', status: 'COMPLETED',   created_at: '2026-05-31T08:00:00Z', reporter_assigned_at: '2026-06-01T09:00:00Z', transcript_submitted_at: '2026-06-04T14:00:00Z', editor_assigned_at: '2026-06-04T16:00:00Z',  reviewed_at: '2026-06-06T09:00:00Z', completed_at: '2026-06-08T10:30:00Z' },
  j7:  { id: 'j7',  case_name: 'Merger Hearing #67',          reporter_id: 'r2', status: 'TRANSCRIBED', created_at: '2026-06-09T10:00:00Z', reporter_assigned_at: '2026-06-10T10:00:00Z', transcript_submitted_at: '2026-06-12T13:00:00Z', editor_assigned_at: null,                    reviewed_at: null,                   completed_at: null },
  j8:  { id: 'j8',  case_name: 'Employment Dispute #99',      reporter_id: 'r3', status: 'COMPLETED',   created_at: '2026-06-01T09:00:00Z', reporter_assigned_at: '2026-06-02T09:00:00Z', transcript_submitted_at: '2026-06-04T16:00:00Z', editor_assigned_at: '2026-06-04T18:00:00Z',  reviewed_at: '2026-06-05T10:00:00Z', completed_at: '2026-06-07T14:00:00Z' },
  j9:  { id: 'j9',  case_name: 'Contract Review #15',         reporter_id: 'r3', status: 'REVIEWED',    created_at: '2026-06-10T11:00:00Z', reporter_assigned_at: '2026-06-11T10:00:00Z', transcript_submitted_at: '2026-06-12T09:00:00Z', editor_assigned_at: '2026-06-12T11:00:00Z',  reviewed_at: '2026-06-12T14:00:00Z', completed_at: null },
  j10: { id: 'j10', case_name: 'Bankruptcy Proceeding #41',   reporter_id: 'r4', status: 'COMPLETED',   created_at: '2026-05-24T08:00:00Z', reporter_assigned_at: '2026-05-25T09:00:00Z', transcript_submitted_at: '2026-05-27T14:00:00Z', editor_assigned_at: '2026-05-27T16:00:00Z',  reviewed_at: '2026-05-29T10:00:00Z', completed_at: '2026-05-30T11:00:00Z' },
  j11: { id: 'j11', case_name: 'IP Infringement Case #77',    reporter_id: 'r4', status: 'ASSIGNED',    created_at: '2026-06-12T14:00:00Z', reporter_assigned_at: '2026-06-13T09:00:00Z', transcript_submitted_at: null,                    editor_assigned_at: null,                    reviewed_at: null,                   completed_at: null },
  j12: { id: 'j12', case_name: 'Labor Rights Case #28',       reporter_id: 'r5', status: 'COMPLETED',   created_at: '2026-05-14T09:00:00Z', reporter_assigned_at: '2026-05-15T09:00:00Z', transcript_submitted_at: '2026-05-17T15:00:00Z', editor_assigned_at: '2026-05-18T09:00:00Z',  reviewed_at: '2026-05-19T10:00:00Z', completed_at: '2026-05-20T14:00:00Z' },
  j13: { id: 'j13', case_name: 'Property Dispute #63',        reporter_id: 'r5', status: 'COMPLETED',   created_at: '2026-05-31T09:00:00Z', reporter_assigned_at: '2026-06-01T09:00:00Z', transcript_submitted_at: '2026-06-03T14:00:00Z', editor_assigned_at: '2026-06-03T16:00:00Z',  reviewed_at: '2026-06-04T10:00:00Z', completed_at: '2026-06-05T11:00:00Z' },
  j14: { id: 'j14', case_name: 'Lease Agreement #91',         reporter_id: 'r5', status: 'TRANSCRIBED', created_at: '2026-06-09T10:00:00Z', reporter_assigned_at: '2026-06-10T09:00:00Z', transcript_submitted_at: '2026-06-12T16:00:00Z', editor_assigned_at: null,                    reviewed_at: null,                   completed_at: null },
}

export function getReporter(id: string) {
  return DUMMY_REPORTERS.find((r) => r.id === id) ?? null
}

export function getReporterStats(id: string): ReporterStats {
  return DUMMY_STATS[id] ?? { total_jobs: 0, total_earned: 0, jobs_completed: 0, pending_earnings: 0 }
}

export function getReporterJobs(id: string): ReporterJob[] {
  return DUMMY_JOBS[id] ?? []
}

export function getJobTimeline(jobId: string): JobTimeline | null {
  return DUMMY_TIMELINES[jobId] ?? null
}
