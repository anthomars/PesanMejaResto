import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import type { ReactElement } from 'react'
import { Avatar, Box, Button, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { clearToken } from '../lib/auth'
import type { User } from '../types'

export function AppShell() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    apiRequest<{ user: User }>('/api/me')
      .then((response) => setUser(response.user))
      .catch((requestError: Error) => setError(requestError.message))
  }, [])

  function handleLogout() {
    apiRequest('/api/logout', { method: 'POST' }).catch(() => undefined)
    clearToken()
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f3f6fb', p: { xs: 1.5, md: 2 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '280px 1fr' }, gap: 2 }}>
        <Paper
          sx={{
            p: 3,
            display: 'grid',
            gap: 3,
            alignSelf: 'start',
            position: { lg: 'sticky' },
            top: 16,
            minHeight: { lg: 'calc(100vh - 32px)' },
            borderRadius: 3,
            bgcolor: '#0f172a',
            color: 'white',
            boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.68)' }} fontWeight={700}>
              PM Resto
            </Typography>
            <Typography variant="h4">Panel Operasional</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
              Dashboard restoran untuk memantau meja, menu, dan pesanan harian.
            </Typography>
          </Stack>

          <List sx={{ display: 'grid', gap: 1 }}>
            <NavItem to="/app" label="Dashboard" icon={<DashboardRoundedIcon />} />
            {user?.role === 'waiter' ? <NavItem to="/app/menu" label="Master Menu" icon={<MenuBookRoundedIcon />} /> : null}
            <NavItem to="/app/orders" label="List Order" icon={<ReceiptLongRoundedIcon />} />
          </List>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              mt: 'auto',
              borderRadius: 2.5,
              bgcolor: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <Avatar sx={{ bgcolor: '#c2410c', width: 46, height: 46, fontWeight: 700 }}>
                {user?.name?.slice(0, 1) ?? 'U'}
              </Avatar>
              <Box>
                <Typography fontWeight={700}>{user?.name ?? 'Memuat pengguna...'}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)' }}>
                  {user?.role ?? (error || 'Memuat sesi')}
                </Typography>
              </Box>
            </Stack>

            <Button fullWidth variant="contained" color="secondary" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
              Logout
            </Button>
          </Paper>
        </Paper>

        <Box sx={{ py: { xs: 1, md: 2 } }}>
          <Outlet context={{ user }} />
        </Box>
      </Box>
    </Box>
  )
}

type NavItemProps = {
  to: string
  label: string
  icon: ReactElement
}

function NavItem({ to, label, icon }: NavItemProps) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      sx={{
        borderRadius: 2,
        color: 'rgba(255,255,255,0.72)',
        '&.active': {
          bgcolor: 'rgba(255,255,255,0.12)',
          color: 'white',
        },
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.08)',
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  )
}
