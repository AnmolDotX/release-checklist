# Release Checklist Tool — Architecture & System Design

This document provides a comprehensive technical reference for the **Release Checklist Tool**: design patterns, data flow, database schema, API specification, deployment strategy, and key engineering decisions. Intended for engineers reviewing, extending, or interviewing on this codebase.

---

## 📐 System Architecture Diagram

```mermaid
graph TD
    User([User Browser]) -->|HTTPS| Client[Next.js 15 SPA — Vercel]

    subgraph "Client App (client/)"
        Client --> Pages[App Router Pages]
        Pages --> Components[React Components]
        Components --> Hooks["TanStack Query Hooks (useReleases.ts)"]
        Hooks --> ApiService["API Service (api.ts)"]
        ApiService --> Sanitizer["URL Sanitizer — getApiBaseUrl()"]
    end

    Sanitizer -->|REST JSON over HTTPS| Server["Express Backend — Vercel Serverless"]

    subgraph "Backend (server/src/)"
        Server --> Routes["Routes Layer (/api/*)"]
        Routes --> Middleware["asyncHandler + errorHandler"]
        Middleware --> Controllers["Controllers Layer"]
        Controllers --> Services["Release Service Layer"]
        Services --> DB["DB Layer — getPrisma()"]
        DB --> Adapter["PrismaMariaDb Adapter (mariadb driver)"]
    end

    Adapter -->|TLS/SSL — port 20387| AivenDB[("Aiven MySQL 8 — Cloud")]
```

---

## 💡 Key Engineering Decisions

### 1. Prisma 7 + `@prisma/adapter-mariadb` (Driver Adapter Pattern)

Prisma 7 removed the Rust-based query engine and **requires** a JavaScript driver adapter for all connections. There is no legacy fallback mode.

- **Adapter**: `@prisma/adapter-mariadb` + `mariadb` npm driver — the only officially supported MySQL/MariaDB adapter in Prisma 7.
- **SSL Auto-Detection**: The `buildMariaDbConfig()` function in `server/src/db/prisma.ts` parses `DATABASE_URL`, detects non-3306 ports (Aiven uses port `20387`), and automatically enables `ssl: { rejectUnauthorized: false }`. This is what fixed the `pool timeout after 10001ms` error from the mariadb driver silently failing TLS negotiation.
- **Connection Config**: The adapter receives a structured object (`host`, `port`, `user`, `password`, `database`, `ssl`, `connectionLimit`, `connectTimeout`) instead of a raw URL string, giving explicit control over SSL and pool settings.

```ts
// server/src/db/prisma.ts — core pattern
function buildMariaDbConfig(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const port = parseInt(url.port || '3306', 10);
  const useSSL = port !== 3306; // Aiven = non-3306 → always SSL

  return {
    host: url.hostname, port, user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    connectionLimit: 5, connectTimeout: 10000,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  };
}

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const adapter = new PrismaMariaDb(buildMariaDbConfig(config.databaseUrl));
    prismaInstance = new PrismaClient({ adapter, log: ['error'] });
  }
  return prismaInstance;
}
```

### 2. TanStack Query for Client State Management

Rather than imperative `useState + useEffect` fetch patterns, all server state is managed via **TanStack Query v5** (`@tanstack/react-query`):

- **Declarative Queries**: `useReleasesQuery`, `useStepsQuery`, `useHealthQuery` handle caching, background refetch, and loading states automatically.
- **Cache Invalidation on Mutation**: `useCreateReleaseMutation`, `useUpdateReleaseMutation`, `useDeleteReleaseMutation` call `queryClient.invalidateQueries(['releases'])` on success — no manual state synchronization needed.
- **Optimistic UX**: Loading and error states exposed via `isLoading`, `isError`, `isFetching` booleans from hooks.

### 3. URL Sanitizer — `getApiBaseUrl()`

`client/src/services/api.ts` exposes `getApiBaseUrl()` which:
- Reads `NEXT_PUBLIC_API_URL` env var
- Prepends `https://` if missing
- Appends `/api` suffix if not already present
- Used **everywhere** in the client — no ad-hoc URL construction

### 4. Backend Layered Architecture (Separation of Concerns)

```
HTTP Request → Routes → asyncHandler → Controller → Service → Prisma → MySQL
                                ↓
                         errorHandler (global 500)
```

| Layer | Path | Responsibility |
|---|---|---|
| Routes | `server/src/routes/` | Mount REST endpoints under `/api` |
| Controllers | `server/src/controllers/` | HTTP status codes, request parsing, JSON responses |
| Services | `server/src/services/` | Business logic + Prisma ORM queries |
| DB | `server/src/db/prisma.ts` | Singleton PrismaClient with SSL-aware adapter |
| Middleware | `server/src/middleware/` | `asyncHandler` wrapper + global `errorHandler` |

### 5. Dynamic Status Computation (No Stored Status Column)

Release status is **never stored** in the database. It is computed at query time in the service layer:

```ts
// server/src/utils/status.ts
export function computeStatus(completedSteps: string[]): ReleaseStatus {
  const total = PREDEFINED_STEPS.length; // 7
  if (completedSteps.length === 0) return 'planned';
  if (completedSteps.length >= total) return 'done';
  return 'ongoing';
}
```

This avoids any risk of status/steps going out of sync in the database.

### 6. Steps Are Static — Not a DB Table

Per the assignment spec, all 7 steps are identical across all releases and defined as a constant (`server/src/constants/steps.ts`). Only the **completion state** (which step IDs are done) is persisted as a `JSON` array in `releases.completed_steps`.

---

## 📂 Repository Structure

```text
release-checklist/
├── README.md                   # Quickstart guide, API endpoints, DB schema
├── ARCHITECTURE.md             # This file — deep technical reference
├── ASSIGNMENT.md               # Original assignment specification
│
├── client/                     # Next.js 15 SPA Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout — mounts QueryClientProvider
│   │   │   ├── page.tsx        # Main SPA — list + form orchestrator
│   │   │   └── health/
│   │   │       └── page.tsx    # /health route — live system health dashboard
│   │   ├── components/
│   │   │   ├── Header.tsx          # App header with Health Check link
│   │   │   ├── ReleaseList.tsx     # Releases table
│   │   │   ├── ReleaseForm.tsx     # Create / Edit form
│   │   │   ├── ReleaseStatusBadge.tsx  # Status pill (Done/Ongoing/Planned)
│   │   │   ├── DeleteModal.tsx     # Confirmation modal for delete
│   │   │   ├── Toast.tsx           # Notification banner
│   │   │   └── Providers.tsx       # TanStack QueryClientProvider
│   │   ├── hooks/
│   │   │   └── useReleases.ts      # All TanStack Query hooks + mutations
│   │   ├── services/
│   │   │   └── api.ts              # API client — getApiBaseUrl(), all fetch fns
│   │   ├── types/
│   │   │   └── release.ts          # TypeScript interfaces (Release, Step, Health)
│   │   └── utils/
│   │       └── formatters.ts       # Date formatters, status label helpers
│   └── package.json
│
└── server/                     # Express + TypeScript + Prisma 7 Backend
    ├── prisma/
    │   └── schema.prisma       # Prisma schema — Release model
    ├── prisma.config.ts        # Prisma 7 CLI config — SSL-aware datasource URL
    ├── docker-compose.yml      # Local dev: MySQL 8.4 + Node server containers
    ├── Dockerfile              # Multi-stage Docker build
    ├── vercel.json             # Vercel serverless routing config
    ├── init.sql                # MySQL DDL seed for local Docker
    ├── src/
    │   ├── config/
    │   │   └── env.ts          # Env loader — DATABASE_URL, PORT
    │   ├── constants/
    │   │   └── steps.ts        # 7 predefined checklist steps (static)
    │   ├── controllers/
    │   │   ├── healthController.ts  # GET /api/health — real DB ping + 5s timeout
    │   │   ├── releaseController.ts # CRUD handlers for /api/releases
    │   │   └── stepController.ts    # GET /api/steps handler
    │   ├── db/
    │   │   └── prisma.ts       # Singleton PrismaClient — SSL-aware adapter config
    │   ├── middleware/
    │   │   └── errorHandler.ts # asyncHandler wrapper + global error middleware
    │   ├── routes/
    │   │   ├── index.ts        # Main router — mounts all sub-routes
    │   │   ├── releaseRoutes.ts # /api/releases CRUD routes
    │   │   └── stepRoutes.ts   # /api/steps route
    │   ├── services/
    │   │   └── releaseService.ts # All Prisma queries — pure business logic
    │   ├── types/
    │   │   └── release.ts      # Domain types (Release, ReleaseStatus, CreateDTO)
    │   ├── utils/
    │   │   └── status.ts       # computeStatus() — planned/ongoing/done logic
    │   ├── index.ts            # Express app setup + server bootstrap
    │   └── index.test.ts       # Integration tests — Jest + Supertest (7 tests)
    └── package.json
```

---

## 🗄️ Database Schema

**Hosted on**: Aiven MySQL 8 (cloud, SSL required)  
**ORM**: Prisma 7 with `@prisma/adapter-mariadb`  
**Table**: `releases`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Auto-increment PK |
| `name` | `String` | `NOT NULL` | Release name / version label |
| `due_date` | `DateTime` | `NOT NULL` | Target release date |
| `additional_info` | `String?` | `@db.Text`, nullable | Optional free-text notes |
| `completed_steps` | `Json` | `NOT NULL` | Array of step IDs e.g. `["step-1","step-3"]` |
| `created_at` | `DateTime` | `@default(now())` | Auto-set on insert |
| `updated_at` | `DateTime` | `@updatedAt` | Auto-updated by Prisma |

> **No `status` column** — status is always computed from `completed_steps.length` vs `PREDEFINED_STEPS.length` (7).

> **No `steps` table** — steps are a static constant in `server/src/constants/steps.ts`. Only completion state is stored per release.

---

## 🔢 Predefined Checklist Steps

| ID | Label |
|---|---|
| `step-1` | All relevant GitHub pull requests have been merged |
| `step-2` | CHANGELOG.md files have been updated |
| `step-3` | All tests are passing |
| `step-4` | Releases in Github created |
| `step-5` | Deployed in demo |
| `step-6` | Tested thoroughly in demo |
| `step-7` | Deployed in production |

---

## 📡 API Specification

Base URL (production): `https://release-checklist-server.vercel.app/api`

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/api/health` | Live DB ping health check | — | `200 { status, database, uptimeSeconds, timestamp }` / `503` |
| `GET` | `/api/steps` | Get 7 predefined steps | — | `200 [{ id, label }]` |
| `GET` | `/api/releases` | List all releases (with computed status) | — | `200 [Release]` |
| `GET` | `/api/releases/:id` | Single release by ID | — | `200 Release` / `404` |
| `POST` | `/api/releases` | Create new release | `{ name, due_date, additional_info? }` | `201 Release` / `400` |
| `PUT` | `/api/releases/:id` | Update name, date, info, or steps | `{ name?, due_date?, additional_info?, completed_steps? }` | `200 Release` / `404` |
| `PATCH` | `/api/releases/:id/steps` | Toggle step completion state | `{ completed_steps: string[] }` | `200 Release` / `404` |
| `DELETE` | `/api/releases/:id` | Delete release | — | `200 { message }` / `404` |

### Health Response Shape

```json
{
  "status": "healthy",
  "database": "connected",
  "uptimeSeconds": 42,
  "timestamp": "2026-07-26T08:12:20.246Z"
}
```

On failure (503):
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "...",
  "timestamp": "2026-07-26T08:12:20.246Z",
  "uptimeSeconds": 8
}
```

---

## ✅ Assignment Feature Checklist

### Must-Have

| Requirement | Status | Implementation |
|---|---|---|
| View list of all releases | ✅ | `GET /api/releases` → `ReleaseList.tsx` |
| Create a new release (name, date, optional info) | ✅ | `POST /api/releases` → `ReleaseForm.tsx` |
| Check / uncheck steps per release | ✅ | `PATCH /api/releases/:id/steps` → step toggles in `ReleaseForm.tsx` |
| Update release additional information | ✅ | `PUT /api/releases/:id` |
| Single GitHub repository | ✅ | `github.com/AnmolDotX/release-checklist` |
| Single Page Application | ✅ | Next.js App Router SPA — no page reloads |
| MySQL database hosted online | ✅ | Aiven MySQL 8 cloud instance |
| Frontend ↔ Backend via API | ✅ | REST JSON API, TanStack Query client |
| Basic styled, usable UX | ✅ | Tailwind CSS, responsive layout, toast notifications |
| README with API + DB schema | ✅ | `README.md` at root |
| Deployed online | ✅ | Vercel (client + server) |

### Nice-to-Have

| Requirement | Status | Implementation |
|---|---|---|
| Delete a release | ✅ | `DELETE /api/releases/:id` + `DeleteModal.tsx` confirmation UI |
| Responsive interface | ✅ | Mobile-first Tailwind CSS, responsive grid |
| GraphQL API | ⏭️ | Not implemented — REST used; GraphQL would be over-engineering for this scope |
| Docker (Dockerfile + docker-compose) | ✅ | `server/Dockerfile` + `server/docker-compose.yml` (MySQL 8.4 + Node) |
| Automated tests | ✅ | 7 integration tests (`server/src/index.test.ts`) — Jest + Supertest |

### Bonus (Beyond Assignment Scope)

| Feature | Implementation |
|---|---|
| Live system health dashboard | `/health` frontend route with real DB ping, latency, uptime metrics |
| Aiven spin-down notice | Warning banner on first load advising of 10-15s cold start |
| DB connection error + retry UI | Error banner with "🔄 Retry Connection Now" button |
| Type-safe throughout | TypeScript strict mode on both client and server |
| Singleton DB connection | `getPrisma()` returns one shared `PrismaClient` instance per cold start |

---

## 🐳 Docker & Local Development

### One-Command Backend Start

```bash
cd server
docker compose up --build
```

Starts:
1. **MySQL 8.4 LTS** container on port `3306` — initializes `release_check` DB from `init.sql`
2. **Express server** container on `http://localhost:8000`

### Frontend

```bash
cd client
pnpm install
pnpm run dev
# Open http://localhost:3000
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `client/.env.local`.

---

## ☁️ Deployment Architecture

```
GitHub (main branch)
    ├── /client  ──→  Vercel Project (Next.js)   ──→  https://release-checklist.vercel.app
    └── /server  ──→  Vercel Project (Serverless)  ──→  https://release-checklist-server.vercel.app
                              │
                              └──[DATABASE_URL]──→  Aiven MySQL 8 (port 20387, SSL)
```

**Vercel Build Process (server)**:
1. `pnpm install` (installs `@prisma/adapter-mariadb`, `mariadb`, `express`, etc.)
2. `prisma generate` (generates Prisma Client TypeScript types)
3. `tsc` (compiles TypeScript → `dist/`)
4. `src/index.ts` exported as Vercel serverless function handler

**Schema Deployment**: Run once manually (or in CI):
```bash
cd server && pnpm exec prisma db push
```

---

## 🔒 SSL Connection Flow (Aiven MySQL)

The `buildMariaDbConfig()` function in `server/src/db/prisma.ts` handles SSL automatically:

```
DATABASE_URL = mysql://avnadmin:PASSWORD@HOST.aivencloud.com:20387/defaultdb
                                                                    ↑
                                                              port ≠ 3306
                                                                    ↓
                                              ssl: { rejectUnauthorized: false }
                                              is injected into mariadb pool config
```

This solves the `pool timeout after 10001ms` failure that occurs when the `mariadb` driver attempts a plain TCP connection to an SSL-only endpoint.
