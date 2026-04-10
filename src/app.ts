import { Elysia } from "elysia";
import { healthRoutes } from "./routes/health";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .use(healthRoutes)
  .use(usersRoute);
