# Planning: Setup Project Backend dengan Bun, ElysiaJS, Drizzle, dan MySQL

## Project Overview

Buat project backend (REST API) baru di folder ini menggunakan Bun sebagai runtime dan package manager. Project ini akan menjadi fondasi untuk aplikasi yang menggunakan ElysiaJS sebagai web framework, Drizzle ORM untuk interaksi database, dan MySQL sebagai database utama.

---

## Tech Stack

- **Runtime & Package Manager**: Bun
- **Web Framework**: ElysiaJS
- **ORM**: Drizzle ORM
- **Database**: MySQL

---

## Langkah-langkah Setup

### 1. Inisialisasi Project

Inisialisasi project baru menggunakan Bun, lalu install semua dependency yang dibutuhkan:
- `elysia`
- `drizzle-orm`
- `mysql2`
- `drizzle-kit` (sebagai dev dependency)

### 2. Struktur Folder

Atur struktur folder project seperti berikut:

```
src/
  index.ts         # Entry point, setup server ElysiaJS
  routes/          # Kumpulan route handler
  db/
    index.ts       # Koneksi database Drizzle
    schema.ts      # Definisi schema/tabel
drizzle.config.ts  # Konfigurasi Drizzle Kit
.env               # Environment variables (DB_URL, PORT, dll)
```

### 3. Konfigurasi Database

- Buat file koneksi database menggunakan Drizzle + mysql2
- Definisikan schema tabel di `src/db/schema.ts`
- Buat konfigurasi `drizzle.config.ts` yang mengarah ke folder schema dan output migration

### 4. Setup API dengan ElysiaJS

- Di `src/index.ts`, inisialisasi server ElysiaJS
- Buat minimal satu contoh route (misalnya `GET /health`) untuk memastikan server berjalan
- Pisahkan route ke folder `src/routes/` agar mudah dikelola

### 5. Jalankan Project

Tambahkan script berikut di `package.json`:
- `dev` — menjalankan server dalam mode development
- `db:generate` — generate file migration dari schema
- `db:migrate` — jalankan migration ke database

---

## Catatan

- Gunakan file `.env` untuk menyimpan konfigurasi sensitif (host, user, password, nama database)
- Pastikan koneksi database berhasil sebelum server mulai menerima request
- Jaga agar struktur tetap sederhana dan tidak over-engineered di tahap awal
