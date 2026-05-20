# Flowmerce Monorepo

This repo uses mixed package managers by design:

- `pnpm` for `frontend` and `shared`
- `bun` for `server`

## What Should Exist in Root

- `node_modules/` at root: expected when using pnpm workspace
- `pnpm-workspace.yaml`: required for pnpm workspace resolution
- `pnpm-lock.yaml`: expected for frontend/shared dependency lock
- `bun.lockb` at root: optional; can exist if Bun was run at root previously

## What Should Not Be Committed

- Runtime DB files: `server/rag.db`, `server/rag.db-shm`, `server/rag.db-wal`
- Any `node_modules/` directory
- Any `.env*` file with secrets

## Local Development

From repo root:

```bash
pnpm run dev:web
pnpm run dev:server
```

Scripts:

- `dev:web` -> runs Vite in `frontend` using pnpm
- `dev:server` -> runs Elysia server in `server` using bun
- `start:server` -> starts server in non-watch mode
- `install:web` -> installs only `shared/frontend` via pnpm
- `build:web` -> builds frontend via pnpm

## Deploy on Oracle Cloud Always Free

Recommended production flow:

1. Build frontend with pnpm
2. Serve API and static assets from Bun server behind Nginx/Caddy
3. Keep persistent SQLite outside repo path

Minimal command flow on VM:

```bash
# 1) frontend/shared deps + build
pnpm run install:web
pnpm run build:web

# 2) server deps
bun --cwd server install --production

# 3) run server (with systemd in production)
DB_PATH=/var/lib/flowmerce/rag.db NODE_ENV=production bun --cwd server run start
```

Notes:

- `DB_PATH` is supported by server config and should point to persistent storage.
- Keep reverse proxy (Nginx/Caddy) on port 80/443 and forward to server port 1422.
