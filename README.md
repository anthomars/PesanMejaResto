# Pesan Meja Resto

Progress awal study case full stack developer untuk manajemen meja dan order restoran.

## Stack

- Backend: Laravel 12
- Frontend: React + Vite

## Progress Saat Ini

- Backend API inti sudah dibuat:
  - login multiple role sederhana dengan bearer token
  - list meja
  - CRUD makanan/minuman
  - open order
  - detail order
  - tambah item ke order
  - tutup order
  - list order
  - generate receipt PDF
- Frontend baru sebatas scaffold awal dan dependency React

## Catatan Verifikasi

- `composer dump-autoload` berhasil dijalankan
- `php artisan migrate:fresh --seed` belum bisa dijalankan di environment ini karena PHP CLI belum memiliki driver `pdo_sqlite`

