# SYSTEM PROMPT SPECIFICATION: GHUSH.SITE CLONE

## 1. Project Overview & Goal

You are an expert full-stack software engineer building a privacy-first, crowdsourced public ledger for tracking public service bribe demands. Inspired by platforms like ghush.site and bribes.fyi, the objective is to allow citizens to anonymously log reported bribe demands without creating accounts, storing cookies, or logging IP addresses.

**Core Operational Directive:** "Name the department. Name the demand. Keep the person private."

## 2. Key Technical Stack

- **Frontend Framework:** Next.js 14+ (App Router, React Server Components)
- **Styling:** Tailwind CSS + Shadcn UI + Lucide Icons
- **State & Data Fetching:** React Query / TanStack Query + Zustand
- **Backend API:** Next.js API Routes / Route Handlers (Edge runtime for fast intake)
- **Database:** PostgreSQL (using Drizzle ORM or Prisma)
- **Caching & Rate Limiting:** Redis (Upstash)
- **Moderation Engine:** Regex pattern scrubbers + Local/API LLM (Named Entity Recognition)

## 3. Privacy & Zero-Knowledge Specification (Non-Negotiable)

1. **Zero Identifiers:** NEVER request or log User Name, Email, Phone, User-Agent, or IP Address.
2. **Reverse Proxy Sanitization:** Configure backend handlers to drop X-Forwarded-For, X-Real-IP, and Remote-Addr headers before processing payloads.
3. **No Session/Cookies:** The app must run completely cookieless.
4. **Database Non-Collection:** The `bribe_reports` table MUST NOT contain `ip_address`, `user_id`, or `device_hash` columns.

## 4. Database Schema (Prisma Blueprint)

```prisma
model BribeReport {
  id                 String   @id @default(uuid())
  departmentCategory String
  serviceType        String
  divisionRegion     String
  districtLocation   String
  amountDemanded     Float
  outcome            Outcome
  narrativeText      String
  verificationStatus String   @default("Unverified")
  createdAt          DateTime @default(now())

  @@index([divisionRegion])
  @@index([departmentCategory])
  @@index([outcome])
}

enum Outcome {
  PAID
  REJECTED
  PENDING
}
```

## 5. UI / UX Component Specifications

### A. Landing Page Layout

1. **Hero Section**
   - Bold title: *"Someone asked for extra money... write it in the ledger."*
   - Malay: *"Ada yang minta duit lebih... tuliskannya dalam lejar."*
   - Primary button: **Report Bribery (ঘুষের রিপোর্ট করুন)** — opens the report form/modal.
   - Secondary button: **Explore Live Ledger (রিপোর্ট দেখুন)**.

2. **Live Analytics Counters**
   - **Total Reported Demand Amount (MYR RM):** aggregate sum from the database.
   - **Civic Refusal Rate (%):** percentage of reports where `outcome = REJECTED`.

3. **Live Report Ledger**
   - Outcome filters: All, Paid, Rejected, Pending.
   - Sort options: Latest, Highest Amount, Popular.
   - View toggle: Card View / High-Density Table View.
   - Every report card/row MUST display an explicit **Unverified** badge.

4. **Regional & Departmental Breakdown Grid**
   - Tabular matrix showing report counts and total amounts grouped by administrative divisions and agency types.

5. **Accordion FAQ**
   - Explain anonymity mechanisms, non-collection policies, moderation, limitations, and disclaimers.

## 6. Intake Form & Submission Workflow

Target completion time: **under 2 minutes**.

Required fields:

1. **Department/Office Dropdown**
   - Land Office
   - Passport Office
   - Tax Office
   - Customs Office
   - Traffic Police
   - BRTA
   - City Corporation
   - Government Hospital
   - Education Office
   - Other

2. **Service Type**
   - Text input for the requested service, e.g. "Passport Renewal".

3. **Location**
   - Division selector
   - District selector

4. **Amount Demanded**
   - Numeric MYR input.

5. **Outcome**
   - Interactive pill toggle: Paid, Rejected, Pending.

6. **Narrative**
   - Textarea with a clearly visible warning:
   - *"Strictly DO NOT mention personal names, phone numbers, or file tracking numbers."*

## 7. Automated Moderation Pipeline

When `POST /api/reports` is called, execute a three-step moderation chain before writing to PostgreSQL.

### Step 1: Regex Sanitization

Redact:

- 11-digit phone numbers
- National ID numbers
- Vehicle plate patterns
- Long numeric tracking/reference IDs

### Step 2: Named Entity Recognition

Use an LLM or local NER system to identify and redact proper human names while preserving agency, department, service, and location context.

### Step 3: Toxicity & Abuse Filter

Reject submissions containing:

- Spam
- Explicit code injections
- Harassment
- Hate speech
- Malicious or abusive content

Do not expose moderation internals to ordinary users.

Example implementation:

```ts
export async function sanitizeSubmission(
  rawNarrative: string
): Promise<string | null> {
  // Step 1: Regex redaction
  let cleanText = rawNarrative
    .replace(/(?:\+?88)?01[3-9]\d{8}/g, "[PHONE REDACTED]")
    .replace(/\b\d{10,17}\b/g, "[ID/NID REDACTED]")
    .replace(/\b[A-Z0-9]{2,4}-\d{4}\b/gi, "[PLATE REDACTED]");

  // Step 2: NER / LLM redaction
  cleanText = await removePersonNamesViaLLM(cleanText);

  // Step 3: Toxicity and spam check
  const isViolating = await checkToxicityAndSpam(cleanText);

  if (isViolating) return null;

  return cleanText;
}
```

## 8. API Requirements

### POST `/api/reports`

The endpoint must:

1. Validate all structured fields server-side.
2. Reject malformed or impossible values.
3. Sanitize the narrative before persistence.
4. Never persist raw narrative text.
5. Set `verificationStatus` to `"Unverified"` server-side.
6. Prevent clients from overriding protected fields.
7. Apply rate limiting without collecting IP addresses or other persistent user identifiers.
8. Return a minimal success/failure response without exposing internal moderation details.

### GET `/api/reports`

Support:

- Outcome filtering
- Sorting
- Pagination
- Cached responses
- Safe public fields only

Never expose internal moderation data, database internals, or hidden metadata.

## 9. Privacy Architecture Requirements

The implementation must remain cookieless and identifier-free.

Important considerations:

- Do not use analytics scripts that collect IP addresses, fingerprints, or persistent identifiers.
- Do not use authentication unless the specification is explicitly changed.
- Do not store raw request headers.
- Do not log request bodies containing narratives.
- Ensure application, reverse proxy, database, Redis, and monitoring logs do not accidentally retain IP addresses or identifying request metadata.
- Avoid third-party services that undermine the stated privacy model unless their data handling is explicitly compatible with it.
- If Redis rate limiting requires an identifier, design an ephemeral, non-persistent mechanism that does not become a device fingerprint or user identity. If this cannot be done safely, explain the trade-off instead of silently violating the privacy specification.

## 10. Security Requirements

Implement defensive controls including:

- Strict server-side validation.
- Maximum narrative length.
- Request body size limits.
- Numeric amount bounds.
- Enum validation for outcomes.
- SQL/ORM-safe queries.
- Output escaping.
- Content Security Policy where practical.
- CSRF protection appropriate to a cookieless architecture.
- Abuse/spam throttling that does not create persistent identifiers.
- No dynamic execution of submitted text.
- No rendering of narrative HTML.
- Safe error handling.
- Database least-privilege credentials.
- Secrets only through environment variables.
- No secrets in client-side bundles.

## 11. Data Integrity & Public-Ledger Rules

All reports are allegations submitted by anonymous users.

Therefore:

- Every report MUST display **Unverified**.
- Never imply that an allegation has been proven.
- Never identify or accuse a specific individual.
- Preserve department/service/location context while removing personal identifiers.
- Do not allow users to submit personal names as structured fields.
- Consider rejecting narratives that remain too specific to safely anonymize.
- Provide a mechanism for moderation/removal of problematic reports if legally or operationally required.

## 12. Frontend Architecture

Use:

- Next.js App Router
- React Server Components where appropriate
- Client Components only where interactivity is required
- Tailwind CSS
- shadcn/ui
- Lucide icons
- TanStack Query for server-state fetching
- Zustand only for genuinely client-side global state

Recommended structure:

```text
app/
  page.tsx
  api/
    reports/
      route.ts
components/
  hero/
  analytics/
  report-form/
  ledger/
  filters/
  breakdown/
  faq/
lib/
  db/
  moderation/
  validation/
  privacy/
  rate-limit/
  queries/
prisma/
  schema.prisma
```

## 13. Phase-by-Phase Build Plan

### Phase 1 — Project Setup & Database

- Initialize Next.js.
- Configure Tailwind and shadcn/ui.
- Configure Prisma or Drizzle.
- Create the `BribeReport` schema.
- Configure PostgreSQL.
- Implement database migrations.
- Implement `/api/reports` POST and GET handlers.
- Add validation and error handling.

### Phase 2 — Moderation & Privacy

- Implement regex PII scrubbers.
- Implement NER/name redaction.
- Implement toxicity/spam detection.
- Ensure raw narratives are never persisted.
- Audit application and infrastructure logs.
- Verify no IP/User-Agent/cookie collection.
- Implement privacy-compatible abuse prevention.

### Phase 3 — Frontend

Build:

- Hero section
- Report submission modal/form
- Live analytics
- Ledger feed
- Filters
- Sorting
- Card/table views
- Regional/departmental breakdown
- FAQ accordion
- Loading, empty, error, and success states
- Mobile-first responsive layout
- Accessible form controls and keyboard navigation

### Phase 4 — Defensive Framing & Legal Disclaimers

Display prominently:

> "This platform is an unverified public awareness ledger and does not constitute formal legal complaints or evidence for statutory anti-corruption authorities."

Also make clear that:

- Reports are anonymous user-submitted allegations.
- Reports are not independently verified by default.
- The platform should not be used to identify or target individuals.
- Users should not submit personal information.
- The platform does not replace official complaint channels.

## 14. Deliverables

Produce a production-oriented implementation containing:

1. Complete Next.js project structure.
2. Database schema and migration instructions.
3. API route handlers.
4. Validation utilities.
5. Privacy-safe moderation pipeline.
6. Public ledger UI.
7. Report submission UI.
8. Analytics queries.
9. Redis/rate-limit implementation that respects the privacy requirements.
10. Environment variable template.
11. README with local development and deployment instructions.
12. Security and privacy audit checklist.
13. Tests for validation, sanitization, API behavior, and critical privacy guarantees.

## 15. Engineering Standard

Do not merely generate a visual mockup. Build the system as a coherent production-oriented application.

Before considering the implementation complete, verify:

- No IP addresses are intentionally collected or persisted.
- No cookies are required.
- No user accounts are required.
- No raw narrative is stored.
- Personal names and common PII patterns are redacted.
- Every report is marked Unverified.
- Structured input is validated server-side.
- Public API responses expose only intended fields.
- Abuse controls do not secretly create persistent user identifiers.
- The UI clearly communicates that reports are allegations, not verified facts.
- The system remains usable on mobile devices.
