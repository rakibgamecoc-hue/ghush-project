import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Vercel Postgres: use the direct non-pooled URL for Prisma migrations and runtime access.
    url: process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL ?? "",
  },
});
