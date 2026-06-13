import { useQuery } from '@tanstack/react-query'
import { fetchEditorJobDetail } from '../api/editor-performance.api'

export function useEditorJobDetail(jobId: string | undefined) {
  return useQuery({
    queryKey: ['editor-job-detail', jobId],
    queryFn: () => fetchEditorJobDetail(jobId!),
    enabled: !!jobId,
    staleTime: 30_000,
  })
}
