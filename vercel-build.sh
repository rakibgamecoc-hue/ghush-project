#!/usr/bin/env sh
set -eu

if [ "${VERCEL_ENV:-}" = "production" ]; then
  # Production already contains the original Prisma schema but predates the
  # migrations directory. Record that schema as the baseline, then apply only
  # migrations introduced after it.
  npx prisma migrate resolve --applied 20260828000000_baseline || true
  npx prisma migrate deploy
fi

npm run build
