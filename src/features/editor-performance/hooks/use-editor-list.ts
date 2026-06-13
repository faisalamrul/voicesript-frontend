import { useQuery } from '@tanstack/react-query'
import { fetchEditorList } from '../api/editor-performance.api'

export function useEditorList(page: number, limit: number, search?: string) {
  return useQuery({
    queryKey: ['editor-list', page, limit, search],
    queryFn: () => fetchEditorList(page, limit, search),
    staleTime: 30_000,
  })
}
