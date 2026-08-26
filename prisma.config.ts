import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Vercel Postgres: POSTGRES_URL_NON_POOLING is the direct (non-pooled) connection
    // required for migrations. At runtime, PrismaClient uses this too via the adapter.
    url: process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL ?? "",
  },
});
