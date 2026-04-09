import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-service";

export const usersRoute = new Elysia().post(
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
);
