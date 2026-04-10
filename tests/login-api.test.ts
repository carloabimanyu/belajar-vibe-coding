import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/app";
import { clearDatabase } from "./helpers";

async function register(name: string, email: string, password: string) {
  return app.handle(
    new Request("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
  );
}

async function login(body: Record<string, string>) {
  return app.handle(
    new Request("http://localhost/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await clearDatabase();
    await register("Eko", "eko@localhost", "rahasia");
  });

  it("berhasil login dan mendapatkan token UUID", async () => {
    const res = await login({ email: "eko@localhost", password: "rahasia" });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeString();
    expect(body.data).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("login dua kali menghasilkan token yang berbeda", async () => {
    const res1 = await login({ email: "eko@localhost", password: "rahasia" });
    const res2 = await login({ email: "eko@localhost", password: "rahasia" });
    const body1 = await res1.json();
    const body2 = await res2.json();

    expect(body1.data).not.toBe(body2.data);
  });

  it("gagal jika email tidak terdaftar", async () => {
    const res = await login({ email: "tidakada@localhost", password: "rahasia" });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Email atau password salah" });
  });

  it("gagal jika password salah", async () => {
    const res = await login({ email: "eko@localhost", password: "salah" });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({ error: "Email atau password salah" });
  });

  it("gagal jika request body tidak lengkap", async () => {
    const res = await login({ email: "eko@localhost" });
    expect(res.status).toBe(422);
  });
});
