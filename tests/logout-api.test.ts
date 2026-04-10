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

async function login(email: string, password: string): Promise<string> {
  const res = await app.handle(
    new Request("http://localhost/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  );
  const body = await res.json();
  return body.data;
}

async function logout(authorization?: string) {
  return app.handle(
    new Request("http://localhost/api/users/logout", {
      method: "DELETE",
      headers: authorization ? { Authorization: authorization } : {},
    })
  );
}

async function getCurrentUser(token: string) {
  return app.handle(
    new Request("http://localhost/api/users/current", {
      headers: { Authorization: `Bearer ${token}` },
    })
  );
}

describe("DELETE /api/users/logout", () => {
  beforeEach(async () => {
    await clearDatabase();
    await register("Eko", "eko@localhost", "rahasia");
  });

  it("berhasil logout dengan token valid", async () => {
    const token = await login("eko@localhost", "rahasia");
    const res = await logout(`Bearer ${token}`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ data: "OK" });
  });

  it("setelah logout, token tidak bisa digunakan lagi", async () => {
    const token = await login("eko@localhost", "rahasia");
    await logout(`Bearer ${token}`);

    const res = await getCurrentUser(token);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("gagal logout dengan token yang sudah di-logout", async () => {
    const token = await login("eko@localhost", "rahasia");
    await logout(`Bearer ${token}`);

    const res = await logout(`Bearer ${token}`);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("gagal jika token tidak valid", async () => {
    const res = await logout("Bearer token-tidak-valid");
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("gagal jika tanpa header Authorization", async () => {
    const res = await logout();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });
});
