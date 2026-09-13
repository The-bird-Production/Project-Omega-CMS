#!/bin/sh
# Runs as root (see Dockerfile: no USER before this) so it can fix ownership
# on the bind-mounted directories — they inherit whatever UID owns them on
# the host, which generally isn't this image's `node` user, and plugin/theme
# installs + file uploads need to write into them. Then drops to `node`
# before actually starting the app.
set -e

for dir in Public Themes Plugins Themes_style config; do
  if [ -d "$dir" ]; then
    chown -R node:node "$dir" 2>/dev/null || true
  fi
done

exec su-exec node "$@"
