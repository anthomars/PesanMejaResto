import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import type { ApiListResponse, Table } from '../types'

export function GuestHomePage() {
  const [tables, setTables] = useState<Table[]>([])

  function loadTables() {
    apiRequest<ApiListResponse<Table>>('/api/tables', { auth: false })
      .then((response) => {
        setTables(response.data)
      })
      .catch(() => undefined)
  }

  useEffect(() => {
    loadTables()

    const intervalId = window.setInterval(() => {
      loadTables()
    }, 10_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const available = tables.filter((table) => table.status === 'available').length
  const occupied = tables.filter((table) => table.status === 'occupied').length

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(194, 65, 12, 0.12), transparent 24%), linear-gradient(180deg, #fffaf5 0%, #f6f1ea 100%)',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={4}>
          <Card
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(194, 65, 12, 0.12)',
              boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
            }}
          >
            <Grid container>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Box sx={{ p: { xs: 3, md: 5 } }}>
                  <Stack spacing={2.5}>
                    <Typography variant="overline" color="secondary.main" fontWeight={700}>
                      PM Resto
                    </Typography>
                    <Typography variant="h2">Status Meja Hari Ini</Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 760, fontWeight: 500 }}>
                      Tamu dapat langsung melihat meja yang tersedia dan meja yang sedang digunakan sebelum staff melakukan order.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button component={Link} to="/login" variant="contained" color="secondary" startIcon={<LoginRoundedIcon />}>
                        Login Staff
                      </Button>
                      <Button variant="outlined" disabled>
                        Live Table Board
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Box
                  sx={{
                    height: '100%',
                    p: { xs: 3, md: 4 },
                    bgcolor: '#0f172a',
                    color: 'white',
                    display: 'grid',
                    alignContent: 'center',
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.65)' }}>
                      Ringkasan Cepat
                    </Typography>
                    <SummaryPanel label="Total meja" value={tables.length} />
                    <SummaryPanel label="Tersedia" value={available} accent="#22c55e" />
                    <SummaryPanel label="Digunakan" value={occupied} accent="#fb923c" />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Card>

          <Grid container spacing={2}>
            {tables.map((table) => (
              <Grid key={table.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid rgba(148, 163, 184, 0.14)',
                    bgcolor: 'background.paper',
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: table.status === 'available' ? 'rgba(21,128,61,0.08)' : 'rgba(194,65,12,0.08)',
                              color: table.status === 'available' ? '#15803d' : '#c2410c',
                            }}
                          >
                            <RestaurantRoundedIcon />
                          </Box>

                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Nomor meja
                            </Typography>
                            <Typography variant="h5">{table.name}</Typography>
                          </Box>
                        </Stack>

                        <Chip
                          size="small"
                          label={table.status === 'available' ? 'Tersedia' : 'Digunakan'}
                          color={table.status === 'available' ? 'success' : 'warning'}
                          sx={{ fontWeight: 700 }}
                        />
                      </Stack>

                      <Box
                        sx={{
                          px: 1.75,
                          py: 1.25,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(148, 163, 184, 0.08)',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={700}>Kapasitas</Typography>
                          <Typography color="text.secondary">{table.seats} kursi</Typography>
                        </Stack>
                      </Box>

                      <Stack spacing={0.5}>
                        <Typography fontWeight={700}>
                          {table.active_order ? `Sedang dipakai (${table.active_order.code})` : 'Siap menerima tamu'}
                        </Typography>
                        <Typography color="text.secondary">
                          {table.active_order
                            ? `Saat ini meja memiliki ${table.active_order.total_items} item aktif dalam order.`
                            : 'Meja masih kosong dan dapat digunakan.'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}

type SummaryPanelProps = {
  label: string
  value: number
  accent?: string
}

function SummaryPanel({ label, value, accent = '#ffffff' }: SummaryPanelProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ color: accent }}>
          {value}
        </Typography>
      </Stack>
    </Box>
  )
}
