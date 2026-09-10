# Build context is the repo root (needed to see the pnpm workspace) —
# build with:
#   docker build -f apps/web/Dockerfile .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @omega/web...

FROM deps AS build
COPY apps/web apps/web
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN pnpm --filter @omega/web run build

FROM node:20-alpine
RUN corepack enable
WORKDIR /repo
COPY --from=build /repo ./
WORKDIR /repo/apps/web

EXPOSE 3000
CMD ["pnpm", "start"]
