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

async function getCurrentUser(authorization?: string) {
  return app.handle(
    new Request("http://localhost/api/users/current", {
      headers: authorization ? { Authorization: authorization } : {},
    })
  );
}

describe("GET /api/users/current", () => {
  beforeEach(async () => {
    await clearDatabase();
    await register("Eko", "eko@localhost", "rahasia");
  });

  it("berhasil mendapatkan data user dengan token valid", async () => {
    const token = await login("eko@localhost", "rahasia");
    const res = await getCurrentUser(`Bearer ${token}`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.name).toBe("Eko");
    expect(body.data.email).toBe("eko@localhost");
    expect(body.data.id).toBeNumber();
    expect(body.data.createdAt).toBeDefined();
    expect(body.data.password).toBeUndefined();
  });

  it("gagal jika tanpa header Authorization", async () => {
    const res = await getCurrentUser();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("gagal jika format header bukan Bearer", async () => {
    const token = await login("eko@localhost", "rahasia");
    const res = await getCurrentUser(token);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("gagal jika token tidak valid", async () => {
    const res = await getCurrentUser("Bearer token-tidak-valid");
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });
});
