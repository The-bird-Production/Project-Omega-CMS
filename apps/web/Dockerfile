# Build context is the repo root (needed to see the pnpm workspace) —
# build with:
#   docker build -f apps/web/Dockerfile .

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @omega/web...

FROM deps AS build
COPY apps/web apps/web
# This build's own output is thrown away — see scripts/supervisor.mjs,
# which rebuilds for real at container startup (and again whenever a
# theme/plugin install requests it) using whatever NEXT_PUBLIC_* values
# are actually set at that point, since a theme/plugin's files only exist
# on disk from then on (see lib/pageTemplates/render.js's comment on why
# a build-time-only bundle can never see them). Building here too is
# still worth it as a CI-time sanity check that the app builds at all,
# before ever publishing the image — hence still needing a syntactically
# valid URL (Next's prerendering parses this with `new URL()` at build
# time) even though the value itself is never actually used to serve
# anything. `.invalid` is a reserved TLD (RFC 2606) guaranteed to never
# resolve, degrading to the already-handled "fetch failed" path.
ARG NEXT_PUBLIC_BACKEND_URL=http://backend.invalid
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_SITE_URL=http://site.invalid
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm --filter @omega/web run build

FROM node:22-alpine
RUN corepack enable
WORKDIR /repo
COPY --from=build --chown=node:node /repo ./
WORKDIR /repo/apps/web
USER node

# Set by the release pipeline (docker build --build-arg APP_VERSION=1.2.3);
# defaults to "dev" for local builds.
ARG APP_VERSION=dev
LABEL org.opencontainers.image.version=$APP_VERSION

EXPOSE 3000
# start-period is long because scripts/supervisor.mjs runs a full `next
# build` before the server ever starts listening — a plain restart, not
# just a first boot, since it rebuilds every time (see that file).
HEALTHCHECK --interval=30s --timeout=5s --start-period=5m --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1
CMD ["node", "scripts/supervisor.mjs"]
