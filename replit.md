# nabeen

nabeen is a Replit-style personal developer workspace for starting projects, tracking activity, and discovering the next capabilities to add.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/nabeen run dev` — run the nabeen web app
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

- `artifacts/nabeen/src/App.tsx` — frontend routes, shell, and workspace screens
- `artifacts/nabeen/src/index.css` — nabeen theme tokens and responsive styling
- `artifacts/api-server/src/routes/` — API route handlers
- `lib/api-spec/openapi.yaml` — source of truth for the typed API contract
- `lib/db/src/schema/` — Drizzle schema for nabeen projects and activity

## Architecture decisions

- The web app is a root-mounted React/Vite artifact and uses the shared API server through `/api`.
- API contracts are defined in OpenAPI first, then generated into `@workspace/api-client-react` and `@workspace/api-zod`.
- The first build uses workspace-scoped project and activity tables with a small seed set so the dashboard is useful immediately.
- Product areas that are not implemented yet are represented in the capabilities catalog instead of being presented as fake working flows.

## Product

nabeen currently includes a dashboard, project CRUD, project detail views, activity feed, capability discovery, settings screens, responsive navigation, loading/error/empty states, and a clear path toward AI building, code workspaces, deployments, collaboration, and integrations.

## User preferences

- The product name is `nabeen`.

## Gotchas

- Run API code generation after changing `lib/api-spec/openapi.yaml`.
- Artifact workflows provide `PORT` and `BASE_PATH`; use the managed workflow rather than starting Vite manually.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
