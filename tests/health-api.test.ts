import { describe, it, expect } from "bun:test";
import { app } from "../src/app";

describe("GET /health", () => {
  it("returns status ok", async () => {
    const res = await app.handle(new Request("http://localhost/health"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ status: "ok" });
  });
});
