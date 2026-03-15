import { useOutletContext } from 'react-router-dom'
import type { User } from '../types'

type AppShellContext = {
  user: User | null
}

export function useCurrentUser() {
  return useOutletContext<AppShellContext>()
}
