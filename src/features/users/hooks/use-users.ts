import { useQuery } from '@tanstack/react-query'
import { fetchUsers, type UsersData } from '../api/users.api'

export function useUsers(page: number, limit: number) {
  return useQuery<UsersData>({
    queryKey: ['users', page, limit],
    queryFn: () => fetchUsers(page, limit),
    staleTime: 0, // always refetch — admin data must be current
  })
}
