import { useQuery } from '@tanstack/react-query'
import { fetchEditors, type Editor } from '../api/jobs.api'

export function useEditors() {
  return useQuery<Editor[]>({
    queryKey: ['editors'],
    queryFn: fetchEditors,
    staleTime: 0,
    gcTime: 0,
  })
}
