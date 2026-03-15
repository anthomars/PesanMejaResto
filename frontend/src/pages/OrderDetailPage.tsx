import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded'
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem as MuiMenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDateTime } from '../lib/format'
import type { ApiItemResponse, ApiListResponse, MenuItem, Order } from '../types'

export function OrderDetailPage() {
  const { user } = useCurrentUser()
  const { orderId } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuItemId, setMenuItemId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  function loadPage() {
    if (!orderId) return

    Promise.all([
      apiRequest<ApiItemResponse<Order>>(`/api/orders/${orderId}`),
      apiRequest<ApiListResponse<MenuItem>>('/api/menu-items'),
    ])
      .then(([orderResponse, menuResponse]) => {
        setOrder(orderResponse.data)
        setMenuItems(menuResponse.data.filter((item) => item.is_available))
        setError('')
      })
      .catch((requestError: Error) => {
        setError(requestError.message)
      })
  }

  useEffect(() => {
    loadPage()
  }, [orderId])

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!orderId) return
    if (!menuItemId) {
      setError('Silakan pilih menu terlebih dahulu.')
      return
    }

    try {
      const response = await apiRequest<ApiItemResponse<Order>>(`/api/orders/${orderId}/items`, {
        method: 'POST',
        body: {
          menu_item_id: Number(menuItemId),
          quantity: Number(quantity),
          notes,
        },
      })

      setOrder(response.data)
      setQuantity('1')
      setNotes('')
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menambah item.')
    }
  }

  async function handleCloseOrder() {
    if (!orderId) return

    try {
      const response = await apiRequest<ApiItemResponse<Order>>(`/api/orders/${orderId}/close`, {
        method: 'POST',
      })
      setOrder(response.data)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menutup order.')
    }
  }

  async function handleOpenReceipt() {
    if (!orderId) return

    try {
      const file = await apiRequest<Blob>(`/api/orders/${orderId}/receipt`, {
        responseType: 'blob',
      })
      const objectUrl = window.URL.createObjectURL(file)
      window.open(objectUrl, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl)
      }, 60_000)
      setError('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal membuka receipt.')
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={order ? `Detail ${order.code}` : 'Detail Order'}
        description="Kelola item pesanan, pantau total harga, dan tutup order dari halaman ini."
        action={
          order && user?.role === 'cashier' ? (
            <Button variant="outlined" startIcon={<PictureAsPdfRoundedIcon />} onClick={handleOpenReceipt}>
              Receipt PDF
            </Button>
          ) : null
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      {order ? (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography color="text.secondary">Meja</Typography>
                  <Typography fontWeight={700}>{order.table.name}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography color="text.secondary">Status</Typography>
                  <Typography fontWeight={700}>{order.status}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography color="text.secondary">Dibuka</Typography>
                  <Typography fontWeight={700}>{formatDateTime(order.opened_at)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Typography color="text.secondary">Total</Typography>
                  <Typography fontWeight={700} color="primary.main">
                    {formatCurrency(order.total_amount)}
                  </Typography>
                </Grid>
              </Grid>

              <Stack spacing={2}>
                {order.items.map((item) => (
                  <Card key={item.id} variant="outlined" sx={{ borderRadius: 4 }}>
                    <CardContent>
                      <Stack spacing={1.25}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{item.menu_item.name}</Typography>
                          <Typography color="primary.main" fontWeight={700}>
                            {formatCurrency(item.subtotal)}
                          </Typography>
                        </Stack>
                        <Typography color="text.secondary">
                          {item.quantity} x {formatCurrency(item.unit_price)}
                        </Typography>
                        <Typography>{item.notes || 'Tanpa catatan.'}</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Stack spacing={2.5}>
                {user?.role === 'waiter' ? (
                  <>
                    <Typography variant="h5">Tambah item</Typography>
                    <Stack component="form" spacing={2} onSubmit={handleAddItem}>
                      <TextField
                        select
                        label="Menu"
                        value={menuItemId}
                        onChange={(event) => setMenuItemId(event.target.value)}
                      >
                        <MuiMenuItem value="">
                          <em>Pilih menu</em>
                        </MuiMenuItem>
                        {menuItems.map((item) => (
                          <MuiMenuItem key={item.id} value={item.id}>
                            {item.name}
                          </MuiMenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Quantity"
                        type="number"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                      />
                      <TextField
                        label="Catatan"
                        multiline
                        minRows={3}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                      />
                      <Button type="submit" variant="contained" disabled={order.status !== 'open'}>
                        Tambah ke order
                      </Button>
                    </Stack>
                  </>
                ) : (
                  <>
                    <Typography variant="h5">Kontrol kasir</Typography>
                    <Typography color="text.secondary">
                      Kasir fokus pada penyelesaian order dan pencetakan receipt.
                    </Typography>
                  </>
                )}

                <Divider />

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PointOfSaleRoundedIcon />}
                  onClick={handleCloseOrder}
                  disabled={order.status !== 'open'}
                >
                  Tutup order
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography color="text.secondary">Memuat detail order...</Typography>
        </Paper>
      )}
    </Stack>
  )
}
