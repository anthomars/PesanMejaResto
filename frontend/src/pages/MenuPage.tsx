import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem as MuiMenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { apiRequest } from '../lib/api'
import { formatCurrency } from '../lib/format'
import type { ApiItemResponse, ApiListResponse, MenuItem } from '../types'

const initialForm = {
  name: '',
  category: 'food' as 'food' | 'drink',
  description: '',
  price: '',
  is_available: true,
}

export function MenuPage() {
  const { user } = useCurrentUser()
  const [items, setItems] = useState<MenuItem[]>([])
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')

  function loadItems() {
    apiRequest<ApiListResponse<MenuItem>>('/api/menu-items')
      .then((response) => {
        setItems(response.data)
        setError('')
      })
      .catch((requestError: Error) => {
        setError(requestError.message)
      })
  }

  useEffect(() => {
    loadItems()
  }, [])

  function resetForm() {
    setForm(initialForm)
    setEditing(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = { ...form, price: Number(form.price) }

    try {
      if (editing) {
        await apiRequest<ApiItemResponse<MenuItem>>(`/api/menu-items/${editing.id}`, {
          method: 'PUT',
          body: payload,
        })
      } else {
        await apiRequest<ApiItemResponse<MenuItem>>('/api/menu-items', {
          method: 'POST',
          body: payload,
        })
      }
      resetForm()
      loadItems()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menyimpan menu.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiRequest(`/api/menu-items/${id}`, { method: 'DELETE' })
      loadItems()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Gagal menghapus menu.')
    }
  }

  function handleEdit(item: MenuItem) {
    setEditing(item)
    setForm({
      name: item.name,
      category: item.category,
      description: item.description ?? '',
      price: String(Number(item.price)),
      is_available: item.is_available,
    })
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Master Menu"
        description={
          user?.role === 'waiter'
            ? 'Kelola data makanan dan minuman restoran.'
            : 'Kasir dapat melihat daftar menu, namun pengubahan menu dibatasi untuk waiter.'
        }
      />

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            {user?.role === 'waiter' ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <Typography variant="h5">{editing ? 'Edit menu' : 'Tambah menu baru'}</Typography>
                  <TextField
                    label="Nama menu"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                  <TextField
                    label="Kategori"
                    select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value as 'food' | 'drink' })
                    }
                  >
                    <MuiMenuItem value="food">Food</MuiMenuItem>
                    <MuiMenuItem value="drink">Drink</MuiMenuItem>
                  </TextField>
                  <TextField
                    label="Harga"
                    type="number"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                  />
                  <TextField
                    label="Deskripsi"
                    multiline
                    minRows={4}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.is_available}
                        onChange={(event) => setForm({ ...form, is_available: event.target.checked })}
                      />
                    }
                    label="Tersedia untuk dijual"
                  />
                  <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" type="submit">
                      {editing ? 'Simpan perubahan' : 'Tambah menu'}
                    </Button>
                    <Button variant="outlined" onClick={resetForm}>
                      Reset
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ) : (
              <Stack spacing={2}>
                <Typography variant="h5">Akses dibatasi</Typography>
                <Typography color="text.secondary">
                  Perubahan data menu hanya tersedia untuk role waiter.
                </Typography>
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: '100%', borderRadius: 4 }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{item.name}</Typography>
                        <Button size="small" variant="outlined" disabled>
                          {item.category}
                        </Button>
                      </Stack>
                      <Typography color="text.secondary">
                        {item.description ?? 'Tanpa deskripsi.'}
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(item.price)}
                      </Typography>
                      <Typography color={item.is_available ? 'success.main' : 'warning.main'}>
                        {item.is_available ? 'Available' : 'Inactive'}
                      </Typography>
                      {user?.role === 'waiter' ? (
                        <Stack direction="row" spacing={1}>
                          <Button startIcon={<EditRoundedIcon />} onClick={() => handleEdit(item)}>
                            Edit
                          </Button>
                          <Button color="error" startIcon={<DeleteRoundedIcon />} onClick={() => handleDelete(item.id)}>
                            Hapus
                          </Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Stack>
  )
}
