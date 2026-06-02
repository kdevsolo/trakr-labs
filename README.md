# Trakr Labs

A pnpm + Turborepo monorepo with a NestJS API and Next.js frontend.

## Stack

| App | Path | Tech |
|-----|------|------|
| **API** | `apps/api` | NestJS, Prisma, PostgreSQL |
| **Web** | `apps/web` | Next.js, Tailwind CSS, shadcn/ui, Zustand, React Query |

## Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL (for the API database)

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Update `DATABASE_URL` in `apps/api/.env` to match your PostgreSQL instance.

### 3. Set up the database

```bash
pnpm db:push
```

Or run migrations:

```bash
pnpm db:migrate
```

### 4. Start development

```bash
pnpm dev
```

This runs both apps in parallel:

- **Web** → [http://localhost:3000](http://localhost:3000)
- **API** → [http://localhost:3001](http://localhost:3001)

## Common commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |

Run a command for a single app:

```bash
pnpm --filter @trakr/api dev
pnpm --filter @trakr/web build
```

---

## How to add a new app

### Option A — NestJS API

```bash
cd apps
pnpm dlx @nestjs/cli new my-service --package-manager pnpm --skip-git --strict
```

Then:

1. Move/rename the folder if needed (e.g. `apps/my-service`).
2. Set `"name": "@trakr/my-service"` in its `package.json`.
3. Add a `"dev"` script (NestJS uses `nest start --watch`).
4. Run `pnpm install` from the repo root.

Turborepo will pick it up automatically via `pnpm-workspace.yaml`.

### Option B — Next.js frontend

```bash
cd apps
pnpm dlx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir --use-pnpm --no-git
```

Then:

1. Set `"name": "@trakr/my-app"` in `package.json`.
2. Run `pnpm install` from the repo root.

### Option C — Any other app

1. Create a folder under `apps/` (e.g. `apps/worker`).
2. Add a `package.json` with a unique name like `@trakr/worker`.
3. Include `dev`, `build`, and `lint` scripts.
4. Run `pnpm install` from the root.

---

## How to add a shared package

Shared code (types, utils, UI) lives in `packages/`.

1. Create a folder, e.g. `packages/shared`:

```bash
mkdir -p packages/shared/src
```

2. Add `packages/shared/package.json`:

```json
{
  "name": "@trakr/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  }
}
```

3. Export from `packages/shared/src/index.ts`.

4. In an app, add it as a dependency:

```json
{
  "dependencies": {
    "@trakr/shared": "workspace:*"
  }
}
```

5. Run `pnpm install` from the root.

---

## How to add a new API feature (NestJS)

1. **Create a module** for the feature:

```bash
cd apps/api
pnpm exec nest g module users
pnpm exec nest g controller users
pnpm exec nest g service users
```

2. **Add a Prisma model** in `apps/api/prisma/schema.prisma`:

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  createdAt DateTime @default(now())
}
```

3. **Apply the schema**:

```bash
pnpm db:migrate
```

4. **Use PrismaService** in your service — it's globally available via `PrismaModule`.

5. **Register the module** in `apps/api/src/app.module.ts` if not auto-registered.

---

## How to add a new frontend feature (Next.js)

### New page

Create a file under `apps/web/src/app/`:

```
apps/web/src/app/dashboard/page.tsx   → /dashboard
```

### New shadcn component

From `apps/web`:

```bash
pnpm dlx shadcn@latest add card input dialog
```

Components are added to `apps/web/src/components/ui/`.

### New Zustand store

Create a file in `apps/web/src/stores/`:

```ts
import { create } from "zustand";

export const useMyStore = create((set) => ({
  value: "",
  setValue: (value: string) => set({ value }),
}));
```

### New React Query hook

Create a fetch function in `apps/web/src/lib/` and use it with `useQuery` or `useMutation`:

```ts
import { useQuery } from "@tanstack/react-query";
import { fetchHealth } from "@/lib/api";

export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: fetchHealth });
}
```

### Call the API

Set `NEXT_PUBLIC_API_URL` in `apps/web/.env` and fetch from `@/lib/api` or feature-specific lib files.

---

## Project structure

```
trakr-labs/
├── apps/
│   ├── api/                 # NestJS backend
│   │   ├── prisma/          # Database schema
│   │   └── src/
│   └── web/                 # Next.js frontend
│       └── src/
│           ├── app/         # Routes & layouts
│           ├── components/  # UI components (incl. shadcn)
│           ├── lib/         # API clients & utilities
│           ├── providers/   # React context providers
│           └── stores/      # Zustand stores
├── packages/                # Shared packages (optional)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```
