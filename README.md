# Release Checklist Tool

A functional single-page modern web application designed to help developers manage their release process efficiently.

![Release Checklist Mockup](https://public-swap.s3.us-east-1.amazonaws.com/releasecheck.png)

---

## Features & Architecture

- **Single Page Application (SPA)** built with Next.js & Tailwind CSS matching the provided design mockup.
- **RESTful API Backend** built with Express, TypeScript & **Prisma ORM**.
- **Dynamic Status Computation**:
  - `planned`: 0 steps completed
  - `ongoing`: At least 1 step completed
  - `done`: All steps completed (7/7)
- **Containerized Backend Setup**: Docker Compose configuration located directly inside the `server/` directory (`server/docker-compose.yml`) runs the MySQL database container and the TypeScript backend server together in one command.
- **Serverless & Hosted DB Ready**: Backend exports standard Express app compatible with Vercel serverless functions, Render, or Railway, connecting to any online hosted MySQL DB via connection string (`DATABASE_URL` / `MYSQL_URI`).

---

## Database Schema (Prisma ORM / MySQL)

### Model: `Release` (`releases` table)

| Column Name | Prisma Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `Int` | `@id @default(autoincrement())` | Unique Release identifier |
| `name` | `String` | `NotNull` | Release title / version name |
| `due_date` | `DateTime` | `NotNull` | Release target due date |
| `additional_info` | `String?` | `@db.Text` | Optional remarks or notes |
| `completed_steps` | `Json` | `NotNull` | Array of completed step IDs (e.g. `["step-1", "step-2"]`) |
| `created_at` | `DateTime` | `@default(now())` | Creation timestamp |
| `updated_at` | `DateTime` | `@updatedAt` | Last updated timestamp |

*Note: The status (`planned` | `ongoing` | `done`) is dynamically computed on query time based on the `completed_steps` array length vs total standard steps (7 steps).*

---

## Predefined Steps

1. `step-1`: All relevant GitHub pull requests have been merged
2. `step-2`: CHANGELOG.md files have been updated
3. `step-3`: All tests are passing
4. `step-4`: Releases in Github created
5. `step-5`: Deployed in demo
6. `step-6`: Tested thoroughly in demo
7. `step-7`: Deployed in production

---

## API Endpoints

| Method | Endpoint | Description | Request Body Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint | N/A |
| `GET` | `/api/steps` | Retrieve standard release steps | N/A |
| `GET` | `/api/releases` | Retrieve list of all releases with computed status | N/A |
| `GET` | `/api/releases/:id` | Retrieve single release details | N/A |
| `POST` | `/api/releases` | Create a new release | `{"name": "Version 1.0.0", "due_date": "2025-12-31", "additional_info": "Notes..."}` |
| `PUT` | `/api/releases/:id` | Update release details or completed steps | `{"name": "Version 1.0.0", "completed_steps": ["step-1", "step-2"]}` |
| `PATCH` | `/api/releases/:id/steps` | Toggle/update completed steps array | `{"completed_steps": ["step-1", "step-2", "step-3"]}` |
| `DELETE` | `/api/releases/:id` | Delete a release | N/A |

---

## How to Run Locally

### Option 1: Run Backend with Docker (Recommended One-Command Backend Setup)

Navigate to the `server/` directory and run:

```bash
cd server
docker compose up --build
```

This will automatically:
1. Spin up a MySQL container (`mysql:8.4` LTS) on port `3306` with database `release_check`.
2. Run `init.sql` to initialize schema and seed default data.
3. Build and launch the Express TypeScript backend container on `http://localhost:5000`.

### Option 2: Run Client (Next.js SPA)

In a separate terminal, navigate to `client/` directory:

```bash
cd client
pnpm install
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Automated Tests

To execute backend unit and API integration tests:

```bash
cd server
pnpm install
pnpm test
```

---

## Deployment Instructions

### Deploying the Express Backend (Vercel or Render)

#### Option A: Deploy on Vercel (per [Vercel Express Docs](https://vercel.com/docs/frameworks/backend/express))
1. Push repository to GitHub.
2. Import the `server/` directory into Vercel.
3. Add Environment Variable `DATABASE_URL` pointing to your hosted online MySQL database (e.g. PlanetScale, Aiven, Railway, TiDB).
4. Vercel automatically deploys the Express app via `server/vercel.json`.

#### Option B: Deploy on Render
1. Create a new Web Service on Render and link your GitHub repository.
2. Root Directory: `server`.
3. Build Command: `pnpm install && pnpm run build`.
4. Start Command: `pnpm run start`.
5. Add Environment Variables for your hosted MySQL connection (`DATABASE_URL`).

### Deploying the Next.js Frontend
1. Import `client/` directory into Vercel or Netlify.
2. Add Environment Variable `NEXT_PUBLIC_API_URL` pointing to your deployed backend API URL (e.g. `https://your-backend.vercel.app/api`).
3. Deploy!
