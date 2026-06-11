import { RouterProvider } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './router'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </QueryClientProvider>
  )
}
