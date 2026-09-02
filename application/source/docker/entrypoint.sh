#!/bin/sh
set -e

# Only web/queue/scheduler are intercepted. Anything else — CONTAINER_ROLE
# unset, or explicitly "console" — runs exactly the command that was passed,
# e.g. `docker run --rm <image> cat /app/.env` or
# `docker compose run --rm -e CONTAINER_ROLE=console app php artisan migrate:status`.
# CONTAINER_ROLE is deliberately NOT given a default via Dockerfile ENV —
# a default would hijack ad-hoc `docker run <image> <cmd>` invocations into
# running the web role regardless of what command was passed.
case "$CONTAINER_ROLE" in
web)
    php artisan migrate --force
    php artisan config:cache
    # route:cache is deliberately never run: routes/web.php:17 registers a
    # Closure route ("registration/pending") that Laravel cannot serialize.
    exec frankenphp run --config /etc/caddy/Caddyfile --adapter caddyfile
    ;;
queue)
    exec php artisan queue:work --tries=3 --backoff=5 --sleep=3
    ;;
scheduler)
    exec php artisan schedule:work
    ;;
*)
    exec "$@"
    ;;
esac
