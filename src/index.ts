import { Elysia } from "elysia";
import { healthRoutes } from "./routes/health";
import { usersRoute } from "./routes/users-route";

const app = new Elysia()
  .use(healthRoutes)
  .use(usersRoute)
  .listen(process.env.PORT ?? 3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
