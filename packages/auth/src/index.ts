import { env } from "@t3code-clone/env/server";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export function createAuth() {
  return betterAuth({
    database: "", // Invalid configuration
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    plugins: [nextCookies()],
  });
}

export const auth = createAuth();
