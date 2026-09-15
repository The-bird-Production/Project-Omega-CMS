#!/bin/sh
# NEXT_PUBLIC_* values are inlined into the built JS at `next build` time, so a
# single prebuilt image can't have the "real" backend URL baked in — every
# self-hosted instance has a different domain. Instead the image is built with
# a placeholder, and this entrypoint swaps it for the real runtime value
# (from NEXT_PUBLIC_BACKEND_URL) across the built output before starting the
# server. This is the standard workaround for runtime-configurable
# NEXT_PUBLIC_ vars in a Docker image (Next.js has no other way to do it
# without a custom server or `output: "standalone"` + a JS entrypoint).
set -e

# Must match the ARG defaults in apps/web/Dockerfile exactly.
BACKEND_PLACEHOLDER="http://backend.invalid"
SITE_PLACEHOLDER="http://site.invalid"

if [ -n "$NEXT_PUBLIC_BACKEND_URL" ]; then
  grep -rl "$BACKEND_PLACEHOLDER" .next 2>/dev/null | while IFS= read -r file; do
    sed -i "s|$BACKEND_PLACEHOLDER|$NEXT_PUBLIC_BACKEND_URL|g" "$file"
  done
fi

if [ -n "$NEXT_PUBLIC_SITE_URL" ]; then
  grep -rl "$SITE_PLACEHOLDER" .next 2>/dev/null | while IFS= read -r file; do
    sed -i "s|$SITE_PLACEHOLDER|$NEXT_PUBLIC_SITE_URL|g" "$file"
  done
fi

exec "$@"
