import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, sessions } from "../db/schema";

export async function registerUser(name: string, email: string, password: string): Promise<void> {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, password: hashedPassword });
}

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
