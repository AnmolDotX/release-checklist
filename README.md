# Release Checklist Tool

A functional single-page web application to help developers manage their release process — create releases, track checklist steps, and monitor status automatically.

> 🚀 **Live Demo**: [release-checklist.vercel.app](https://release-checklist.vercel.app)  
> 📡 **API**: [release-checklist-server.vercel.app](https://release-checklist-server.vercel.app)

---

## Features

- **View & manage releases** — list, create, edit, and delete releases
- **Step-based checklists** — 7 predefined steps per release, toggle on/off
- **Auto-computed status** — `planned` → `ongoing` → `done` based on step completions
- **Single Page Application** — built with Next.js, no full page reloads
- **Real-time health monitor** — `/health` dashboard with live DB ping, latency, and uptime
- **Dockerized local dev** — one command spins up MySQL + backend together
- **7 automated integration tests** — Jest + Supertest

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, TanStack Query v5 |
| Backend | Express.js, TypeScript, Prisma 7 ORM |
| Database | MySQL 8 — Aiven cloud (SSL required) |
| Driver Adapter | `@prisma/adapter-mariadb` + `mariadb` npm driver |
| Deployment | Vercel (client + server as serverless functions) |
| Testing | Jest + Supertest |
| Containerization | Docker + Docker Compose (MySQL 8.4 + Node) |

---

## Database Schema

### Table: `releases`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `Int` | `@id @default(autoincrement())` | Auto-increment primary key |
| `name` | `String` | NOT NULL | Release name / version label |
| `due_date` | `DateTime` | NOT NULL | Target release date |
| `additional_info` | `String?` | nullable, `@db.Text` | Optional free-text notes |
| `completed_steps` | `Json` | NOT NULL | Array of completed step IDs e.g. `["step-1","step-3"]` |
| `created_at` | `DateTime` | `@default(now())` | Creation timestamp |
| `updated_at` | `DateTime` | `@updatedAt` | Last-modified timestamp |

> **No `status` column** — status is computed at query time from `completed_steps.length` vs 7 total steps.  
> **No `steps` table** — steps are a static constant shared across all releases.

---

## Predefined Steps

| ID | Step |
|---|---|
| `step-1` | All relevant GitHub pull requests have been merged |
| `step-2` | CHANGELOG.md files have been updated |
| `step-3` | All tests are passing |
| `step-4` | Releases in Github created |
| `step-5` | Deployed in demo |
| `step-6` | Tested thoroughly in demo |
| `step-7` | Deployed in production |

---

## API Endpoints

Base URL (production): `https://release-checklist-server.vercel.app`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `GET` | `/api/health` | Live DB ping health check | — |
| `GET` | `/api/steps` | Get all 7 predefined steps | — |
| `GET` | `/api/releases` | List all releases with computed status | — |
| `GET` | `/api/releases/:id` | Get single release by ID | — |
| `POST` | `/api/releases` | Create a new release | `{ "name": "v1.0", "due_date": "2026-12-31", "additional_info": "..." }` |
| `PUT` | `/api/releases/:id` | Update release name, date, info, or steps | `{ "name": "v1.1", "completed_steps": ["step-1"] }` |
| `PATCH` | `/api/releases/:id/steps` | Update completed steps array | `{ "completed_steps": ["step-1", "step-2"] }` |
| `DELETE` | `/api/releases/:id` | Delete a release | — |

---

## Running Locally

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- [pnpm](https://pnpm.io) (`npm install -g pnpm`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for backend option)

---

### Option 1: Docker (Recommended — One Command)

Spins up MySQL 8.4 + Express backend together:

```bash
cd server
docker compose up --build
```

This starts:
- MySQL container on `localhost:3306` (database: `release_check`)
- Express API server on `http://localhost:8000`

---

### Option 2: Manual Backend Setup

```bash
cd server
pnpm install

# Create a .env file with your database connection:
echo 'DATABASE_URL="mysql://root:rootpassword@localhost:3306/release_check"' > .env

# Push the Prisma schema to create tables:
pnpm exec prisma db push

# Start the dev server:
pnpm run dev
# API is available at http://localhost:8000
```

---

### Frontend

In a separate terminal:

```bash
cd client
pnpm install

# Create .env.local pointing to your backend:
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

pnpm run dev
# Open http://localhost:3000
```

---

## Running Tests

```bash
cd server
pnpm test
```

Runs 7 integration tests covering:
- `GET /api/health` — health check response
- `GET /api/steps` — predefined steps list
- `GET /api/releases` — releases list
- `POST /api/releases` — create release
- `PUT /api/releases/:id` — update steps and computed status
- `DELETE /api/releases/:id` — delete release
- Status computation logic unit test

---

## Deployment

### Backend (Vercel)

1. Push repository to GitHub
2. Import the `server/` directory as a Vercel project
3. Add environment variable: `DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DBNAME`
4. **First deployment only** — push the Prisma schema to create the DB tables:
   ```bash
   cd server
   pnpm exec prisma db push
   ```
5. Vercel auto-deploys via `server/vercel.json`

### Frontend (Vercel)

1. Import the `client/` directory as a separate Vercel project
2. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.vercel.app`
3. Deploy

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `mysql://user:pass@host:port/db` | MySQL connection string |
| `PORT` | ❌ | `8000` | Server port (default: 8000) |
| `NODE_ENV` | ❌ | `production` | Environment mode |

### Client (`client/.env.local`)

| Variable | Required | Example | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://api.vercel.app` | Backend API base URL |

> 💡 **Aiven MySQL SSL Note**: If your `DATABASE_URL` uses a non-3306 port (like Aiven's `20387`), the server **automatically enables SSL** — no additional configuration needed.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed technical breakdown including:
- System architecture diagram (Mermaid)
- Prisma 7 SSL adapter configuration
- Layered backend design patterns
- Full assignment feature compliance audit
- Deployment flow
