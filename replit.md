# BenchBoard

BenchBoard helps small consulting and staffing firms track consultant availability and match their bench to new client briefs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/benchboard` — React + Vite consultant portal, client portal, availability dashboard, and AI match studio.
- `artifacts/api-server` — Express routes for roster CRUD, dashboard summaries, and Groq matching.
- `lib/db/src/schema` — Drizzle source of truth for consultants, engagements, clients, and client-owned projects.
- `lib/api-spec/openapi.yaml` — OpenAPI source of truth for generated client and Zod contracts.
- `artifacts/benchboard/src/index.css` — BenchBoard visual tokens and shared UI styles.

## Architecture decisions

- Consultant availability and the current engagement are exposed as one UI model, while persistence stays normalized across two tables.
- Consultant and client portals are separate routes without authentication in the MVP; each portal uses a selected seeded profile until account ownership is added.
- Client projects are the source briefs for AI consultant search, while consultant service offers are stored separately from core skills.
- The matching flow uses Groq for requirement extraction and explanation, with a local roster comparison step between them.
- Deployed status requires engagement context; status changes without an engagement open the edit flow instead of failing silently.
- The API seeds a small roster on first access so the MVP is useful immediately without hardcoded frontend data.

## Product

- Availability dashboard with roster search, status filtering, 14-day engagement alerts, and consultant CRUD.
- Consultant portal for profile details, service offers, ongoing projects, and top-rated clients.
- Client portal for client profiles, project CRUD, and AI consultant search from saved or new project briefs.
- AI match studio that extracts skills, seniority, and domain from a role brief, compares the live roster, and returns a ranked shortlist with grounded reasons.

## User preferences

- Keep the MVP focused on availability tracking and AI-assisted matching.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- The AI route requires the `GROQ_API_KEY` Replit Secret.
- Vite builds require workflow-provided `PORT` and `BASE_PATH`; use the managed workflow or provide both for manual builds.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
