# Belajar Vibe Coding

Backend REST API sederhana untuk manajemen user dan autentikasi, dibangun menggunakan Bun, ElysiaJS, Drizzle ORM, dan MySQL.

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Runtime & Package Manager | [Bun](https://bun.sh) |
| Web Framework | [ElysiaJS](https://elysiajs.com) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Database | MySQL |
| Testing | Bun Test |

## Library

| Library | Fungsi |
|---------|--------|
| `elysia` | Web framework untuk routing dan request handling |
| `drizzle-orm` | ORM untuk query database |
| `mysql2` | Driver koneksi MySQL |
| `drizzle-kit` | CLI tool untuk generate dan menjalankan migration |
| `bcryptjs` | Hashing password |
| `uuid` | Generate UUID untuk session token |

## Struktur Folder

```
src/
  app.ts                  # Definisi Elysia app (tanpa listen, untuk testability)
  index.ts                # Entry point, menjalankan server
  db/
    index.ts              # Koneksi database (Drizzle + mysql2 pool)
    schema.ts             # Definisi schema tabel (Drizzle)
  routes/
    health.ts             # Route GET /health
    users-route.ts        # Route untuk user (register, login, current, logout)
  services/
    users-service.ts      # Logic bisnis (register, login, get current user, logout)
tests/
  helpers.ts              # Utility test (clearDatabase)
  health-api.test.ts      # Test untuk health endpoint
  register-api.test.ts    # Test untuk registrasi user
  login-api.test.ts       # Test untuk login
  current-user-api.test.ts # Test untuk get current user
  logout-api.test.ts      # Test untuk logout
drizzle/                  # File migration yang di-generate oleh Drizzle Kit
drizzle.config.ts         # Konfigurasi Drizzle Kit
```

### Konvensi Penamaan File

- **Routes**: `<nama>-route.ts` (contoh: `users-route.ts`)
- **Services**: `<nama>-service.ts` (contoh: `users-service.ts`)
- **Tests**: `<nama>-api.test.ts` (contoh: `register-api.test.ts`)

## Database Schema

### Tabel `users`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT | Auto increment, primary key |
| `name` | VARCHAR(255) | Not null |
| `email` | VARCHAR(255) | Not null, unique |
| `password` | VARCHAR(255) | Not null, hash bcrypt |
| `created_at` | TIMESTAMP | Default current timestamp |

### Tabel `sessions`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT | Auto increment, primary key |
| `token` | VARCHAR(255) | Not null, unique, berisi UUID |
| `user_id` | INT | Foreign key ke `users.id` |
| `created_at` | TIMESTAMP | Default current timestamp |

## API Endpoints

### GET /health

Health check endpoint.

**Response (200):**
```json
{ "status": "ok" }
```

### POST /api/users

Registrasi user baru. Password akan di-hash menggunakan bcrypt sebelum disimpan.

**Request Body:**
```json
{
  "name": "Eko",
  "email": "eko@localhost",
  "password": "rahasia"
}
```

**Response (200):**
```json
{ "data": "OK" }
```

**Response error (400):**
```json
{ "error": "Email sudah terdaftar" }
```

### POST /api/users/login

Login user. Jika berhasil, membuat session baru dan mengembalikan token UUID.

**Request Body:**
```json
{
  "email": "eko@localhost",
  "password": "rahasia"
}
```

**Response (200):**
```json
{ "data": "550e8400-e29b-41d4-a716-446655440000" }
```

**Response error (400):**
```json
{ "error": "Email atau password salah" }
```

### GET /api/users/current

Mendapatkan data user yang sedang login berdasarkan token.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Eko",
    "email": "eko@localhost",
    "createdAt": "2026-04-09T14:18:23.000Z"
  }
}
```

**Response error (401):**
```json
{ "error": "Unauthorized" }
```

### DELETE /api/users/logout

Logout user. Menghapus session dari database.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{ "data": "OK" }
```

**Response error (401):**
```json
{ "error": "Unauthorized" }
```

## Setup Project

### Prasyarat

- [Bun](https://bun.sh) terinstall
- MySQL server berjalan

### Langkah-langkah

1. Clone repository dan install dependencies:

```bash
bun install
```

2. Buat database MySQL:

```sql
CREATE DATABASE belajar_vibe_coding;
```

3. Buat file `.env` di root project:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD="password_kamu"
DB_NAME=belajar_vibe_coding
```

> Jika password mengandung karakter khusus (seperti `#`), bungkus dengan tanda kutip ganda.

4. Jalankan migration:

```bash
bun run db:migrate
```

## Menjalankan Aplikasi

```bash
bun run dev
```

Server akan berjalan di `http://localhost:3000` dengan hot reload.

## Menjalankan Test

```bash
bun run test
```

Test menggunakan `bun test` dan akan menjalankan semua file `*.test.ts` di folder `tests/`.
