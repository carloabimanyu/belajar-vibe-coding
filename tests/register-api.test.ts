import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/app";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { clearDatabase } from "./helpers";

async function register(body: Record<string, string>) {
  return app.handle(
    new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/users", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it("berhasil registrasi dengan data valid", async () => {
    const res = await register({ name: "Eko", email: "eko@localhost", password: "rahasia" });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ data: "OK" });
  });

  it("password tersimpan sebagai hash, bukan plain text", async () => {
    await register({ name: "Eko", email: "eko@localhost", password: "rahasia" });

    const result = await db.select().from(users).where(eq(users.email, "eko@localhost")).limit(1);
    expect(result[0]?.password).not.toBe("rahasia");
    expect(result[0]?.password).toStartWith("$2");
  });

  it("gagal jika email sudah terdaftar", async () => {
    await register({ name: "Eko", email: "eko@localhost", password: "rahasia" });
    const res = await register({ name: "Eko Lain", email: "eko@localhost", password: "rahasia2" });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Email sudah terdaftar" });
  });

  it("gagal jika name melebihi 255 karakter", async () => {
    const res = await register({ name: "A".repeat(256), email: "eko@localhost", password: "rahasia" });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Name maksimal 255 karakter" });
  });

  it("gagal jika email melebihi 255 karakter", async () => {
    const res = await register({ name: "Eko", email: "a".repeat(256) + "@localhost", password: "rahasia" });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Email maksimal 255 karakter" });
  });

  it("gagal jika password kosong", async () => {
    const res = await register({ name: "Eko", email: "eko@localhost", password: "" });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Password tidak boleh kosong" });
  });

  it("gagal jika request body tidak lengkap", async () => {
    const res = await register({ name: "Eko", password: "rahasia" });
    expect(res.status).toBe(422);
  });
});
