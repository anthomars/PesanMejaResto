import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { apiRequest } from '../lib/api'
import { formatCurrency, formatDateTime } from '../lib/format'
import type { ApiListResponse, Order } from '../types'

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

  function loadOrders() {
    apiRequest<ApiListResponse<Order>>('/api/orders')
      .then((response) => {
        setOrders(response.data)
        setError('')
      })
      .catch((requestError: Error) => {
        setError(requestError.message)
      })
  }

  useEffect(() => {
    loadOrders()
  }, [])

  return (
    <Stack spacing={3}>
      <PageHeader
        title="List Order"
        description="Pantau order aktif maupun order yang sudah ditutup."
        action={
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={loadOrders}>
            Refresh
          </Button>
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kode</TableCell>
              <TableCell>Meja</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Dibuka</TableCell>
              <TableCell>Total</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>{order.code}</TableCell>
                <TableCell>{order.table?.name}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={order.status}
                    color={order.status === 'open' ? 'warning' : 'success'}
                  />
                </TableCell>
                <TableCell>{formatDateTime(order.opened_at)}</TableCell>
                <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                <TableCell align="right">
                  <Button component={Link} to={`/app/orders/${order.id}`} variant="contained" size="small">
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
