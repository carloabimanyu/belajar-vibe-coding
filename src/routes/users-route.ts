import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

const knownRegistrationErrors = [
  "Email sudah terdaftar",
  "Name maksimal 255 karakter",
  "Email maksimal 255 karakter",
  "Password tidak boleh kosong",
];

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
        const message = (error as Error).message;
        return { error: knownRegistrationErrors.includes(message) ? message : "Registrasi gagal" };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
      detail: {
        summary: "Register User",
        description: "Registrasi user baru. Password akan di-hash menggunakan bcrypt.",
        tags: ["Users"],
      },
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
      detail: {
        summary: "Login User",
        description: "Login user dan mendapatkan session token UUID.",
        tags: ["Users"],
      },
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
  }, {
    detail: {
      summary: "Get Current User",
      description: "Mendapatkan data user yang sedang login berdasarkan token.",
      tags: ["Users"],
    },
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
  }, {
    detail: {
      summary: "Logout User",
      description: "Logout user dan menghapus session dari database.",
      tags: ["Users"],
    },
  });
