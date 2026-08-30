# LeadLab Deployment Method Research

**App:** Laravel 13, PHP 8.3, Inertia.js + React + TypeScript, Tailwind, Vite
**Infra on hand:** Proxmox cluster (on-prem), Microsoft 365 tenant, Synology NAS
**Domains:** `leadlab.ssd.org`, `leadlab.adventist.asia` (both owned)
**Constraints:** Docker/containers, SQLite in production, GitHub as git host, 50-200 users / medium concurrency, internal + internet-facing, < $50/mo additional budget
**Date:** 2026-08-30

---

## TL;DR

| Rank | Option | Added $/mo | Setup effort | Best for |
|------|--------|-----------|--------------|----------|
| **1 (top pick)** | **Coolify on a Proxmox VM** | **$0** (optional ~$5-12 offsite backup) | Low-medium (1-2 days) | Small team wants push-to-deploy + a UI, keeps everything on-prem |
| 2 | GitHub Actions -> GHCR -> SSH to Proxmox VM (optionally via Kamal 2) | $0 | Medium (2-4 days) | Team with DevOps confidence that wants zero extra platform, full control |
| 3 | CapRover on a Proxmox VM | $0 | Medium | Lower-RAM host, comfortable with Docker Swarm quirks |
| 4 | Laravel Forge / Ploi + external VPS | $9-39 (panel) + $6-24 (VPS) | Low | Wants to offload OS/server patching, willing to run off-prem |

**Recommendation:** Coolify on a dedicated Proxmox VM, deploying from GitHub on push to `main`, TLS via Cloudflare Tunnel (fallback: built-in Traefik + Let's Encrypt DNS-01), SQLite on a named Docker volume with WAL mode, and Litestream streaming backups to the Synology NAS + a weekly copy to M365/SharePoint. Total new spend: $0-12/mo.

---

## Cross-cutting decisions (apply to every option)

### The SQLite single-node constraint

SQLite is a single file on a single filesystem. Every process that writes the DB - the web/php-fpm container, the queue worker, the scheduler, Horizon if used, `artisan` one-offs during deploy - **must run on the same host and mount the same volume**. This means:

- No multi-node Docker Swarm spreading, no CapRover/Coolify "scale across servers" for the app tier. Pin the app + workers to **one Proxmox node**.
- Horizontal scaling of the PHP tier is limited to multiple php-fpm processes/containers on that one node (fine for 50-200 users).
- HA is achieved by Proxmox VM replication/HA failover (whole-VM), not app-level clustering. Accept a few minutes RTO on node failure, or use ZFS replication + Litestream for a warm standby.

For 50-200 users with "medium concurrency" and a read-heavy Inertia app, one node with WAL-mode SQLite on NVMe is comfortably enough. Benchmarks and production reports (Laravel News, freek.dev, Deploynix) put the ceiling far above this workload.

### SQLite production configuration

`config/database.php` -> `connections.sqlite`:

```php
'sqlite' => [
    'driver'   => 'sqlite',
    'database' => env('DB_DATABASE', '/var/www/db/database.sqlite'),
    'foreign_key_constraints' => true,
    // Laravel 12+ accepts busy_timeout / journal_mode / synchronous directly:
    'busy_timeout'  => 5000,      // wait up to 5s on a write lock instead of erroring
    'journal_mode'  => 'WAL',     // readers never block writers
    'synchronous'   => 'NORMAL',  // safe with WAL, much faster than FULL
    'cache_size'    => -20000,    // ~20 MB page cache
],
```

If on an older config style, set the same PRAGMAs via a `connected` listener or an app service provider. Notes:

- **WAL file growth:** with an always-active reader the `-wal` file can grow unbounded. A read-heavy web app with periodic idle windows checkpoints itself. If workers keep a connection pinned, run a periodic `PRAGMA wal_checkpoint(TRUNCATE);` (scheduler task every 5-10 min) as insurance.
- **Volume must hold three files:** `database.sqlite`, `database.sqlite-wal`, `database.sqlite-shm`. Mount the **directory**, not the single file, so WAL/SHM live beside it and survive restarts.
- **Never** put the SQLite file on an NFS/CIFS mount from the Synology - SQLite locking over network filesystems is unsafe. NAS is for backups only.
- Use a separate SQLite file (or Redis) for cache/queue so cache churn doesn't contend with app-data writes. Recommended: a tiny Redis container for cache + session + queue, keeping the main SQLite file for domain data only.

### SQLite backup integration

Layered approach:

1. **Continuous / point-in-time:** [Litestream](https://litestream.io) sidecar container. Streams WAL pages to an S3-compatible target every few seconds. Targets that fit the infra:
   - Synology as S3: enable the Synology **MinIO** package or **ABS/S3 via Container Manager**, point Litestream at `http://nas.internal:9000`.
   - Or Litestream `file://` replica onto a **locally mounted NFS export** from the Synology (Litestream reads/writes the replica locally; the DB itself stays on the Docker volume). Simpler, no MinIO.
2. **Nightly snapshot:** scheduler task runs `sqlite3 /var/www/db/database.sqlite ".backup '/backups/leadlab-$(date +%F).sqlite'"` (or `VACUUM INTO` if write volume is high), written to a NAS-backed `/backups` mount, retained 30 days.
3. **Offsite / compliance:** `rclone` weekly push of the nightly snapshots to the **M365 SharePoint/OneDrive** tenant (already owned, $0 extra). Or a $5-6/mo Backblaze B2 / Cloudflare R2 bucket if an S3 target is preferred (well within budget).
4. Test restore quarterly: `litestream restore -o /tmp/restore.sqlite s3://.../leadlab`.

### SSL/TLS termination

Two domains, both internal and internet-facing. Three viable patterns:

| Pattern | Inbound ports | DNS requirement | Notes |
|---------|--------------|-----------------|-------|
| **Cloudflare Tunnel** (`cloudflared` container) | **none** (outbound QUIC only) | `leadlab.*` must resolve via Cloudflare - either move the zone, or `CNAME leadlab.ssd.org -> <uuid>.cfargotunnel.com` if the parent-domain admins allow a subdomain CNAME | Free. TLS terminates at Cloudflare edge; origin sees clean HTTP on the Docker network. Also gives WAF, DDoS, and Zero-Trust access policies for the "internal" audience. Best fit. |
| **Traefik / Caddy + Let's Encrypt** | 80/443 to the VM's public IP | `A`/`AAAA` record for each host; or delegate `_acme-challenge` CNAME for **DNS-01** (works even if 80/443 are internal-only) | Caddy = automatic HTTPS, ~2 lines of config. Traefik = Docker-label service discovery, better when Coolify/containers churn. Coolify ships Traefik and does this for you. |
| **Corp reverse proxy / existing LB** | per corp policy | corp-managed | If Adventist/SSD IT already fronts on-prem apps with an F5/NGINX/APIM, publish LeadLab as another backend and let them own certs. Least new surface, most coordination. |

Recommendation: **Cloudflare Tunnel** if the domain team will allow the CNAME (no firewall changes, adds security controls, $0). Otherwise Coolify's built-in Traefik with DNS-01 via Cloudflare or the org DNS provider.

### Proxmox placement

Industry-standard 2026 guidance (Proxmox forums, multiple homelab/prod writeups): **run Docker inside a dedicated VM**, not on the Proxmox host and not nested in an unprivileged LXC (UID-mapping and cgroup-v2 friction with Docker). PVE 8.3 added native OCI image support in LXC, but the "boring, supportable" answer for a Compose stack of 6-10 containers is still a VM.

- **VM spec:** Debian 12/13, 2-4 vCPU, 4 GB RAM (6-8 GB if running Coolify + Redis + build-on-host), 40-60 GB **NVMe-backed** virtual disk (SQLite loves fast fsync), on one node with Proxmox HA enabled.
- Overhead vs bare LXC is ~5-10% CPU, imperceptible on modern hardware.
- Snapshot the VM before each deploy for instant rollback (in addition to image-tag rollback).
- Give the VM a second virtual disk for the `/var/lib/docker/volumes` mount so DB volume snapshots are independent.

### The canonical Docker Compose stack

All four options converge on roughly this service set. Differences are *who writes and runs it* (you, GitHub Actions, or the PaaS UI).

```yaml
# compose.yaml  -- pinned to a single Proxmox VM
x-app-image: &app-image ghcr.io/ssd-org/leadlab:${IMAGE_TAG:-latest}

services:
  # --- HTTP + PHP in one container via FrankenPHP (Caddy + PHP, worker mode) ---
  app:
    image: *app-image
    restart: unless-stopped
    environment:
      APP_ENV: production
      APP_KEY: ${APP_KEY}
      OCTANE_SERVER: frankenphp          # or drop Octane and use php-fpm (see below)
      DB_CONNECTION: sqlite
      DB_DATABASE: /var/www/db/database.sqlite
      REDIS_HOST: redis
      CACHE_STORE: redis
      SESSION_DRIVER: redis
      QUEUE_CONNECTION: redis
    volumes:
      - leadlab-db:/var/www/db                    # database.sqlite + -wal + -shm
      - leadlab-storage:/var/www/html/storage/app # user uploads, public disk
    depends_on: [redis]
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:8000/up"]
      interval: 10s
      timeout: 3s
      retries: 5
    # expose 8000 to the reverse proxy only, not the host

  # --- Queue worker: same image, different command ---
  queue:
    image: *app-image
    restart: unless-stopped
    command: php artisan queue:work --queue=default --tries=3 --max-time=3600 --sleep=1
    environment: *app-env   # (anchor the app env block in real file)
    volumes:
      - leadlab-db:/var/www/db
      - leadlab-storage:/var/www/html/storage/app
    depends_on: [redis]
    deploy:
      replicas: 2           # 2 workers is plenty for 50-200 users

  # --- Scheduler: runs artisan schedule:run every minute ---
  scheduler:
    image: *app-image
    restart: unless-stopped
    command: php artisan schedule:work   # long-running; no host cron needed
    volumes:
      - leadlab-db:/var/www/db
      - leadlab-storage:/var/www/html/storage/app
    depends_on: [redis]

  # --- Redis: cache / session / queue (keeps churn off the SQLite file) ---
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --save "" --appendonly no --maxmemory 256mb --maxmemory-policy allkeys-lru
    # ephemeral by design; no volume

  # --- Continuous SQLite backup ---
  litestream:
    image: litestream/litestream:0.3
    restart: unless-stopped
    command: replicate
    volumes:
      - leadlab-db:/var/www/db
      - ./litestream.yml:/etc/litestream.yml:ro
      - nas-backups:/backups          # NFS export from Synology, snapshots land here too
    environment:
      LITESTREAM_ACCESS_KEY_ID: ${B2_KEY_ID:-}
      LITESTREAM_SECRET_ACCESS_KEY: ${B2_APP_KEY:-}

  # --- Public ingress: Cloudflare Tunnel (no inbound ports) ---
  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel --no-autoupdate run
    environment:
      TUNNEL_TOKEN: ${CF_TUNNEL_TOKEN}
    depends_on: [app]

volumes:
  leadlab-db:
  leadlab-storage:
  nas-backups:
    driver: local
    driver_opts:
      type: nfs
      o: "addr=nas.internal,nfsvers=4,rw"
      device: ":/volume1/leadlab-backups"
```

**Alternative to FrankenPHP/Octane** if you prefer the classic split (more moving parts, more familiar):

```yaml
  web:
    image: nginx:1.27-alpine
    restart: unless-stopped
    volumes:
      - ./deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - leadlab-public:/var/www/html/public:ro   # built assets baked into image, copied out
    depends_on: [php]

  php:
    image: *app-image            # php-fpm entrypoint
    restart: unless-stopped
    volumes:
      - leadlab-db:/var/www/db
      - leadlab-storage:/var/www/html/storage/app
    depends_on: [redis]
```

For this app I recommend **FrankenPHP** (single container, HTTP/2+3, built-in worker mode gives a real throughput win for Inertia SSR-less responses, one less service to reason about). php-fpm+nginx is the safe default if the team has never run Octane.

### The multi-stage Dockerfile (shared by all options)

```dockerfile
# ---------- 1. Vite / Inertia asset build ----------
FROM node:22-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.ts tsconfig.json ./
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY artisan composer.json composer.lock ./
COPY app ./app
COPY routes ./routes
RUN npm run build            # -> public/build/

# ---------- 2. PHP dependencies ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --no-interaction --optimize-autoloader

# ---------- 3. Runtime ----------
FROM dunglas/frankenphp:1-php8.3-alpine AS runtime
# or: FROM php:8.3-fpm-alpine AS runtime
WORKDIR /var/www/html
RUN install-php-extensions pdo_sqlite pcntl opcache redis intl zip gd
COPY --from=vendor /app/vendor ./vendor
COPY . .
COPY --from=assets /app/public/build ./public/build
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache \
 && mkdir -p /var/www/db && chown -R www-data:www-data storage bootstrap/cache /var/www/db
EXPOSE 8000
HEALTHCHECK CMD curl -fsS http://localhost:8000/up || exit 1
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
```

Final image ~180-220 MB (vs 600 MB+ if Node/Composer stay in the runtime).

**Deploy-time DB migration:** run `php artisan migrate --force` as a one-shot before swapping traffic. In Compose: `docker compose run --rm app php artisan migrate --force`. In Coolify: a "pre-deployment command". With Kamal: a `pre-deploy` hook. Because migrations touch the shared SQLite file, run them once, not per-replica.

---

## Option 1 - Docker on Proxmox (plain Compose, manual/simple deploy)

### How CI/CD works

Minimal version: GitHub Actions builds and pushes the image to GHCR on push to `main`; a human (or a cron `git pull` on the VM) runs `docker compose pull && docker compose up -d`. Realistically nobody wants the manual step, so this collapses into Option 2. Treat Option 1 as "the runtime target" and Option 2 as "how you actually ship to it."

Pure-manual flow (no Actions at all):
1. `ssh leadlab-vm`
2. `cd /opt/leadlab && git pull`
3. `docker compose build` (build on the VM - needs Node + Composer layers, ~4 GB RAM during build)
4. `docker compose run --rm app php artisan migrate --force`
5. `docker compose up -d`

### Fit with Proxmox

Perfect - it *is* the Proxmox infra. One Debian VM, Docker Engine + Compose plugin, the `compose.yaml` above, `/opt/leadlab` for the repo, named volumes for DB/storage. Proxmox handles VM backup, snapshot, HA.

### Docker Compose setup

Exactly the canonical stack above. Building on the VM is the main wrinkle: it couples deploys to the VM having build toolchain RAM and a warm layer cache, and a broken build can leave you mid-deploy. Prefer pull-based (Option 2).

### SQLite considerations

- `leadlab-db` named volume on the NVMe-backed VM disk.
- WAL config as above.
- Litestream sidecar + NFS `nas-backups` volume for snapshots.
- Rollback = `docker compose down`, `zfs rollback` / Proxmox snapshot restore of the DB disk, redeploy prior image tag.

### SSL/TLS

Add Caddy or Traefik to the Compose file, or `cloudflared`. You own every line, including renewal monitoring.

### Complexity

- **Setup:** low (half a day) if manual; but manual deploys rot fast.
- **Maintenance:** you own OS patching, Docker upgrades, the proxy, cert renewal alarms, the deploy runbook, and onboarding the next admin to all of it. No UI, no audit log, no one-click rollback.

### Cost

$0 added. Uses existing Proxmox capacity.

### Fit score: 3.0 / 5

Great infra fit and $0, but the "no automation, no UI, tribal-knowledge runbook" reality is a poor match for a 50-200 user internet-facing app maintained by a small team. Only choose this if it's explicitly a stepping stone to Option 2.

---

## Option 2 - GitHub Actions CI/CD -> Proxmox via SSH/Docker (optionally Kamal 2)

### How CI/CD works

`.github/workflows/deploy.yml`:

```yaml
name: deploy
on:
  push: { branches: [main] }

jobs:
  build:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/ssd-org/leadlab:${{ github.sha }}
            ghcr.io/ssd-org/leadlab:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with: { php-version: '8.3' }
      - run: composer install --no-interaction --prefer-dist
      - run: cp .env.ci .env && php artisan key:generate
      - run: php artisan test        # SQLite :memory:
      - run: npm ci && npm run build && npx tsc --noEmit

  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Ship over SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: deploy
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /opt/leadlab
            echo "IMAGE_TAG=${{ github.sha }}" > .env.deploy
            docker compose --env-file .env --env-file .env.deploy pull
            docker compose --env-file .env --env-file .env.deploy run --rm app php artisan migrate --force
            docker compose --env-file .env --env-file .env.deploy up -d --remove-orphans
            docker image prune -f
```

Trigger: push to `main`. Build: multi-stage image in Actions (with GHA layer cache), no build load on the VM. Registry: **GHCR** - free for public, generous free private allotment, native `GITHUB_TOKEN` auth. Deploy: SSH into the VM, `docker compose pull && up -d`. Rollback: re-run the job pinned to a previous SHA, or `IMAGE_TAG=<old-sha> docker compose up -d` on the box.

Harden the VM's public exposure: the runner needs SSH. Either restrict SSH to GitHub's Actions IP ranges (they publish them), put the VM's SSH behind Tailscale/WireGuard and run a **self-hosted runner** inside the network (nice bonus: runner can also be a Proxmox LXC), or use a Cloudflare Tunnel for SSH too.

### Kamal 2 variant (recommended refinement)

[Kamal 2](https://kamal-deploy.org) productizes exactly this pattern and is the deploy tool the Laravel/Rails world has standardised on in 2026. `deploy.yml`:

```yaml
service: leadlab
image: ssd-org/leadlab
registry:
  server: ghcr.io
  username: ssd-ci
  password:
    - KAMAL_REGISTRY_PASSWORD
servers:
  web:
    hosts: [10.10.0.20]           # single Proxmox VM
    labels: { traefik.http.routers.leadlab.rule: Host(`leadlab.ssd.org`) }
  workers:
    hosts: [10.10.0.20]
    cmd: php artisan queue:work --tries=3 --max-time=3600
proxy:
  ssl: true                        # kamal-proxy gets Let's Encrypt certs
  host: leadlab.ssd.org
  healthcheck: { path: /up, interval: 3, timeout: 2 }
accessories:
  redis:
    image: redis:7-alpine
    host: 10.10.0.20
    cmd: redis-server --save "" --maxmemory 256mb
volumes:
  - "leadlab_db:/var/www/db"
  - "leadlab_storage:/var/www/html/storage/app"
boot:
  limit: 1                         # migrate/boot one instance first
stop_wait_seconds: 15             # drain in-flight requests before SIGKILL
```

Zero-downtime: `kamal-proxy` polls `/up` (Laravel ships this route), waits for healthy, swaps traffic, drains the old container over `stop_wait_seconds`. GitHub Actions just runs `kamal deploy`. You still add Litestream + cloudflared as accessories or a side Compose file. Kamal does **not** natively love SQLite volumes across releases - use a named volume (as above) and a `pre-deploy` hook for `migrate --force`.

### Fit with Proxmox

Identical target to Option 1 (one Debian VM). The only addition is a `deploy` user + SSH key, or a self-hosted runner container. Everything stays on-prem; GitHub only builds and holds the image.

### Docker Compose setup

Canonical stack, but **pull-only** on the VM (no build stage shipped). `compose.yaml` references `ghcr.io/ssd-org/leadlab:${IMAGE_TAG}`. Add `cloudflared` + `litestream` services. If using Kamal, Compose is replaced by `deploy.yml` + accessories.

### SQLite considerations

- Named volume `leadlab_db`, survives image swaps.
- `migrate --force` as a one-shot in the deploy script (not per replica).
- WAL + `busy_timeout` as above.
- Litestream accessory/sidecar to Synology-S3 or NFS; nightly `.backup` via scheduler; weekly `rclone` to SharePoint.
- Rollback: previous image tag + Proxmox DB-disk snapshot if a migration was destructive. Keep migrations additive/reversible.

### SSL/TLS

`cloudflared` (no inbound), or `kamal-proxy`/Traefik/Caddy with Let's Encrypt. Kamal's built-in proxy does certs with near-zero config.

### Complexity

- **Setup:** medium. 2-4 days: Dockerfile, workflow, GHCR, VM user/keys or self-hosted runner, proxy, secrets in GitHub, first cutover. Kamal shaves ~1 day off the proxy/zero-downtime part.
- **Maintenance:** you still own OS + Docker upgrades on the VM, but deploys are now reproducible, logged in Actions, and rollback is a re-run. No web UI, but the pipeline *is* the runbook. Good fit for a team with one confident ops person.

### Cost

$0. GHCR free tier covers a private image at this scale. Actions minutes: a Laravel+Vite build is ~3-6 min; free tier (2,000 min/mo private, unlimited public) is ample.

### Fit score: 4.3 / 5

Excellent budget and infra fit, fully automated, auditable, reproducible. Loses half a point vs Coolify only on "no UI / all-code operations" and the SSH-exposure hardening chore. **Strong second choice, and the right choice if the team is DevOps-comfortable and wants no extra platform to patch.**

---

## Option 3 - Laravel Forge / Ploi (managed panel + external VPS)

### Pricing (verified Aug 2026)

**Laravel Forge** ([forge.laravel.com](https://forge.laravel.com), pricing via LaraCopilot / Benjamin Crozat):

| Plan | $/mo | Notes |
|------|------|-------|
| Hobby | $12 | 1 external (bring-your-own-cloud) server, unlimited sites |
| Growth | $19 | unlimited external servers, 5% Laravel VPS discount |
| Business | $39 | + automated DB backups, server monitoring, team "Circles", 15% VPS discount |

Annual billing ~17% off. **Forge is a control panel, not hosting** - you pay the VPS provider separately.

**Ploi** ([ploi.io](https://ploi.io), pricing via SpotSaaS / Toolradar):

| Plan | $/mo | Notes |
|------|------|-------|
| Free | $0 | 1 server |
| Basic | $9 | |
| Pro | $14.40 | |
| Unlimited | $32.40 | unlimited servers + sites |

### How CI/CD works

Both follow the same model:
1. Connect the GitHub repo in the panel; it installs a deploy key + push webhook.
2. Push to `main` -> webhook -> panel runs a **deploy script** on the VPS over its own SSH connection:
   ```bash
   cd /home/forge/leadlab
   git pull origin main
   composer install --no-dev --optimize-autoloader
   npm ci && npm run build
   php artisan migrate --force
   php artisan config:cache route:cache view:cache
   ( flock -w 10 9 || exit 1; sudo -S systemctl reload php8.3-fpm ) 9>/tmp/fpmlock
   php artisan queue:restart
   ```
3. Optional "deploy on push" toggle, Slack/Discord notifications, "quick deploy".

This is **not container-based by default** - Forge/Ploi provision a traditional LEMP box (nginx + php-fpm + systemd) and deploy source, not images. You *can* point them at a Docker host and make the deploy script do `docker compose` calls, but you're fighting the tool's grain and losing most of its value (their nginx/php-fpm/Let's Encrypt/queue UI manage the host, not your containers). Forge's newer first-class Docker support is still lighter than a real PaaS.

### Fit with Proxmox

**Poor.** Forge/Ploi expect a cloud VPS they can API-provision (DigitalOcean, Hetzner, Vultr, AWS) or a plain Ubuntu box reachable over SSH from their control plane. Options:

- **Off-prem VPS** (defeats "use existing Proxmox", adds $6-24/mo): Hetzner CX22 ~€4.5/mo, DO 2GB ~$12/mo. Then Forge Hobby $12 + Hetzner ~$5 = **~$17/mo**, or Ploi Free/$9 + Hetzner ~$5 = **$5-14/mo**. Both under budget.
- **Point Forge/Ploi at a Proxmox VM** as a "custom server": the VM needs a public IP (or tunnel) reachable from Forge's control plane over SSH, and you hand Forge root-ish access to an on-prem box - a security/compliance conversation with Adventist/SSD IT. Doable, unusual, and you lose provider-integrated backups/monitoring.

### Docker Compose setup

Not applicable in the default flow. If forced into containers, you'd hand-write the same canonical stack and call it from the deploy script - at which point Option 2 is cleaner and free.

### SQLite considerations

- Forge/Ploi assume MySQL/Postgres; SQLite is "just a file in the project dir".
- Put `database.sqlite` **outside** the release path (e.g. `/home/forge/leadlab-storage/database.sqlite`) so `git pull` / atomic-release symlink swaps don't wipe it. Symlink or `DB_DATABASE` absolute path.
- Forge **Business ($39)** adds automated DB backups - but oriented at MySQL dumps; for SQLite you'd script your own `.backup` + off-box copy anyway.
- WAL config identical. Litestream would run as a systemd service you install manually (no container).
- Backups: your own cron -> Synology (needs a path in from the VPS) or -> B2/R2 -> good; or -> M365 via rclone.

### SSL/TLS

Best part of this option: **one-click Let's Encrypt** per site in the panel, auto-renew, HTTP/2, HSTS toggles. Or Cloudflare in front with an origin cert. Zero fuss.

### Complexity

- **Setup:** low. Point at repo, pick server, toggle deploy-on-push, click SSL. 2-4 hours to first deploy on a fresh VPS.
- **Maintenance:** panel nags for OS updates, shows queue/scheduler status, has a UI for env vars, cron, workers, log tail. Genuinely less day-to-day toil - *if* you accept a non-container, off-prem box. On an on-prem custom server you keep most of the OS burden.

### Cost

- Forge Hobby + Hetzner VPS: **~$17/mo**. Ploi + Hetzner: **~$5-14/mo**. Both < $50.
- Add ~$5/mo if you want B2/R2 for offsite SQLite backups.

### Fit score: 2.6 / 5

Cheapest path to a *managed* experience and the best SSL story, but it fights three stated constraints at once: **container deployment** (not its model), **use the existing Proxmox cluster** (wants a cloud VPS), and keeping everything on-prem/internal. Choose only if the team explicitly wants to stop managing servers and is fine running LeadLab on a small off-prem VPS with source-based (non-Docker) deploys.

---

## Option 4 - Coolify / CapRover (self-hosted PaaS on Proxmox)

### Coolify ([coolify.io](https://coolify.io))

Open-source (Apache-2.0), **free self-hosted**, no per-seat or per-app license. Optional Coolify Cloud ($5-ish/mo) only if you want *them* to host the control plane - not needed here. ~57k GitHub stars, very active in 2026, and it's itself a Laravel app so the project understands this stack.

#### How CI/CD works

1. Install: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash` on the VM (~3 min on clean Debian/Ubuntu).
2. In the UI: connect GitHub via a **GitHub App** (fine-grained, gives PR/commit status + auto-deploy webhooks) or a deploy key.
3. Create a resource from the repo. Build pack options:
   - **Dockerfile** (recommended - use the multi-stage file above), or
   - **Docker Compose** (point at `compose.yaml`; Coolify orchestrates the whole stack, injects env, manages the Traefik labels), or
   - Nixpacks (auto-detects Laravel; fine for a quick start, less control).
4. Push to `main` -> GitHub webhook -> Coolify pulls, builds **on the server** (or on a designated build server), health-checks the new container, swaps traffic via its bundled **Traefik**, keeps the old one briefly for rollback. Community has zero-downtime Laravel deploy recipes dialed in (Matt Stein, others).
5. UI gives: env-var editor (with secrets), one-click rollback to any prior deployment, build/deploy logs, container terminal, resource graphs, scheduled tasks (cron), "execute command" for `artisan` one-offs, pre/post-deploy command hooks (put `migrate --force` here).

#### Fit with Proxmox

**Excellent.** Coolify *is* "a nice UI over Docker Compose on a box you own." Install it on one Proxmox VM (it can also manage *other* Proxmox VMs/hosts as additional "servers" over SSH from the one panel - handy if LeadLab later shares the panel with other internal apps). Nothing leaves the network except the outbound GitHub webhook/registry pull and (optionally) Cloudflare Tunnel.

- **VM spec:** 2 vCPU / **4 GB RAM** / 40 GB disk minimum; go **6-8 GB** since Coolify + build + app + Redis + Litestream + Postgres-for-Coolify-itself add up. This is the one real cost of Coolify vs raw Compose - the control plane isn't free RAM-wise.
- Building on the server competes with the running app for CPU/RAM during a deploy; for a bigger margin, add a second tiny "build server" (another VM/LXC) in Coolify, or build in GitHub Actions and have Coolify just **pull a prebuilt GHCR image** (best of both - see recommendation).

#### Docker Compose setup

Use the canonical `compose.yaml` directly as a "Docker Compose" resource, **or** let Coolify manage the primary service from the Dockerfile and add `redis` as a Coolify one-click service, `litestream` + `cloudflared` as additional Compose services. Coolify auto-generates Traefik labels for `leadlab.ssd.org` and `leadlab.adventist.asia` (multiple domains per resource is a first-class field). Persistent storage: Coolify creates a Docker volume on the host and mounts it at your chosen path - use `/var/www/db` for SQLite and `/var/www/html/storage/app` for uploads. These persist across deploys by design.

#### SQLite considerations

- Add a **Persistent Storage** entry -> Docker volume -> mount `/var/www/db`. Confirm it's a *volume*, not a bind to an overlay path that a rebuild could clobber.
- WAL + `busy_timeout` in `config/database.php` as above.
- **Pre-deploy command:** `php artisan migrate --force` (runs once, before the new container takes traffic).
- Backup: add `litestream` as a service in the Compose resource pointed at the same volume; target Synology-S3 (MinIO) or an NFS-mounted replica dir. Coolify also has its own **scheduled backups** feature (S3-compatible) - point it at a nightly `.backup` snapshot dir, ship to B2/R2/SharePoint.
- Rollback: Coolify one-click redeploy of a prior build **+** a Proxmox snapshot of the DB volume disk if a migration mangled data. Keep migrations reversible.

#### SSL/TLS

Bundled **Traefik** does Let's Encrypt automatically per domain (HTTP-01, or DNS-01 if you give it API creds - needed if 80/443 stay internal-only). Or run `cloudflared` as a service and let Cloudflare terminate (then set Coolify's proxy to plain HTTP). Either way it's a few clicks / one env var, with auto-renew handled.

#### Complexity

- **Setup:** low-medium. ~1-2 days: provision VM, run installer, connect GitHub App, define the resource + volumes + domains + Redis, wire Litestream, first deploy. Much of Option 2's hand-work (proxy, certs, zero-downtime swap, rollback mechanism, env management, deploy logs) is built in.
- **Maintenance:** you still patch the VM OS and update Coolify (in-app "Update" button, roughly monthly). In exchange you get a UI a second admin can learn in an hour, per-deploy history, one-click rollback, and central management if more internal apps join. Coolify itself is another moving part that can break - but it's widely run and the failure mode (control plane down) doesn't take the app down, since the app containers keep running.

#### Cost

**$0 license, $0 infra** (existing Proxmox). Only optional spend: ~$5-6/mo B2/R2 for offsite backups, or $0 using the M365/SharePoint tenant you already own.

#### Coolify fit score: 4.6 / 5

Hits every constraint: $0, on-prem Proxmox, native Docker Compose, push-to-deploy from GitHub, automatic multi-domain SSL, SQLite volume handling that survives deploys, a UI suited to a small team maintaining an internet-facing app. Only dings: control-plane RAM overhead (~1 GB) and one more component to keep updated.

### CapRover ([caprover.com](https://caprover.com))

Open-source, free, MIT. Older (2017), built on **Docker Swarm**.

- **CI/CD:** `captain-definition` file + GitHub webhook, or `caprover deploy` from Actions, or Docker image deploy. Simpler/older UX than Coolify.
- **Proxmox fit:** good and **lighter** - runs comfortably in ~1 GB RAM, so a smaller VM (or even a privileged LXC, though a VM is still the clean choice). One-command install.
- **Compose:** **only partly supported** - CapRover apps are single-service; multi-container stacks are awkward. You'd model `app`, `queue`, `scheduler`, `redis`, `litestream` as five separate CapRover "apps" sharing a named volume. Workable but clunkier than Coolify's Compose-native approach, and the shared-volume + single-node pinning needs care under Swarm.
- **SQLite:** persistent volume per app; pin all DB-writing apps to the same node (Swarm constraint label) so they hit the same volume. Extra vigilance vs Coolify.
- **SSL:** built-in Let's Encrypt per app, one click. Solid.
- **Cost:** $0.
- **Setup/maint:** setup slightly quicker; day-2 is fine but the project has less momentum and the Swarm/multi-app modeling for this stack is more friction.

#### CapRover fit score: 3.7 / 5

Good $0 on-prem PaaS, lighter than Coolify, but the Compose-only-partly + model-each-service-separately + Swarm-node-pinning story is a worse fit for a multi-container SQLite app than Coolify's Compose-native handling. Pick it over Coolify only if the VM RAM budget is genuinely tight (~1-2 GB).

> Honorable mention: **Dokploy** - Coolify-like, leaner, Swarm-native, growing fast in 2026. Similar profile to Coolify with a smaller footprint; reasonable alternative if you want something between CapRover and Coolify.

---

## Recommendation matrix

Weights: Cost 15 / Proxmox-infra fit 20 / CI-CD automation 20 / SQLite fit 15 / SSL 10 / Setup simplicity 10 / Maintainability 10.

| Criterion (weight) | 1. Plain Compose | 2. GH Actions -> SSH (/Kamal) | 3. Forge / Ploi + VPS | 4a. Coolify | 4b. CapRover |
|---|---|---|---|---|---|
| Cost (15) - added $/mo | 5.0 ($0) | 5.0 ($0) | 3.5 ($5-17) | 4.8 ($0-6) | 4.8 ($0-6) |
| Proxmox / on-prem fit (20) | 5.0 | 4.7 | 1.5 | 4.8 | 4.5 |
| CI/CD automation (20) | 1.5 | 4.7 | 4.0 | 4.6 | 4.0 |
| SQLite fit (15) | 4.0 | 4.3 | 3.0 | 4.4 | 3.6 |
| SSL/TLS (10) | 3.0 | 4.0 (Kamal) | 4.8 | 4.6 | 4.4 |
| Setup simplicity (10) | 3.5 | 3.0 | 4.5 | 3.8 | 4.0 |
| Maintainability (10) | 2.0 | 3.8 | 4.0 | 4.4 | 3.8 |
| **Weighted total / 5** | **3.36** | **4.35** | **3.16** | **4.52** | **4.10** |

---

## Top pick: Coolify on a Proxmox VM, pulling a GitHub-Actions-built image

### The concrete architecture

1. **Proxmox:** one Debian 13 VM - 4 vCPU, 8 GB RAM, 60 GB NVMe-backed disk - on a Proxmox HA group, nightly VM backup to the Synology via Proxmox Backup Server. Second virtual disk dedicated to `/var/lib/docker/volumes` for independent DB-volume snapshots.
2. **Coolify** installed on that VM as the control plane + runtime.
3. **GitHub Actions** builds and tests on push to `main`: runs `php artisan test` + `tsc --noEmit` + `npm run build`, builds the multi-stage image, pushes `ghcr.io/ssd-org/leadlab:<sha>` and `:latest` to GHCR with GHA layer cache.
4. **Coolify deploys by pulling that prebuilt image** (Docker-image or Compose resource referencing GHCR), not by building on the box - so a deploy costs almost no VM CPU/RAM and can't fail mid-build. Coolify webhook fires on the push; pre-deploy hook runs `php artisan migrate --force`; Traefik health-checks `/up` and swaps traffic; previous deployment stays one click away for rollback.
5. **Stack** (Coolify Compose resource): `app` (FrankenPHP, worker mode), `queue` x2, `scheduler`, `redis` (cache/session/queue), `litestream` (continuous backup), `cloudflared` (ingress). Named volumes `leadlab-db` (`/var/www/db`) and `leadlab-storage` (`/var/www/html/storage/app`), plus an NFS `nas-backups` volume.
6. **TLS / ingress:** Cloudflare Tunnel for both `leadlab.ssd.org` and `leadlab.adventist.asia` if the domain owners permit a `CNAME` to `<uuid>.cfargotunnel.com` - no inbound firewall changes, plus WAF and Zero-Trust access rules to gate the "internal" audience. Fallback: Coolify's Traefik + Let's Encrypt DNS-01.
7. **SQLite:** WAL + `busy_timeout=5000` + `synchronous=NORMAL` in `config/database.php`; scheduler runs `PRAGMA wal_checkpoint(TRUNCATE)` every 10 min. Backups: Litestream -> Synology MinIO (or NFS replica dir) continuously; nightly `.backup` snapshot to the NAS retained 30 days; weekly `rclone` copy of snapshots to the M365 SharePoint tenant. Quarterly restore drill.
8. **Rollback:** app/code -> Coolify one-click to prior deployment (or repoint `IMAGE_TAG`). Data -> Proxmox/ZFS snapshot of the DB disk taken automatically pre-deploy. Migrations kept additive and reversible.

### Why this over the alternatives

- **Budget:** $0 license, $0 infra, $0-6/mo optional offsite backup. Miles under $50.
- **Uses what exists:** everything on the Proxmox cluster; GitHub only builds and stores the image; only outbound connections leave the network.
- **Right automation for the team size:** push-to-deploy with a UI, deploy history, one-click rollback, env/secret management, and scheduled-task + `artisan` console - things Option 2 makes you build and document yourself. A second admin can be productive in an hour.
- **Container-native and Compose-native:** matches the stated preference exactly; the whole stack is declarative in one file Coolify understands.
- **SQLite done right:** persistent Docker volume that survives every deploy, single-node pinning is automatic (one VM), migrations gated to a pre-deploy hook, layered backups into infra you already own.
- **SSL is handled:** Cloudflare Tunnel or built-in Traefik/Let's Encrypt, both near-zero-config with auto-renew, multi-domain first-class.

### When to pick the runner-up instead

Choose **Option 2 (GitHub Actions -> SSH, ideally Kamal 2)** if the team would rather not run a PaaS control plane at all and has one person genuinely comfortable owning a bare Compose/Kamal setup end to end. Same $0 cost, same Proxmox VM, fully automated and auditable - you just trade Coolify's UI and built-in rollback/secrets for ~1 GB more free RAM and fewer components to update. It scores 4.35 vs 4.52; the gap is operator preference, not capability.

Avoid **Forge/Ploi** here unless the goal shifts to "stop running servers, an off-prem VPS is fine, source-based deploys are acceptable" - it's the weakest fit for the container + on-prem + Proxmox constraints as written, despite being cheap and having the smoothest SSL.

---

## Sources

- [Laravel Forge Pricing 2026 - LaraCopilot](https://laracopilot.com/blog/laravel-forge-pricing-2026/)
- [Laravel Forge pricing and alternatives - Benjamin Crozat](https://benjamincrozat.com/laravel-forge)
- [Laravel Cloud vs Forge vs Vapor 2026 - Bacancy](https://www.bacancytechnology.com/blog/laravel-cloud-vs-forge-vs-vapor)
- [Ploi.io Pricing - SpotSaaS](https://www.spotsaas.com/product/ploi-io/pricing)
- [Ploi Pricing 2026 - Toolradar](https://toolradar.com/tools/ploi/pricing)
- [How to deploy Laravel on Coolify in 2026 - LumaDock](https://lumadock.com/tutorials/deploy-laravel-on-coolify)
- [Atomic Coolify + Laravel zero-downtime deployment - Matt Stein](https://mattstein.com/thoughts/zero-downtime-laravel-coolify/)
- [Self-Hosted PaaS Showdown 2026: Coolify vs Dokploy vs CapRover - Deploynix](https://deploynix.io/blog/self-hosted-paas-showdown-2026-coolify-vs-dokploy-vs-caprover-vs-deploynix)
- [Self-hosted PaaS compared 2026: Coolify, Dokploy, CapRover, Dokku, Kamal - wz-it](https://wz-it.com/en/blog/self-hosted-paas-comparison-coolify-dokploy-caprover/)
- [Coolify vs CapRover - Contabo Blog](https://contabo.com/blog/coolify-vs-caprover/)
- [Coolify on Your Homelab / Proxmox setup - linuxcore.dev](https://linuxcore.dev/homelab/coolify-self-hosted-paas-homelab-proxmox-setup/)
- [coollabsio/coolify (GitHub)](https://github.com/coollabsio/coolify)
- [Dockerizing Laravel queues, workers, and schedulers - Sevalla](https://sevalla.com/blog/dockerizing-laravel-queues/)
- [Develop and Deploy Laravel applications with Docker Compose - Docker Docs](https://docs.docker.com/guides/laravel/)
- [Laravel Docker Setup: Compose, Queues & CI/CD - ZestMinds](https://www.zestminds.com/blog/laravel-docker-production-environment/)
- [Using SQLite in production with Laravel - Laravel News](https://laravel-news.com/using-sqlite-in-production-with-laravel)
- [Enabling WAL mode with SQLite in Laravel - freek.dev](https://freek.dev/2907-enabling-wal-mode-with-sqlite-in-laravel)
- [SQLite in Production for Laravel: When One File Wins - Deploynix](https://deploynix.io/blog/sqlite-in-production-for-laravel-when-one-file-wins)
- [Litestream - How it works](https://litestream.io/how-it-works/)
- [Litestream - Cron-based backup alternative](https://litestream.io/alternatives/cron/)
- [How to Set Up Cloudflare Tunnel with Docker - selfhosting.sh](https://selfhosting.sh/apps/cloudflare-tunnel/)
- [Cloudflare Tunnel + Docker: Expose Containers Without Nginx or Open Ports - Build with Matija](https://www.buildwithmatija.com/blog/cloudflared-tunnel-expose-docker-no-nginx-open-ports)
- [Traefik: Docker-compose with Let's Encrypt (TLS challenge)](https://doc.traefik.io/traefik/v2.0/user-guides/docker-compose/acme-tls/)
- [Caddy vs Traefik vs Nginx Proxy Manager 2026 - PkgPulse](https://www.pkgpulse.com/guides/caddy-vs-traefik-vs-nginx-proxy-manager-reverse-proxies-2026)
- [GitHub Action Docker Compose deployments via SSH - ServiceStack docs](https://docs.servicestack.net/ssh-docker-compose-deploment)
- [Docker Compose Deployment (SSH) - GitHub Marketplace](https://github.com/marketplace/actions/docker-compose-deployment-ssh)
- [A stack-agnostic Docker CI/CD pipeline with GitHub Container Registry - DigiFellow](https://digifellow.co.za/blog/ghcr-laravel-pipeline/)
- [Building and Deploying Laravel with GitHub Actions - Dries Vints](https://driesvints.medium.com/building-and-deploying-laravel-with-github-actions-8111e8a6646e)
- [Kamal - Deploy web apps anywhere](https://kamal-deploy.org/)
- [Deploying Laravel with Kamal 2: Lessons from a Real Production Setup - Planet Argon](https://blog.planetargon.com/blog/entries/deploying-laravel-with-kamal-2-lessons-from-a-real-production-setup)
- [Kamal 2.x in Production: Zero-Downtime Deploys, Secrets - wolf-tech.io](https://wolf-tech.io/blog/kamal-2-production-zero-downtime-deploys-secrets)
- [Docker on Proxmox LXC: What Actually Works - DEV Community](https://dev.to/mattercoder/docker-on-proxmox-lxc-what-actually-works-and-why-unprivileged-doesnt-45km)
- [Proxmox LXC vs VM for Docker: Architecture Decision Guide - Industrial Monitor Direct](https://industrialmonitordirect.com/blogs/knowledgebase/proxmox-lxc-vs-vm-for-docker-architecture-decision-guide)
- [Proxmox vs Docker in 2026: When to Use Each - Petronella](https://petronellatech.com/blog/proxmox-vs-docker-when-to-use-each-2026/)
