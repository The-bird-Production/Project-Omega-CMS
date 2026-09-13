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

# Must match the ARG default in apps/web/Dockerfile exactly.
PLACEHOLDER="http://backend.invalid"

if [ -n "$NEXT_PUBLIC_BACKEND_URL" ]; then
  grep -rl "$PLACEHOLDER" .next 2>/dev/null | while IFS= read -r file; do
    sed -i "s|$PLACEHOLDER|$NEXT_PUBLIC_BACKEND_URL|g" "$file"
  done
fi

exec "$@"
