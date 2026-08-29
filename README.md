**Rasuah — Bribe Reporting Platform**

Rasuah is a minimal, privacy-minded reporting platform built with Next.js and Prisma. It lets users submit public bribe reports and other users vote whether a report was helpful. The project is intended as a lightweight demo and admin/debug playground.

**Contents**
- **Overview**: quick project summary and purpose.
- **Tech Stack**: framework and key libraries.
- **Getting Started**: local setup and common commands.
- **API**: public HTTP endpoints used by the frontend.
- **Development notes**: testing, linting, and contributing.

**Overview**

This repository implements a server-rendered Next.js app with a small Prisma-backed API for storing reports, and an in-memory vote store for quick demonstration. The UI components live under `src/components`; the main app entry is `src/app/page.tsx`.

**Tech Stack**
- Next.js (App Router)
- React 19
- TypeScript
- Prisma + PostgreSQL (optional local DB)
- Tailwind CSS
- React Query (`@tanstack/react-query`)

**Quick Start**

1. Install dependencies:

```bash
npm install
```

2. (Optional) Configure your database for Prisma by setting `POSTGRES_URL_NON_POOLING` (preferred), `DATABASE_URL`, or `POSTGRES_URL`. If you plan to use the built-in Prisma models, run migrations:

```bash
npx prisma migrate dev --name init
```

3. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Notes:
- `npm run dev` uses Next's dev server. The repo's `postinstall` runs `prisma generate` automatically.

**Scripts**
- `npm run dev` — start dev server
- `npm run build` — create production build
- `npm run start` — start built app
- `npm run lint` — run ESLint

**Important files & locations**
- App entry: `src/app/page.tsx`
- Header & navigation: `src/components/SiteHeader.tsx`
- Ledger (reports + voting UI): `src/components/LedgerFeed.tsx`
- Report submission modal: `src/components/ReportModal.tsx`
- API routes: `src/app/api/reports/route.ts` and `src/app/api/reports/vote/route.ts`
- Vote logic (in-memory demo store): `src/lib/vote-store.ts`

**API Endpoints**
- `GET /api/reports` — list reports (accepts `outcome` and `sort` query params). Returns JSON `{ reports: [...] }`.
- `POST /api/reports` — create a report (JSON body matching the submission form).
- `POST /api/reports/vote` — submit a vote. Body: `{ reportId, choice, previousChoice }`. Returns `{ success: true, reportId, voteStats }`.
- `GET /api/reports/vote?reportId=...` — fetch vote stats for a specific report.

**Voting behavior**
Vote counts are stored on each report in PostgreSQL. The ledger updates immediately in the browser, queues the write briefly to avoid excess requests, and retains pending votes locally until they can be sent.

**Production migrations**

On a push to `main`, GitHub Actions runs `npx prisma migrate deploy` after the build checks when the `POSTGRES_URL_NON_POOLING` production secret is configured. Vercel production builds also run the migration before `next build`; preview builds do not. Configure Vercel's production environment with a direct PostgreSQL URL and never commit database URLs to `.env` or source control.

**Development notes**
- Language preference uses `src/lib/language-preference.ts` and is persisted to `localStorage` under the key `rasuah-language-v1`.
- React Query is used to fetch reports and to invalidate the reports cache after submissions and votes.
- If you encounter hydration mismatches (server vs client render), ensure client-only values (like `localStorage` reads) are performed inside `useEffect`.

**Testing & linting**
- Lint: `npm run lint`
- There are no automated tests included; adding Jest/Playwright or Vitest + React Testing Library is recommended for production readiness.

**Contributing**
- Fork the repo, create a feature branch, and open a pull request with a clear description.
- For database changes, add Prisma migrations and include instructions in the PR description.

**Contact**
For questions or to report issues, contact the maintainer: rakibhassan215095@gmail.com
