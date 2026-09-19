# Build context is the repo root (needed to see the pnpm workspace and
# the shared @omega/db package) — build with:
#   docker build -f apps/api/Dockerfile .

FROM node:25-alpine AS base
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

FROM node:25-alpine
RUN apk add --no-cache su-exec
RUN corepack enable
WORKDIR /repo
COPY --from=build --chown=node:node /repo ./
WORKDIR /repo/apps/api
RUN chmod +x ./docker-entrypoint.sh
# Stays root here on purpose: docker-entrypoint.sh fixes bind-mount
# ownership as root, then drops to the `node` user before exec'ing the app.

# Set by the release pipeline (docker build --build-arg APP_VERSION=1.2.3);
# defaults to "dev" for local builds. Read at runtime from GET /system/version
# via the root package.json, this label just makes it visible on the image itself.
ARG APP_VERSION=dev
LABEL org.opencontainers.image.version=$APP_VERSION

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:4000/test || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npx", "tsx", "server.js"]
