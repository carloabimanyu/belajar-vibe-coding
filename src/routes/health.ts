import { Elysia } from "elysia";

export const healthRoutes = new Elysia().get("/health", () => ({
  status: "ok",
}), {
  detail: {
    summary: "Health Check",
    description: "Mengecek apakah server berjalan dengan baik",
    tags: ["Health"],
  },
});
