import { useQuery } from '@tanstack/react-query'
import { fetchEditorDetail } from '../api/editor-performance.api'

export function useEditorDetail(editorId: string | undefined, page: number, limit: number) {
  return useQuery({
    queryKey: ['editor-detail', editorId, page, limit],
    queryFn: () => fetchEditorDetail(editorId!, page, limit),
    enabled: !!editorId,
    staleTime: 30_000,
  })
}
