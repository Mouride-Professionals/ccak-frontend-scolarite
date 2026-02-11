# CCAK Frontend - Scolarité

Next.js 16 + React 19 + TypeScript educational management system for UCAK university.

## Commands

```bash
pnpm dev          # Start dev server on port 5173
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm test         # Run lint + format checks
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **State:** Zustand (global), TanStack Query (server state)
- **Forms:** React Hook Form + Zod validation
- **UI:** Radix UI + Tailwind CSS v4
- **Auth:** NextAuth + Keycloak (JWT sessions with refresh)
- **Security:** DOMPurify sanitization, CSP headers, HTTPS enforcement

## Architecture

```
app/              Next.js App Router pages (students, courses, enrollments, etc.)
components/       Reusable React components organized by feature
lib/              Core utilities (api-client, auth, sanitize, crypto)
hooks/            Custom hooks (use-safe-params, use-inactivity-timer)
types/            TypeScript type definitions
```

## Key Patterns

**API Calls:**

- Use `api.get()`, `api.post()`, etc. from `@/lib/api-client.ts`
- Auto-injects auth token from session
- Auto-sanitizes payloads before sending
- Auto-redirects to /login on 401/403

```ts
import { api } from "@/lib/api-client";
const data = await api.get<Student[]>("/api/students");
const created = await api.post<Student>("/api/students", { name: "John" });
```

**Forms:**

- React Hook Form + Zod schemas
- Use zodResolver for validation
- Sanitize inputs on submit

**Auth:**

- JWT sessions via NextAuth
- Keycloak SSO provider
- Token refresh before expiry
- Secure cookies in production

**Security:**

- All payloads sanitized via DOMPurify
- CSP headers configured in next.config.ts
- HTTPS enforced in production via middleware
- Safe param validation via use-safe-params hook

## Naming Conventions

- Components: PascalCase (e.g., `StudentList.tsx`)
- Files: kebab-case (e.g., `api-client.ts`)
- API paths: Match backend endpoints (e.g., `/api/students`)

## Environment

Required env vars (see .env.example):

- NEXTAUTH_URL, NEXTAUTH_SECRET
- KEYCLOAK_BASE_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID
- NEXT_PUBLIC_API_BASE_URL (defaults to https://api.ucak.edu.sn)

## Security

**Critical:** See [docs/security/](docs/security/) for comprehensive security documentation.

- **Forms:** Always use Zod schemas from `lib/validations/schemas.ts`
- **Errors:** Use `toUserError()` from `lib/error-handler.ts` for user-facing messages
- **API:** Use `api.*` helpers from `lib/api-client.ts` (auto-sanitizes, logs errors)
- **URLs:** Validate with `useSafeParams()` hook for route params
- **Dependencies:** Next.js 16.0.10 has security vulnerabilities - UPDATE to 16.1.5+ required

Quick reference: [docs/security/DEVELOPER_GUIDE.md](docs/security/DEVELOPER_GUIDE.md)

## Session Efficiency

- Use Read before Edit/Write for existing files
- Use api.\* helpers instead of raw fetch
- Leverage TanStack Query cache; check existing queries before adding new ones
- Use safe params hook for URL params: `const { id } = useSafeParams(["id"])`
- For forms, reference existing patterns in `components/faculties/faculty-form.tsx`
