#!/usr/bin/env sh
set -eu

if [ "${VERCEL_ENV:-}" = "production" ]; then
  npx prisma migrate deploy
fi

npm run build
