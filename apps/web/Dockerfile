# Build context is the repo root (needed to see the pnpm workspace) —
# build with:
#   docker build -f apps/web/Dockerfile .

FROM node:25-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @omega/web...

FROM deps AS build
COPY apps/web apps/web
# Baked as a placeholder on purpose — see docker-entrypoint.sh. Must be a
# *syntactically valid* URL: Next's prerendering (and better-auth's client,
# constructed at module-eval time) actually parses this with `new URL()`
# during the build, so a non-URL token like "__PLACEHOLDER__" throws
# ERR_INVALID_URL and fails the build outright. `.invalid` is a reserved
# TLD (RFC 2606) guaranteed to never resolve, so at build time this just
# degrades to the already-handled "fetch failed, render dynamically" path.
# Pass a real NEXT_PUBLIC_BACKEND_URL only when building a one-off image for
# yourself (e.g. local `docker compose build`); the published GHCR image
# always uses the placeholder + runtime substitution so the same image works
# for every self-hosted domain.
ARG NEXT_PUBLIC_BACKEND_URL=http://backend.invalid
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

# Same placeholder mechanism as above — the public URL of the site itself,
# used for the sitemap/robots.txt and canonical/Open Graph URLs. Also a
# reserved .invalid domain so it stays a syntactically valid URL at build
# time (see layout.js's `new URL(siteUrl)` for metadataBase).
ARG NEXT_PUBLIC_SITE_URL=http://site.invalid
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm --filter @omega/web run build

FROM node:25-alpine
RUN corepack enable
WORKDIR /repo
COPY --from=build --chown=node:node /repo ./
WORKDIR /repo/apps/web
RUN chmod +x ./docker-entrypoint.sh
USER node

# Set by the release pipeline (docker build --build-arg APP_VERSION=1.2.3);
# defaults to "dev" for local builds.
ARG APP_VERSION=dev
LABEL org.opencontainers.image.version=$APP_VERSION

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "start"]
