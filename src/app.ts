import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { healthRoutes } from "./routes/health";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Belajar Vibe Coding API",
          version: "1.0.0",
          description: "REST API untuk manajemen user dan autentikasi",
        },
      },
    })
  )
  .use(healthRoutes)
  .use(usersRoute);
