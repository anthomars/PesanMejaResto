import type { ReactElement } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '../lib/auth'

type ProtectedRouteProps = {
  children: ReactElement
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
