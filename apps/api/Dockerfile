# Build context is the repo root (needed to see the pnpm workspace and
# the shared @omega/db package) — build with:
#   docker build -f apps/api/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/db/package.json packages/db/package.json
RUN pnpm install --frozen-lockfile --filter @omega/api... --filter @omega/db

FROM deps AS build
COPY packages/db packages/db
COPY apps/api apps/api
RUN pnpm --filter @omega/db run generate

FROM node:22-alpine
RUN corepack enable
WORKDIR /repo
COPY --from=build /repo ./
WORKDIR /repo/apps/api

EXPOSE 4000
CMD ["npx", "tsx", "server.js"]
