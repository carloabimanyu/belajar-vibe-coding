import { Elysia } from "elysia";
import { healthRoutes } from "./routes/health";

const app = new Elysia()
  .use(healthRoutes)
  .listen(process.env.PORT ?? 3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
