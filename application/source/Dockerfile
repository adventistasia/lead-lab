# syntax=docker/dockerfile:1
#
# Build context is application/source/ itself (not the repo root):
#   docker build -t leadlab:local -f Dockerfile .
#
# Three stages: composer deps, frontend assets (needs PHP for Wayfinder's
# route generation, not just Node), then a runtime image that carries only
# vendor/ + built assets + app source. No .env is ever copied into the
# runtime stage — the app receives config entirely via container env vars.

########################################
# Stage 1: PHP dependencies
########################################
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --no-autoloader \
    --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

########################################
# Stage 2: frontend assets
########################################
# @laravel/vite-plugin-wayfinder shells out to `php artisan wayfinder:generate`
# during `vite build` to emit resources/js/{actions,routes,wayfinder} (all
# gitignored) — so this stage needs PHP + a populated vendor/, not just Node.
#
# PHP 8.4, not 8.3: composer.json/tests.yml both claim ^8.3, but
# composer.lock actually resolved several core Symfony packages (console,
# http-foundation, http-kernel, mailer, routing, ...) that require
# >=8.4.1 — vendor/composer/platform_check.php enforces this at runtime
# regardless of what composer.json says. This was never caught because
# tests.yml lives at the wrong nested path and has never actually run
# (see application/development components.md finding F-2).
FROM dunglas/frankenphp:1-php8.4 AS assets
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl ca-certificates gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
COPY --from=vendor /app/vendor ./vendor
# Wayfinder/artisan need a bootstrapped app to introspect routes; this .env
# is throwaway (build-time only) and is removed before the runtime stage
# copies anything out of this one.
RUN cp .env.example .env && php artisan key:generate --force
RUN npm run build
RUN rm -f .env

########################################
# Stage 3: runtime
########################################
FROM dunglas/frankenphp:1-php8.4 AS runtime
RUN install-php-extensions pdo_mysql pcntl opcache

WORKDIR /app
COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=assets /app/public/build ./public/build
COPY --from=assets /app/resources/js/actions ./resources/js/actions
COPY --from=assets /app/resources/js/routes ./resources/js/routes
COPY --from=assets /app/resources/js/wayfinder ./resources/js/wayfinder

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/php.ini /usr/local/etc/php/conf.d/99-lead-lab.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && mkdir -p storage/framework/cache storage/framework/sessions \
       storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# No default CONTAINER_ROLE here on purpose — see docker/entrypoint.sh.
# compose.yaml sets it explicitly for each of the three real services.
EXPOSE 8080

# Only meaningful for the web role (nothing else serves HTTP on :8080);
# compose.yaml disables this for queue/scheduler and has them wait on it
# instead, so they don't race the web container's `migrate --force` on a
# cold start and query tables that don't exist yet.
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
    CMD php -r "exit(@file_get_contents('http://127.0.0.1:8080/up') === false ? 1 : 0);"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
