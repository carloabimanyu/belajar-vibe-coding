import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

function extractToken(authorization: string | undefined): string | null {
  if (!authorization || !authorization.startsWith("Bearer ")) return null;
  return authorization.slice(7);
}

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
    const token = extractToken(headers["authorization"]);
    if (!token) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    try {
      const user = await getCurrentUser(token);
      return { data: user };
    } catch {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  })
  .delete("/api/users/logout", async ({ headers, set }) => {
    const token = extractToken(headers["authorization"]);
    if (!token) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    try {
      await logoutUser(token);
      return { data: "OK" };
    } catch {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
