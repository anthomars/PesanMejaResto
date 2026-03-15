import type { FormEvent } from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { apiRequest } from '../lib/api'
import { setToken } from '../lib/auth'
import type { LoginResponse } from '../types'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/app'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiRequest<LoginResponse>('/api/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
      })
      setToken(response.token)
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at top left, rgba(140,61,46,0.2), transparent 26%), linear-gradient(135deg, #f8f0e8 0%, #f0dfd0 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 5 }}>
          <Stack spacing={3}>
            <Stack spacing={1.5}>
              <Typography variant="h3" textAlign="center">PM Resto</Typography>
              <Typography color="text.secondary">
                Gunakan akun demo waiter atau cashier untuk menguji alur operasional restoran.
              </Typography>
            </Stack>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4 }}>
              <Stack spacing={1}>
                <Typography variant="body2">Waiter: waiter@resto.test / password</Typography>
                <Typography variant="body2">Cashier: cashier@resto.test / password</Typography>
              </Stack>
            </Paper>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error ? <Alert severity="error">{error}</Alert> : null}
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? 'Memproses...' : 'Login'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}
