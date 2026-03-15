# Pesan Meja Resto

Study case full stack developer untuk manajemen meja dan order restoran.

## Stack

- Backend: Laravel 12
- Database: MySQL
- Frontend: React + TypeScript + Vite + MUI

## Fitur

- Login multi role: `waiter`, `cashier`
- Public table board untuk tamu tanpa login
- Dashboard meja dan status meja
- CRUD menu makanan/minuman
- Open order
- Detail order
- Tambah item ke order
- Tutup order
- List order
- Generate receipt PDF
- Role-based access:
  - `waiter`: buka order, tambah item, CRUD menu
  - `cashier`: close order, receipt PDF

## Struktur Folder

- `backend`
  Laravel API + migration + seeder
- `frontend`
  Frontend berbasis MUI

## Akun Demo

- Waiter
  - Email: `waiter@resto.test`
  - Password: `password`
- Cashier
  - Email: `cashier@resto.test`
  - Password: `password`

## Setup Backend

Masuk ke folder backend:

```powershell
cd backend
```

Install dependency jika belum:

```powershell
composer install
```

Copy environment file:

```powershell
copy .env.example .env
```

Generate app key:

```powershell
php artisan key:generate
```

Sesuaikan koneksi database MySQL di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pesan_meja_resto
DB_USERNAME=root
DB_PASSWORD=
```

Jalankan migration dan seeder:

```powershell
php artisan migrate:fresh --seed
```

Jalankan backend:

```powershell
php artisan serve
```

Backend akan berjalan di:

```text
http://127.0.0.1:8000
```

## Setup Frontend

Masuk ke folder frontend:

```powershell
cd frontend
```

Install dependency:

```powershell
npm install
```

Jalankan frontend:

```powershell
npm run dev
```

Frontend utama akan berjalan di:

```text
http://127.0.0.1:5173 atau http://localhost:5173/
```

Catatan:
- frontend memakai Vite proxy ke backend Laravel
- route publik tamu ada di `/`
- panel internal staff ada di `/app`

### Postman / manual API test

Urutan dasar:

1. `POST /api/login`
2. `GET /api/me`
3. `GET /api/tables`
4. `GET /api/menu-items`
5. `POST /api/orders`
6. `POST /api/orders/{id}/items`
7. `GET /api/orders/{id}`
8. `POST /api/orders/{id}/close`
9. `GET /api/orders/{id}/receipt`
