Local development and migration steps

- Ensure env: set `POSTGRES_URL_NON_POOLING` (or `DATABASE_URL`) pointing to your Postgres instance.
- Install dependencies:

```bash
npm install
```

- Generate Prisma client and push migrations / schema changes:

```bash
npx prisma generate
# For development (push schema to DB):
npx prisma db push
# For production use migrations:
npx prisma migrate deploy
```

- If you changed the Prisma schema (e.g., `Decimal` type), regenerate the client and run the appropriate migration command above.
