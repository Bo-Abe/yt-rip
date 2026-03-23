# CLAUDE.md

SaaS web application. TypeScript monorepo: React frontend, Node.js/Express backend, PostgreSQL database.
Team: 1 Dev, 1 QA, 1 PO.

## Commands

```bash
npm run dev              # Start dev server (frontend + backend)
npm run build            # Production build
npm run test             # Unit tests (Vitest)
npm run test:e2e         # End-to-end tests (Playwright)
npm run lint             # ESLint + Prettier check
npm run lint:fix         # Auto-fix lint issues
npm run typecheck        # tsc --noEmit
npm run db:migrate       # Run pending migrations
npm run db:seed          # Seed dev database
```

## Architecture

```
/src
  /client          → React SPA (Vite, React Router)
    /components    → Reusable UI components
    /features      → Feature modules (co-located components, hooks, services)
    /hooks         → Shared custom hooks
    /lib           → API client, utilities
  /server          → Node.js/Express API
    /routes        → Route handlers (thin — delegate to services)
    /services      → Business logic (one service per domain)
    /middleware     → Auth, validation, error handling, rate limiting
    /models        → Database models / ORM entities
    /jobs          → Background tasks and scheduled jobs
  /shared          → Types, constants, validation schemas shared client↔server
/tests
  /unit            → Unit tests mirror src/ structure
  /e2e             → Playwright end-to-end scenarios
  /fixtures        → Test data factories
/migrations        → Database migration files (sequential, never edit past ones)
/docs              → Architecture decisions, API specs, runbooks
```

## Code style

- TypeScript strict mode everywhere — no `any`, no `as` casting unless justified with a comment
- Functional React components + hooks only, no class components
- Named exports, no default exports (except pages/routes if framework requires it)
- Shared validation schemas (Zod) in `/shared` — reuse on client AND server
- Prefer `async/await` over raw promises, never mix callbacks
- Error handling: always use typed custom errors, never throw raw strings
- Imports: group by external → internal → types, enforce with lint rule

## Git workflow

- Branch naming: `feature/TICKET-123-short-description`, `fix/TICKET-456-short-description`
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`)
- One logical change per commit — squash WIP before pushing
- Always rebase on main before merge request, keep history linear
- Never push directly to `main` — all changes go through merge requests
- Delete branches after merge

## Verification checklist — run before every commit

1. `npm run typecheck` — zero errors
2. `npm run lint` — zero warnings
3. `npm run test` — all green
4. If touching UI: manual visual check on latest Chrome + Firefox
5. If touching API: test with actual HTTP requests (not just unit tests)

## Security — non-negotiable rules

- NEVER hardcode secrets, tokens, or credentials — use environment variables only
- NEVER commit `.env` files — only `.env.example` with placeholder values
- ALL user input must be validated AND sanitized — server-side validation is mandatory even if client validates
- SQL: use parameterized queries only — never concatenate user input into queries
- Auth: JWT tokens in httpOnly secure cookies, never localStorage
- API routes: always check authentication AND authorization (owning the resource)
- Passwords: bcrypt with cost factor ≥ 12, never store plaintext
- CORS: explicit allowlist, never `*` in production
- Rate limiting on all public endpoints (auth, API)
- Dependencies: run `npm audit` before each release, fix critical/high immediately
- File uploads: validate MIME type server-side, limit size, never serve from app domain
- Logging: never log sensitive data (passwords, tokens, PII)
- HTTP headers: Helmet.js enabled (CSP, HSTS, X-Frame-Options, etc.)

## Error handling

- Backend: centralized error middleware — services throw typed errors, middleware catches and formats response
- Frontend: React Error Boundaries at feature level — one crash doesn't break the whole app
- API responses: consistent shape `{ data, error: { code, message } }` — never leak stack traces in production
- Log errors with structured context (userId, requestId, action) — never just `console.log(err)`
- Unhandled promise rejections must be caught at process level

## Testing

- Unit tests: isolate logic, mock external dependencies — target business-critical services first
- Integration tests: test API routes with a real test database, reset between runs
- E2E tests: cover critical user journeys (signup, login, core feature happy paths)
- Test naming: `should [expected behavior] when [condition]`
- Use factories/fixtures for test data, never hardcoded magic values
- Tests must be independent — no test should depend on another test's state or order
- QA writes acceptance criteria in tickets BEFORE development starts

## Database

- Migrations are append-only — never edit a migration that has been pushed
- Every migration must have a rollback (`down`) function
- Index all foreign keys and frequently filtered/sorted columns
- Use transactions for multi-table operations
- Soft-delete for user-facing data (add `deleted_at` column), hard-delete only for truly ephemeral data

## API design

- RESTful conventions: proper HTTP verbs, plural resource names, status codes
- Pagination on all list endpoints (cursor-based preferred for large datasets)
- Validate request body with Zod schema, return 400 with field-level errors
- Versioning: prefix routes with `/api/v1/` from day one
- Document every endpoint — at minimum: method, path, request body, response shape, auth required

## Performance

- React: lazy-load routes and heavy components — `React.lazy` + Suspense
- Backend: N+1 queries are bugs — use eager loading / joins
- Cache expensive computations and external API calls
- Images: compress and serve via CDN, use responsive sizes
- Bundle: monitor size with build step, flag regressions over threshold

## Accessibility

- Semantic HTML elements (`<nav>`, `<main>`, `<button>`, not `<div onClick>`)
- All interactive elements must be keyboard-navigable
- All images must have descriptive `alt` attributes
- Form inputs must have associated `<label>` elements
- Color contrast: meet WCAG AA minimum (4.5:1 for normal text)

## Team workflow

- PO writes user stories with acceptance criteria in Redmine/GitLab before sprint
- Dev creates feature branch, implements, writes tests, opens merge request
- QA reviews against acceptance criteria, tests on staging environment
- Merge requires: passing CI + QA approval + no unresolved comments
- Bug tickets must include: steps to reproduce, expected vs actual, environment, severity
- Hotfix process: branch from `main`, fix, test, merge — then cherry-pick to dev if needed

## What Claude must NEVER do

- Never delete or modify existing tests without explicit instruction
- Never remove or weaken security middleware
- Never skip TypeScript strict checks or add `@ts-ignore`
- Never introduce a new dependency without stating why and checking its maintenance status
- Never modify database migrations that have already been applied
- Never store secrets in code or configuration files tracked by Git
