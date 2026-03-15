import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded'
import { Alert, Box, Button, Card, CardActions, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { apiRequest } from '../lib/api'
import type { ApiItemResponse, ApiListResponse, Order, Table } from '../types'

export function DashboardPage() {
  const { user } = useCurrentUser()
  const [tables, setTables] = useState<Table[]>([])
  const [error, setError] = useState('')

  function loadTables() {
    apiRequest<ApiListResponse<Table>>('/api/tables', { auth: false })
      .then((response) => {
        setTables(response.data)
        setError('')
      })
      .catch((requestError: Error) => {
        setError(requestError.message)
      })
  }

  useEffect(() => {
    loadTables()
  }, [])

  async function handleOpenOrder(tableId: number) {
    try {
      await apiRequest<ApiItemResponse<Order>>('/api/orders', {
        method: 'POST',
        body: { restaurant_table_id: tableId },
      })
      loadTables()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal membuka order.')
    }
  }

  const availableCount = tables.filter((table) => table.status === 'available').length
  const occupiedCount = tables.filter((table) => table.status === 'occupied').length

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dashboard Meja"
        description="Pantau status meja dan buka order baru untuk meja yang masih tersedia."
        action={
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={loadTables}>
            Refresh
          </Button>
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard label="Total Meja" value={tables.length} note="Seluruh meja yang dipantau" accent="#0f172a" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard label="Tersedia" value={availableCount} note="Siap menerima order baru" accent="#15803d" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard label="Aktif" value={occupiedCount} note="Sedang berjalan order" accent="#c2410c" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {tables.map((table) => (
          <Grid key={table.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 2.5, border: '1px solid rgba(148, 163, 184, 0.16)' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: table.status === 'occupied' ? 'rgba(194,65,12,0.08)' : 'rgba(21,128,61,0.08)',
                          color: table.status === 'occupied' ? '#c2410c' : '#15803d',
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

                    <Stack alignItems="flex-end" spacing={1}>
                      <Chip
                        label={table.status === 'available' ? 'Available' : 'Occupied'}
                        color={table.status === 'available' ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {table.seats} kursi
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Stack spacing={0.5}>
                    <Typography fontWeight={700}>
                      {table.active_order ? `Order aktif: ${table.active_order.code}` : 'Siap menerima tamu'}
                    </Typography>
                    <Typography color="text.secondary">
                      {table.active_order
                        ? `Total item: ${table.active_order.total_items}`
                        : 'Meja tersedia untuk order baru.'}
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>

              <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                {table.active_order ? (
                  <Button fullWidth component={Link} to={`/app/orders/${table.active_order.id}`} variant="contained" color="secondary">
                    Lihat order
                  </Button>
                ) : user?.role === 'waiter' ? (
                  <Button fullWidth variant="contained" onClick={() => handleOpenOrder(table.id)}>
                    Buka order
                  </Button>
                ) : (
                  <Button fullWidth variant="outlined" disabled>
                    Hanya waiter dapat buka order
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

type SummaryCardProps = {
  label: string
  value: number
  note: string
  accent: string
}

function SummaryCard({ label, value, note, accent }: SummaryCardProps) {
  return (
    <Card sx={{ borderRadius: 2.5, border: '1px solid rgba(148, 163, 184, 0.14)' }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="overline" sx={{ color: accent }}>
            {label}
          </Typography>
          <Typography variant="h4" sx={{ color: accent }}>
            {value}
          </Typography>
          <Typography color="text.secondary">{note}</Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
