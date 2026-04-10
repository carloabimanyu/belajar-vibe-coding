import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

/**
 * Registrasi user baru. Melakukan validasi input (panjang name, email, password kosong),
 * mengecek duplikasi email, lalu menyimpan user dengan password yang sudah di-hash bcrypt.
 */
export async function registerUser(name: string, email: string, password: string): Promise<void> {
  if (name.length > 255) {
    throw new Error("Name maksimal 255 karakter");
  }
  if (email.length > 255) {
    throw new Error("Email maksimal 255 karakter");
  }
  if (!password) {
    throw new Error("Password tidak boleh kosong");
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, password: hashedPassword });
}

/**
 * Login user berdasarkan email dan password. Memverifikasi kredensial menggunakan bcrypt,
 * lalu membuat session baru dengan token UUID dan mengembalikan token tersebut.
 */
export async function loginUser(email: string, password: string): Promise<string> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = result[0];
  if (!user) {
    throw new Error("Email atau password salah");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Email atau password salah");
  }

  const token = uuidv4();
  await db.insert(sessions).values({ token, userId: user.id });
  return token;
}

/**
 * Mengambil data user yang sedang login berdasarkan session token.
 * Mengembalikan id, name, email, dan createdAt (tanpa password).
 */
export async function getCurrentUser(token: string) {
  const result = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  const session = result[0];
  if (!session) {
    throw new Error("Unauthorized");
  }

  const userResult = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, session.userId)).limit(1);

  const user = userResult[0];
  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

/**
 * Logout user dengan menghapus session berdasarkan token dari database.
 * Jika token tidak ditemukan, throw error Unauthorized.
 */
export async function logoutUser(token: string): Promise<void> {
  const result = await db.delete(sessions).where(eq(sessions.token, token));
  if (result[0].affectedRows === 0) {
    throw new Error("Unauthorized");
  }
}
