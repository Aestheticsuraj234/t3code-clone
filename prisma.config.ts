import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // CLI (migrate, introspect, etc.): Neon direct host — avoids pooler limits on DDL.
  // Runtime app code uses pooled `DATABASE_URL` in src/lib/prisma.ts.
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
