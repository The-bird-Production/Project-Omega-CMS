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

# DATABASE_URL is derived here, from MYSQL_PASSWORD, rather than being
# passed as-is via docker-compose's environment: — a MySQL password can
# contain characters (@, :, /, #, %, ...) that are valid for MySQL but
# break a mysql:// connection URL if pasted in unescaped, which is what
# building it as a plain compose string used to do.
#
# Exported here (not just written to a file) so it reaches every step of
# the command this script execs into below, including
# `pnpm --filter @omega/db run migrate:deploy:safe`/`generate`, which run
# with packages/db as their cwd — a .env file alone wouldn't be found
# from there. su-exec (unlike su) doesn't reset the environment, so the
# export survives the switch to the node user.
#
# ALSO written to a real .env file, because that exported value only
# lives in this container's main process tree — a separate one-off
# command like `docker compose exec omega-server pnpm --filter
# @omega/api run manage-users ...` starts fresh from the container's
# original environment and won't see it otherwise. manage-users.mts
# loads this file itself on startup.
if [ -n "$MYSQL_PASSWORD" ]; then
  encoded_password=$(node -e 'process.stdout.write(encodeURIComponent(process.env.MYSQL_PASSWORD))')
  export DATABASE_URL="mysql://user:${encoded_password}@omega-db:3306/omega"
  echo "DATABASE_URL=${DATABASE_URL}" > .env
  chown node:node .env 2>/dev/null || true
fi

exec su-exec node "$@"
