export type Role = 'waiter' | 'cashier'

export type User = {
  id: number
  name: string
  email: string
  role: Role
}

export type LoginResponse = {
  message: string
  token: string
  user: User
}

export type Table = {
  id: number
  name: string
  seats: number
  status: 'available' | 'occupied'
  active_order: {
    id: number
    code: string
    total_items: number
  } | null
}

export type MenuItem = {
  id: number
  name: string
  category: 'food' | 'drink'
  description: string | null
  price: string
  is_available: boolean
}

export type OrderItem = {
  id: number
  order_id: number
  menu_item_id: number
  quantity: number
  unit_price: string
  subtotal: string
  notes: string | null
  menu_item: MenuItem
}

export type Order = {
  id: number
  code: string
  restaurant_table_id: number
  opened_by_id: number
  closed_by_id: number | null
  status: 'open' | 'closed'
  opened_at: string
  closed_at: string | null
  total_amount: string
  table: Table
  opened_by: User
  closed_by: User | null
  items: OrderItem[]
}

export type ApiListResponse<T> = {
  data: T[]
}

export type ApiItemResponse<T> = {
  data: T
  message?: string
}
