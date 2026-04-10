import { Elysia, t } from "elysia";

export const healthRoutes = new Elysia().get("/health", () => ({
  status: "ok",
}), {
  response: {
    200: t.Object({ status: t.String() }),
  },
  detail: {
    summary: "Health Check",
    description: "Mengecek apakah server berjalan dengan baik",
    tags: ["Health"],
  },
});
