import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/users-service";

export const usersRoute = new Elysia()
  .post(
    "/api/users",
    async ({ body, set }) => {
      try {
        await registerUser(body.name, body.email, body.password);
        return { data: "OK" };
      } catch (error) {
        set.status = 400;
        return { error: (error as Error).message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/api/users/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body.email, body.password);
        return { data: token };
      } catch (error) {
        set.status = 400;
        return { error: (error as Error).message };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get("/api/users/current", async ({ headers, set }) => {
    const authorization = headers["authorization"];
    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    try {
      const token = authorization.slice(7);
      const user = await getCurrentUser(token);
      return { data: user };
    } catch {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
