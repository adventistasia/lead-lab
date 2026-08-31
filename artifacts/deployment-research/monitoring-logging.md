# Monitoring, Telemetry & Logging for a Self-Hosted Laravel 13 App

**Research date:** 2026-08-30
**Target environment:** Laravel 13, PHP 8.3, self-hosted on a Proxmox cluster + Synology NAS, 50-200 users, medium concurrency, internal + internet-facing, budget < $50/mo additional.

---

## TL;DR - Top Pick

**Run a self-hosted core, backed by one free external watchdog, and keep Laravel-native tooling for depth.**

| Layer | Tool | Where | Cost |
|---|---|---|---|
| External uptime (from outside your network) | **Better Stack free** (10 monitors) or Healthchecks.io free | SaaS | $0 |
| Internal uptime + heartbeats (scheduler/queue/mail) | **Uptime Kuma** | Docker on Proxmox | $0 |
| Error tracking | **GlitchTip** (Sentry-SDK compatible, ~512 MB RAM) | Docker on Proxmox | $0 |
| Log aggregation + search | **Loki + Grafana Alloy + Grafana** | Docker on Proxmox | $0 |
| Metrics / perf visibility (infra) | **Prometheus + node/cAdvisor exporters + Grafana** | Docker on Proxmox | $0 |
| App perf visibility (Laravel) | **Laravel Pulse** (separate MySQL/Postgres connection) | In-app | $0 |
| Health endpoint | **spatie/laravel-health** | In-app | $0 |
| Deep local debugging (non-prod / short retention) | **Laravel Telescope** | In-app, `local`/`staging` only | $0 |
| Traffic / web analytics | **Cloudflare Web Analytics** | SaaS (free, unlimited) | $0 |

**Total additional cost: $0/mo.** The only thing you *pay* for is ~2-4 GB RAM and ~30-50 GB SSD on the Proxmox side, plus NAS space for backups.

Why not a single "stack" from the brief verbatim: each of the four candidate stacks has a gap at this scale (Telescope is not a production monitor; a purely self-hosted uptime monitor can't see your own outage; Sentry's free tier caps at 5k errors/mo; fully managed gets expensive past the free tiers). The recommended blend takes the best free piece from each.

---

## 1. What actually needs monitoring (Laravel-specific signal map)

| Signal | Best source | Notes for SQLite app |
|---|---|---|
| **HTTP errors / exceptions** | Sentry-protocol error tracker (GlitchTip / Sentry) via `sentry/sentry-laravel` | Captures stack traces, release, user context, breadcrumbs. Independent of DB engine. |
| **Uptime (is the site answering?)** | External HTTP check + internal HTTP check | Need *both*: external tells you what users see, internal isolates app vs. network/ISP. |
| **Scheduler health (`schedule:run` cron alive?)** | Heartbeat / dead-man's-switch ping at end of a scheduled job | `daun/laravel-uptime-ping` or a `->pingOnSuccess()` to Uptime Kuma / Healthchecks. |
| **Queue health (workers draining?)** | Heartbeat dispatched *through the queue* | Ping from inside a queued job every N min - only fires if a worker actually ran it. `sebastianpopp/laravel-uptime-kuma-push`. |
| **Queue depth / failed jobs** | Prometheus (spatie/laravel-prometheus) or Pulse | `jobs`, `failed_jobs` tables; expose as gauges. |
| **Mail delivery** | Laravel `MessageSent` / `MessageSending` events -> log channel + metric; plus provider webhooks (bounce/complaint) if using SES/Postmark | Also add a synthetic "send a test mail hourly" job with a heartbeat. |
| **Performance (slow endpoints, slow queries, slow jobs)** | Laravel Pulse (aggregated) + Loki (per-request timing logs) | Pulse needs MySQL/Postgres/Redis - see §7. |
| **Infra (CPU, RAM, disk, container health)** | Prometheus + `node_exporter` + `cAdvisor` | Disk-full on the SQLite volume is an outage; alert at 80%. |
| **SQLite-specific** | Nothing special needed. Watch: DB file size, `database/*.sqlite` disk free, `SQLITE_BUSY` error rate (grep in Loki), WAL file growth. | No connection-pool or replication metrics to worry about - app health *is* the DB health. |
| **TLS cert expiry** | Uptime Kuma (built-in) or Better Stack | Warn 21 days out. |
| **Traffic / usage** | Cloudflare Web Analytics (cookieless, unlimited, free) | Pageviews, referrers, geo, Core Web Vitals. Not error/perf. |

---

## 2. Option 1 - Laravel Telescope + Prometheus + Grafana

**"Laravel-native debugging + a metrics stack."**

### What it monitors
- **Telescope:** requests, exceptions, DB queries, queued jobs, mail, notifications, cache, scheduled tasks, dumps, Redis commands, HTTP client calls, gates. Extremely deep *per-event* introspection.
- **Prometheus + Grafana:** whatever you expose - typically infra (node_exporter, cAdvisor) plus app gauges/counters via a Laravel exporter (`spatie/laravel-prometheus`, `arquivei/laravel-prometheus-exporter`, or Horizon exporter). Good for queue depth, request rate, response-time histograms, failed jobs, business counters.
- **Uptime:** not covered natively - you would add Blackbox Exporter for HTTP probes.

### Laravel integration
- `composer require laravel/telescope`; publish config; `TelescopeServiceProvider` gates access. Watchers configured in `config/telescope.php`.
- Telescope stores entries in a DB connection. **Do not point it at your app SQLite file in production** - use a dedicated connection (separate SQLite file or a small MySQL). It writes inline on each request.
- Prometheus: `spatie/laravel-prometheus` registers a `/metrics` route; you define collectors. Ships with queue/Horizon metrics out of the box. Add `->pingBefore()`-style custom gauges for `failed_jobs` count, oldest pending job age, DB file size.

### Dashboards & alerting
- Telescope has its own UI at `/telescope` - **no alerting**, it is a forensic tool you open *after* you know something is wrong.
- Grafana dashboards for metrics; **Grafana alerting** (or Alertmanager) does the "you know something is wrong" job - email/Slack/Telegram/webhook on threshold breaches (5xx rate, queue backlog, disk %, probe failure).

### Docker Compose services
```yaml
services:
  prometheus:      # prom/prometheus - scrapes exporters + app /metrics
  alertmanager:    # prom/alertmanager - routing/dedup of alerts
  grafana:         # grafana/grafana - dashboards + alerting UI
  node-exporter:   # prom/node-exporter - host CPU/RAM/disk
  cadvisor:        # gcr.io/cadvisor/cadvisor - per-container stats
  blackbox-exporter: # prom/blackbox-exporter - HTTP/TCP/ICMP uptime probes
```
Telescope is **in-app**, no container.

### Storage & retention (Synology)
- Prometheus TSDB: local SSD volume, `--storage.tsdb.retention.time=30d`. At this scale expect 2-8 GB. Nightly `restic`/Proxmox backup of the volume to a Synology NFS share. Do **not** run the active TSDB off spinning-disk NFS - I/O latency will cause scrape gaps.
- Grafana: tiny SQLite config DB (`grafana.db`) - back up to NAS nightly.
- Telescope: prune aggressively. `php artisan telescope:prune --hours=24` on the scheduler. Table lives with your app; on a busy app it grows fast.

### Setup complexity & maintenance
- **Medium-high.** Prometheus scrape configs, exporter wiring, dashboard building, and alert rules are all hand-rolled. Every new thing you want to watch = define a metric + a panel + a rule.
- Telescope in production is widely discouraged: it adds ~10-50 ms/request inline write overhead and DB churn; official docs and 2026 write-ups say "not for production" or "keep it disabled and enable briefly." Fine for `local`/`staging`.
- Ongoing: keep exporters updated, tune alert noise, watch TSDB disk.

### Cost at this scale
- **$0 software.** ~1.5-2 GB RAM for the whole Prom/Grafana stack. Fits the budget trivially.

### Fit with SQLite
- Neutral. No DB exporter needed. You *do* want a custom gauge for SQLite file size + a Blackbox/HTTP check on a health route, because with SQLite "app up" and "DB up" are the same question.

**Verdict:** Best-in-class metrics + alerting, but no error tracking and no uptime out of the box, and Telescope is a debugging aid rather than a monitor. Use Prometheus+Grafana as the *metrics half* of the final stack; drop Telescope to non-prod.

---

## 3. Option 2 - Uptime Kuma + Loki + Grafana

**"Lightweight self-hosted uptime + log aggregation."**

### What it monitors
- **Uptime Kuma:** HTTP(S), TCP, ping, DNS, keyword/JSON-body checks, push/heartbeat monitors, TLS-cert expiry, Docker container health, Steam/game servers. Check interval down to 20 s. Retries before alerting, maintenance windows, public/private **status pages** on a custom domain. Current stable **2.5.0 (2026-08-01)**, added an NTP monitor. ~256 MB RAM in one container.
- **Push monitors** cover scheduler + queue: your Laravel job pushes to a Kuma URL; if the push stops arriving, Kuma alerts. This is how you monitor cron and queue-worker liveness.
- **Loki + Grafana:** centralised log search across app, web server, queue worker, and container logs. Query with LogQL, build panels, and **alert on log patterns** (e.g. rate of `production.ERROR` or `SQLITE_BUSY` over 5 min).
- Not covered: deep metrics (add Prometheus), error grouping/stack-trace UX (Loki shows the log line, not a deduplicated issue with breadcrumbs).

### Laravel integration
- **Uptime Kuma:** no package required for HTTP checks. For heartbeats use `sebastianpopp/laravel-uptime-kuma-push` or `daun/laravel-uptime-ping`, or just `Http::get(config('services.kuma.scheduler_url'))` in `->pingOnSuccess()` / at the end of a queued job.
- **Loki:** add a Monolog handler. Packages: `bureaupartners/laravel-loki-logging` (zero-config, v0.1.1 2026-02-13, PHP ^8.2, monolog ^3), `alexmacarthur/laravel-loki-logging` (async batched, updated 2026-07-11), or `itspire/monolog-loki`. Or - preferred for reliability - log JSON to stdout/file and let **Grafana Alloy** ship it, so a Loki outage never blocks a request.
- Config: add a `loki` channel in `config/logging.php`, or keep `stderr` with `JsonFormatter` and collect via Alloy.

### Dashboards & alerting
- Uptime Kuma has its own dashboard + 90+ notification integrations (email, Slack, Telegram, Discord, Gotify, ntfy, PagerDuty, generic webhook). This is your primary "site is down" alert path.
- Grafana dashboards over Loki; Grafana-managed alert rules on log-based metrics (`count_over_time`, `rate`).

### Docker Compose services
```yaml
services:
  uptime-kuma:   # louislam/uptime-kuma:2 - SQLite-backed, port 3001
  loki:          # grafana/loki:3 - log store, filesystem or S3-compatible backend
  alloy:         # grafana/alloy - collects Docker + file logs -> Loki (Promtail is EOL as of 2026-03-02)
  grafana:       # grafana/grafana - dashboards + alerting
```

### Storage & retention (Synology)
- **Loki:** filesystem storage on local SSD; enable the **compactor** with `retention_enabled: true` and `retention_period: 720h` (30 d). At 50-200 users expect ~0.5-3 GB/mo of compressed logs. Option: point Loki's `object_store` at the Synology over S3 gateway (MinIO on the NAS) or NFS for the boltdb-shipper/chunks - acceptable for Loki's write pattern, unlike Prometheus. Simpler: keep chunks local, `restic` to NAS nightly.
- **Uptime Kuma:** single SQLite DB (`/app/data/kuma.db`), a few MB. Nightly copy to NAS. (Kuma gets sluggish past ~100-150 monitors at short intervals - you will be well under that.)
- **Grafana:** config SQLite DB to NAS nightly.

### Setup complexity & maintenance
- **Low-medium.** Kuma is click-to-configure, no YAML. Loki+Alloy+Grafana is a well-trodden compose stack; the fiddly part is the Alloy pipeline (relabeling, multiline stack-trace stitching) and Loki retention config.
- Ongoing: bump image tags, watch Loki disk, occasionally tune Alloy parsing. Kuma is nearly maintenance-free.

### Cost at this scale
- **$0 software.** ~700 MB-1.2 GB RAM total. Comfortable.

### Fit with SQLite
- Very good. Kuma push monitors + an HTTP check on `spatie/laravel-health` output tell you app+DB health in one shot. Loki lets you alert on `SQLITE_BUSY` / `database is locked` spikes, which is the main SQLite failure mode under concurrency. Add a Kuma keyword monitor on `/up` (Laravel's built-in health route) checking for `200`.

**Verdict:** This is the strongest *self-hosted* core for uptime + logs and the lightest to run. Its gaps are metrics (add Prometheus from Option 1) and error-tracking UX (add GlitchTip). Forms the backbone of the recommendation.

---

## 4. Option 3 - Cloudflare Web Analytics + Sentry free tier

**"External services, zero infra."**

### What it monitors
- **Cloudflare Web Analytics:** cookieless, no consent banner, **free with no event/traffic caps**, works without a paid Cloudflare plan or even without proxying (JS beacon). Gives pageviews, top pages, referrers, country, browser/OS, and by 2026 **Core Web Vitals / load speed** and custom dashboards. **Does not do:** error tracking, uptime, backend perf, queue/mail health, custom events, funnels, real-time.
- **Sentry (SaaS) free "Developer" plan:** 1 user, **5,000 errors/mo**, 30-day retention, plus (2026 quotas) ~5 GB logs, 5M spans (tracing), 50 session replays, **1 uptime monitor**, 1 cron monitor, 20 metric alerts. Excellent error grouping, stack traces, breadcrumbs, releases, suspect commits, alerting.
  - Paid: **Team $26/mo** (50k errors, unlimited users), **Business $80/mo**. PAYG overage above quota.

### Laravel integration
- `composer require sentry/sentry-laravel`; set `SENTRY_LARAVEL_DSN`; add the handler in `bootstrap/app.php` (Laravel 11+/13 structure) `->withExceptions(...)`. Optional `SENTRY_TRACES_SAMPLE_RATE` for performance tracing, `SENTRY_PROFILES_SAMPLE_RATE` for profiling. Captures queued-job failures, command failures, and (with tracing) slow endpoints/queries.
- Sentry Crons: wrap scheduled tasks with `->sentryMonitor()` (macro from the SDK) to get cron heartbeat alerts - but only **1 monitor** on free.
- Sentry Uptime: **1 monitor** on free - enough for one URL.
- Cloudflare: paste a `<script>` beacon into your layout, or enable via the Cloudflare dashboard if the domain is proxied. No backend code.

### Dashboards & alerting
- Sentry: issue alerts (new issue, regression, frequency spikes) and metric alerts to email/Slack/PagerDuty/webhook. This is a genuinely good "you know something is wrong" experience with near-zero setup.
- Cloudflare: dashboard only, no meaningful alerting on the free analytics product.

### Docker Compose services
- **None.** That is the whole point. (Self-hosting Sentry is a separate beast - see §6 - and is out of scope for "zero infra".)

### Storage & retention
- Nothing on your side. Sentry free retention is 30 days. Cloudflare Analytics retention is limited (rolling window, ~6 months of aggregates) and not exportable in bulk on the free product.

### Setup complexity & maintenance
- **Lowest of all options.** ~30 minutes total. No upgrades, no disk, no backups. Data leaves your network (relevant if the app handles sensitive internal data - Sentry can scrub PII, and you can self-host later).

### Cost at this scale
- **$0** if you fit under 5,000 errors/mo. A noisy deploy can blow that in an afternoon; then errors are dropped until the quota resets (or you pay $26/mo Team). 50-200 users with a stable app is usually fine on free, but it is a real risk.
- No self-hosted uptime -> you still want Uptime Kuma or a free external monitor for anything beyond the single Sentry uptime check.

### Fit with SQLite
- Fine. Sentry is DB-agnostic; it will surface `PDOException: database is locked` with full context, which is arguably the single most useful thing for a concurrent SQLite app. No infra to collide with your DB.

**Verdict:** Unbeatable effort-to-value for **error tracking** and **traffic**. Use **Cloudflare Web Analytics** in the final stack regardless (it is free and costless to run). Use **hosted Sentry free** only if you are comfortable with the 5k/mo cap and data egress; otherwise self-host the equivalent with **GlitchTip** (§6), which is what the recommendation does.

---

## 5. Option 4 - Better Stack / Healthchecks.io

**"Managed uptime + cron/heartbeat monitoring."**

### Better Stack (formerly Better Uptime)
- **Model:** modular - Uptime, Logs, Incident management, Tracing, Infra, Error tracking each priced separately.
- **Free tier:** 10 monitors, 3-minute check interval, 1 phone-call alert, status page. Good enough to be your **external watchdog**.
- **Paid:** Uptime/Incident from **$29/mo** (annual) / **$34/mo** (monthly) per responder license; extra monitors in packs (~$21-25 per 50); Logs & dashboards from **$24/mo**. 60-day money-back guarantee.
- **What it monitors:** HTTP/TCP/ping/DNS uptime, keyword/JSON checks, TLS expiry, cron/heartbeat monitors, multi-step API checks, and (paid) log ingestion with alerting. Multi-region checks from outside your network - the thing a self-hosted monitor structurally cannot do.
- **Alerting:** email, SMS, phone call, Slack, Teams, PagerDuty-style on-call schedules and escalation, incident timeline, branded status page.

### Healthchecks.io
- **Purpose-built for cron/heartbeat ("dead man's switch") monitoring** - you tell it "ping me every 10 min ± grace"; if a ping is missed it alerts. Ideal for `schedule:run`, backups, queue drain, nightly prune.
- **Free "Hobbyist":** 20 checks, 3 team members. **Business $20/mo:** 100 checks, 10 users. **Business Plus $80/mo:** 1000 checks, unlimited users.
- **Also self-hostable** (open source, Django + Postgres) if you want it on Proxmox for $0 - one more container.
- **Alerting:** email, Slack, Telegram, PagerDuty, Opsgenie, webhook, and many more.
- Does **not** do active HTTP uptime probing (it is pull/heartbeat only), error tracking, logs, or metrics.

### Laravel integration
- Both are just URLs to hit. Laravel scheduler: `->pingOnSuccess('https://hc-ping.com/<uuid>')` / `->pingBefore(...)->thenPing(...)`. Queue heartbeat: dispatch a job every minute that pings, so a stalled worker trips the check. `spatie/laravel-schedule-monitor` integrates cleanly with either.
- Better Stack Logs (paid): Monolog HTTP/syslog handler, or ship via Vector/Alloy.

### Docker Compose services
- **None** for the SaaS tiers. **One** (`healthchecks/healthchecks` + Postgres) if you self-host Healthchecks.

### Storage & retention
- Better Stack: 30-90 day incident/monitor history depending on plan; Logs retention 3-30 days by plan. Healthchecks: keeps last N pings per check (configurable), events for months. Nothing on your NAS unless self-hosting Healthchecks (small Postgres, back up to NAS).

### Setup complexity & maintenance
- **Very low.** Create monitors in a web UI, paste URLs into the scheduler. No maintenance.

### Cost at this scale
- **$0** if you stay on Better Stack free (10 monitors) and/or Healthchecks free (20 checks). That covers external uptime + all your cron/queue/mail heartbeats for a small app.
- Going paid for on-call/SMS/phone escalation: **$20-34/mo**, still inside the $50 budget, but only worth it if you need paging.

### Fit with SQLite
- Indirect but valuable: an external HTTP monitor on your public URL + a heartbeat from inside a queued DB write is the cleanest end-to-end "the app can serve and can write to SQLite" probe, verified from outside your infrastructure.

**Verdict:** Best-in-class for the *external* vantage point and for cron/heartbeat semantics, with a free tier that genuinely covers a 50-200 user app. **Take the Better Stack free tier (or Healthchecks free) as the external watchdog** in the final stack. Only pay if you need real on-call paging.

---

## 6. Error tracking you self-host: GlitchTip vs. self-hosted Sentry

Because the brief's Option 3 leans on Sentry, here is the on-prem equivalent.

| | **Self-hosted Sentry** | **GlitchTip** |
|---|---|---|
| Compatibility | Reference implementation | Same Sentry SDKs, **same DSN format** - point `sentry-laravel` at GlitchTip, no code change |
| Containers | ~20-40 (Kafka, ClickHouse, Snuba, Relay, Redis, Postgres, workers, …) | **4** (web, Celery worker, Postgres, Redis/Valkey) |
| RAM | **16 GB min, 32 GB recommended**, 16 GB swap, heavy disk I/O; 4 CPU min | **~512 MB** |
| Disk | 20 GB min, 50 GB+ recommended, grows fast | Small; prune events at 30-90 d |
| Features | Full: tracing, profiling, replay, dashboards, cron, uptime, code owners | Error grouping, stack traces, breadcrumbs, releases, basic uptime + cron/"uptime checks", email/webhook alerts. GlitchTip 6 (Feb 2026) improved stack traces + perf |
| Fit for 50-200 users on Proxmox | Overkill; will dominate a node | **Right-sized** |
| Hosted option | sentry.io free 5k/mo | glitchtip.com from ~$15/mo |

**Recommendation: GlitchTip.** It gives you 90% of the day-to-day error-tracking value (which for a SQLite app is mostly "show me the exception with a stack trace and how often it happens") at 3% of the footprint, and you can migrate to hosted or self-hosted Sentry later by changing one env var.

---

## 7. Laravel-native depth: Pulse, Telescope, laravel-health

- **Laravel Pulse** (MIT, free, self-hosted, Laravel 10+/PHP 8.1+): aggregated dashboard - slow endpoints, slow queries, slow jobs, slow outgoing requests, exceptions count, cache hit rate, queue throughput, busiest users, server CPU/RAM. Low overhead (sampling + buffered ingest).
  - **SQLite caveat:** Pulse's first-party storage needs **MySQL, MariaDB, or PostgreSQL** (or Redis ingest). Your app runs on SQLite, so give Pulse its **own** `pulse` DB connection - a tiny MariaDB container, or a Redis-backed ingest. Config: `PULSE_DB_CONNECTION=pulse`, optionally `PULSE_INGEST_DRIVER=redis`.
  - This is your best "basic performance visibility" answer without building Grafana panels by hand.
- **Laravel Telescope**: keep it, but gate it to `local`/`staging` (`APP_ENV !== 'production'` in `TelescopeServiceProvider::gate()` / `register()`), or enable in prod only briefly behind auth with `telescope:prune --hours=24` scheduled. 10-50 ms/request inline overhead makes it a debugging tool, not a monitor.
- **spatie/laravel-health** (free): register checks - `DatabaseCheck` (runs a real query against SQLite), `UsedDiskSpaceCheck` (critical for the SQLite volume), `ScheduleCheck`, `QueueCheck`, `CacheCheck`, `HorizonCheck` (if used), custom `MailCheck`. Exposes `/health` JSON + a Blade dashboard. Point Uptime Kuma / Better Stack at `/health` with a keyword match on `"status":"ok"`. Can also push results to a Prometheus textfile or OhDear.
- **Laravel `/up` route**: Laravel 11+/13 ship a bootstrap health endpoint (`bootstrap/app.php` `health: '/up'`). Cheapest possible liveness probe - monitor it too.

---

## 8. Recommendation matrix

Scoring 1-5 (5 = best) for this specific context.

| Criterion | Opt 1: Telescope+Prom+Grafana | Opt 2: Kuma+Loki+Grafana | Opt 3: Cloudflare+Sentry free | Opt 4: BetterStack/Healthchecks | **Recommended blend** |
|---|:--:|:--:|:--:|:--:|:--:|
| Error tracking quality | 2 | 2 | **5** | 1 | **5** (GlitchTip) |
| Uptime - external vantage | 2* | 1 | 3 | **5** | **5** (BetterStack free) |
| Uptime - internal + heartbeats | 2 | **5** | 2 | 4 | **5** (Kuma) |
| Log aggregation & search | 2 | **5** | 2 | 3 (paid) | **5** (Loki) |
| Metrics / infra perf | **5** | 2 | 1 | 2 | **5** (Prometheus) |
| App perf visibility (Laravel) | 3 | 2 | 4 (tracing) | 1 | **4** (Pulse) |
| Queue / scheduler / mail health | 3 | **5** | 3 | **5** | **5** |
| Alerting ("how you know") | 4 | 4 | **5** | **5** | **5** |
| Setup complexity (5=easy) | 2 | 3 | **5** | **5** | 3 |
| Ongoing maintenance (5=low) | 2 | 3 | **5** | **5** | 3 |
| Data stays on-prem | **5** | **5** | 1 | 2 | 4 |
| Cost at 50-200 users | **5** ($0) | **5** ($0) | 4 (5k cap risk) | 4 (free tier) | **5** ($0) |
| Resource footprint on Proxmox | 3 | **4** | **5** | **5** | 3 (~2-4 GB RAM) |
| **Fit for this project** | **3.0** | **3.6** | **3.4** | **3.6** | **4.5** |

\* Option 1 can do external-style probes via Blackbox Exporter, but still runs inside your infra.

### If you must pick exactly one of the four as-written
**Option 2 (Uptime Kuma + Loki + Grafana)** - it covers the widest span of the actual needs (uptime, heartbeats, logs, alerting) at the smallest footprint and $0, on-prem. Its weaknesses (metrics depth, error-grouping UX) are the easiest to patch later.

### Clear top pick (recommended blend)
**Uptime Kuma + GlitchTip + Loki/Alloy/Grafana + Prometheus + Laravel Pulse + spatie/laravel-health, with Better Stack's free tier as the external watchdog and Cloudflare Web Analytics for traffic.** $0/mo, ~2-4 GB RAM, all critical data on-prem, and a genuine "you get paged when it breaks" story.

---

## 9. Concrete implementation

### 9.1 `docker-compose.yml` (monitoring stack - separate from the app compose project)

```yaml
name: monitoring

networks:
  monitoring:
  web:            # shared with the Laravel app compose project (external: true in practice)
    external: true

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
  kuma_data:
  glitchtip_pg:
  glitchtip_uploads:

services:
  # ---------- Uptime + heartbeats ----------
  uptime-kuma:
    image: louislam/uptime-kuma:2          # 2.5.0+ (Aug 2026)
    restart: unless-stopped
    volumes:
      - kuma_data:/app/data
    ports:
      - "3001:3001"
    networks: [monitoring, web]

  # ---------- Error tracking (Sentry-compatible) ----------
  glitchtip-web:
    image: glitchtip/glitchtip:v6          # GlitchTip 6 (Feb 2026)
    restart: unless-stopped
    depends_on: [glitchtip-postgres, glitchtip-redis]
    environment:
      DATABASE_URL: postgres://glitchtip:${GLITCHTIP_DB_PASSWORD}@glitchtip-postgres:5432/glitchtip
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
      PORT: "8080"
      EMAIL_URL: ${GLITCHTIP_EMAIL_URL}                # smtp://user:pass@host:587
      GLITCHTIP_DOMAIN: https://errors.example.internal
      DEFAULT_FROM_EMAIL: errors@example.internal
      CELERY_WORKER_AUTOSCALE: "1,3"
      GLITCHTIP_MAX_EVENT_LIFE_DAYS: "90"              # retention / auto-prune
    volumes:
      - glitchtip_uploads:/code/uploads
    ports:
      - "8080:8080"
    networks: [monitoring, web]

  glitchtip-worker:
    image: glitchtip/glitchtip:v6
    restart: unless-stopped
    command: ./bin/run-celery-with-beat.sh
    depends_on: [glitchtip-postgres, glitchtip-redis]
    environment:
      DATABASE_URL: postgres://glitchtip:${GLITCHTIP_DB_PASSWORD}@glitchtip-postgres:5432/glitchtip
      SECRET_KEY: ${GLITCHTIP_SECRET_KEY}
      EMAIL_URL: ${GLITCHTIP_EMAIL_URL}
      GLITCHTIP_MAX_EVENT_LIFE_DAYS: "90"
    volumes:
      - glitchtip_uploads:/code/uploads
    networks: [monitoring]

  glitchtip-postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: glitchtip
      POSTGRES_PASSWORD: ${GLITCHTIP_DB_PASSWORD}
      POSTGRES_DB: glitchtip
    volumes:
      - glitchtip_pg:/var/lib/postgresql/data
    networks: [monitoring]

  glitchtip-redis:
    image: valkey/valkey:8-alpine
    restart: unless-stopped
    networks: [monitoring]

  # ---------- Logs ----------
  loki:
    image: grafana/loki:3
    restart: unless-stopped
    command: -config.file=/etc/loki/loki-config.yml
    volumes:
      - ./loki/loki-config.yml:/etc/loki/loki-config.yml:ro
      - loki_data:/loki
    ports:
      - "3100:3100"
    networks: [monitoring]

  alloy:                                   # replaces Promtail (EOL 2026-03-02)
    image: grafana/alloy:latest
    restart: unless-stopped
    command:
      - run
      - /etc/alloy/config.alloy
      - --storage.path=/var/lib/alloy/data
    volumes:
      - ./alloy/config.alloy:/etc/alloy/config.alloy:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/log:/var/log:ro                # if the app also writes files on the host
    networks: [monitoring]

  # ---------- Metrics ----------
  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    command:
      - --config.file=/etc/prometheus/prometheus.yml
      - --storage.tsdb.retention.time=30d
      - --web.enable-lifecycle
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks: [monitoring, web]

  alertmanager:
    image: prom/alertmanager:latest
    restart: unless-stopped
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
    ports:
      - "9093:9093"
    networks: [monitoring]

  node-exporter:
    image: prom/node-exporter:latest
    restart: unless-stopped
    command:
      - --path.rootfs=/host
    pid: host
    volumes:
      - /:/host:ro,rslave
    networks: [monitoring]

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    restart: unless-stopped
    privileged: true
    devices: [/dev/kmsg]
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks: [monitoring]

  blackbox-exporter:
    image: prom/blackbox-exporter:latest
    restart: unless-stopped
    volumes:
      - ./blackbox/blackbox.yml:/etc/blackbox_exporter/config.yml:ro
    networks: [monitoring, web]

  # ---------- Dashboards + alerting UI ----------
  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
      GF_SERVER_ROOT_URL: https://grafana.example.internal
      GF_SMTP_ENABLED: "true"
      GF_SMTP_HOST: ${SMTP_HOST}:587
      GF_SMTP_FROM_ADDRESS: grafana@example.internal
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/provisioning:ro
    ports:
      - "3000:3000"
    networks: [monitoring, web]
```

Add `laravel-pulse-db` only if you adopt Pulse:

```yaml
  pulse-db:
    image: mariadb:11
    restart: unless-stopped
    environment:
      MARIADB_DATABASE: pulse
      MARIADB_USER: pulse
      MARIADB_PASSWORD: ${PULSE_DB_PASSWORD}
      MARIADB_RANDOM_ROOT_PASSWORD: "yes"
    volumes:
      - pulse_db:/var/lib/mysql
    networks: [web]     # reachable by the Laravel container
```

### 9.2 Supporting config files

**`loki/loki-config.yml`** (single-binary, filesystem, 30-day retention):
```yaml
auth_enabled: false
server:
  http_listen_port: 3100
common:
  instance_addr: 127.0.0.1
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory
schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h
limits_config:
  retention_period: 720h        # 30 days
  ingestion_rate_mb: 8
  ingestion_burst_size_mb: 16
compactor:
  working_directory: /loki/compactor
  retention_enabled: true
  delete_request_store: filesystem
```

**`alloy/config.alloy`** (collect Docker container logs, stitch multiline PHP stack traces, push to Loki):
```river
discovery.docker "containers" {
  host = "unix:///var/run/docker.sock"
}

discovery.relabel "containers" {
  targets = discovery.docker.containers.targets
  rule {
    source_labels = ["__meta_docker_container_name"]
    regex         = "/(.*)"
    target_label  = "container"
  }
  rule {
    source_labels = ["__meta_docker_container_label_com_docker_compose_project"]
    target_label  = "project"
  }
}

loki.source.docker "containers" {
  host          = "unix:///var/run/docker.sock"
  targets       = discovery.relabel.containers.output
  relabel_rules = discovery.relabel.containers.rules
  forward_to    = [loki.process.laravel.receiver]
}

loki.process "laravel" {
  // Join wrapped stack-trace lines onto the preceding log entry
  stage.multiline {
    firstline     = "^\\[\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}:\\d{2}"
    max_wait_time = "3s"
  }
  // Parse "production.ERROR" level into a label for alerting
  stage.regex {
    expression = "\\.(?P<level>DEBUG|INFO|NOTICE|WARNING|ERROR|CRITICAL|ALERT|EMERGENCY):"
  }
  stage.labels {
    values = { level = "" }
  }
  forward_to = [loki.write.default.receiver]
}

loki.write "default" {
  endpoint { url = "http://loki:3100/loki/api/v1/push" }
}
```
(If the app logs JSON to stdout via `stderr` + `JsonFormatter`, replace `stage.regex/labels` with `stage.json` extracting `level`, `message`, `context`.)

**`prometheus/prometheus.yml`**:
```yaml
global:
  scrape_interval: 30s
  evaluation_interval: 30s
alerting:
  alertmanagers:
    - static_configs: [{ targets: ["alertmanager:9093"] }]
rule_files:
  - /etc/prometheus/rules/*.yml
scrape_configs:
  - job_name: prometheus
    static_configs: [{ targets: ["localhost:9090"] }]
  - job_name: node
    static_configs: [{ targets: ["node-exporter:9100"] }]
  - job_name: cadvisor
    static_configs: [{ targets: ["cadvisor:8080"] }]
  - job_name: laravel-app
    metrics_path: /metrics                    # spatie/laravel-prometheus
    scheme: https
    static_configs: [{ targets: ["app.example.internal"] }]
    basic_auth: { username: prometheus, password: "${APP_METRICS_TOKEN}" }
  - job_name: blackbox-http
    metrics_path: /probe
    params: { module: [http_2xx] }
    static_configs:
      - targets:
          - https://app.example.com/up
          - https://app.example.com/health
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

**`prometheus/rules/laravel.yml`** (the alerts that page you):
```yaml
groups:
  - name: laravel
    rules:
      - alert: SiteDown
        expr: probe_success{instance="https://app.example.com/up"} == 0
        for: 2m
        labels: { severity: critical }
        annotations: { summary: "App /up probe failing" }
      - alert: HighHttp5xxRate
        expr: sum(rate(laravel_http_responses_total{status=~"5.."}[5m]))
              / sum(rate(laravel_http_responses_total[5m])) > 0.05
        for: 5m
        labels: { severity: critical }
      - alert: QueueBacklogGrowing
        expr: laravel_queue_pending_jobs > 500
        for: 10m
        labels: { severity: warning }
      - alert: OldestPendingJobTooOld
        expr: laravel_queue_oldest_pending_seconds > 900
        for: 5m
        labels: { severity: warning }
      - alert: FailedJobsSpike
        expr: increase(laravel_queue_failed_jobs_total[15m]) > 10
        labels: { severity: warning }
      - alert: SqliteVolumeAlmostFull
        expr: (node_filesystem_avail_bytes{mountpoint="/host/var/lib/app-data"}
              / node_filesystem_size_bytes{mountpoint="/host/var/lib/app-data"}) < 0.15
        for: 5m
        labels: { severity: critical }
      - alert: SqliteFileGrowingFast
        expr: deriv(laravel_sqlite_db_size_bytes[1h]) > 5e6
        for: 30m
        labels: { severity: warning }
      - alert: TlsCertExpiringSoon
        expr: probe_ssl_earliest_cert_expiry - time() < 21*24*3600
        labels: { severity: warning }
```

**`blackbox/blackbox.yml`**:
```yaml
modules:
  http_2xx:
    prober: http
    timeout: 10s
    http:
      valid_status_codes: [200]
      fail_if_body_not_matches_regexp: ['"status"\s*:\s*"ok"']   # for /health
      preferred_ip_protocol: ip4
```

### 9.3 Laravel config

**`composer require`:**
```
sentry/sentry-laravel          # points at GlitchTip
spatie/laravel-prometheus      # /metrics endpoint
spatie/laravel-health          # /health checks + dashboard
spatie/laravel-schedule-monitor # optional: scheduler task monitoring
laravel/pulse                  # optional: app perf dashboard
```

**`.env`:**
```dotenv
# --- Error tracking (GlitchTip via Sentry SDK) ---
SENTRY_LARAVEL_DSN=https://<publicKey>@errors.example.internal/1
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_SEND_DEFAULT_PII=false
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=${APP_VERSION}

# --- Logging: stack that fans out to daily file + Loki-friendly stderr ---
LOG_CHANNEL=stack
LOG_STACK=daily,stderr
LOG_LEVEL=info
LOG_STDERR_FORMATTER=Monolog\\Formatter\\JsonFormatter

# --- Uptime Kuma push (heartbeats) ---
KUMA_SCHEDULER_PUSH_URL=http://uptime-kuma:3001/api/push/<token1>?status=up&msg=OK
KUMA_QUEUE_PUSH_URL=http://uptime-kuma:3001/api/push/<token2>?status=up&msg=OK

# --- External watchdog (Better Stack / Healthchecks heartbeat) ---
HEARTBEAT_SCHEDULER_URL=https://uptime.betterstack.com/api/v1/heartbeat/<id>

# --- Prometheus scrape auth ---
APP_METRICS_TOKEN=<random>

# --- Pulse (separate DB - SQLite not supported for Pulse storage) ---
PULSE_ENABLED=true
PULSE_DB_CONNECTION=pulse
PULSE_INGEST_DRIVER=storage
```

**`config/logging.php`** - add a dedicated error/context channel and keep prod resilient (never let a log sink block a request):
```php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => explode(',', env('LOG_STACK', 'daily')),
        'ignore_exceptions' => false,
    ],

    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,                // local retention; Loki holds 30d centrally
        'replace_placeholders' => true,
    ],

    // stderr -> Docker -> Alloy -> Loki. JSON so Alloy can label it.
    'stderr' => [
        'driver' => 'monolog',
        'level' => env('LOG_LEVEL', 'info'),
        'handler' => Monolog\Handler\StreamHandler::class,
        'formatter' => env('LOG_STDERR_FORMATTER'),
        'with' => ['stream' => 'php://stderr'],
        'processors' => [Monolog\Processor\PsrLogMessageProcessor::class],
    ],
],
```
(Optionally add a direct `loki` channel via `bureaupartners/laravel-loki-logging`, but prefer stdout+Alloy so a Loki outage can't stall PHP-FPM.)

**`config/telescope.php`** / `TelescopeServiceProvider` - non-prod only:
```php
// app/Providers/TelescopeServiceProvider.php
public function register(): void
{
    if ($this->app->environment('production')) {
        // Do not even boot Telescope in prod.
        Telescope::stopRecording();
    }
    Telescope::night();
    // ...filter as usual
}

protected function gate(): void
{
    Gate::define('viewTelescope', fn ($user) => in_array($user->email, [
        'ryannmicua@gmail.com',
    ]));
}
```
If you ever must enable in prod: schedule `->command('telescope:prune --hours=24')->daily();` and use a separate `telescope` DB connection.

**`routes/console.php`** (or `app/Console/Kernel.php`) - heartbeats + pruning:
```php
use Illuminate\Support\Facades\Schedule;

// Scheduler alive? Ping only if schedule:run itself is firing.
Schedule::call(fn () => Http::get(env('KUMA_SCHEDULER_PUSH_URL')))
    ->everyFiveMinutes()->name('kuma-scheduler-heartbeat');

// External watchdog for the scheduler (dead-man's-switch from outside).
Schedule::call(fn () => Http::get(env('HEARTBEAT_SCHEDULER_URL')))
    ->everyFiveMinutes()->name('external-scheduler-heartbeat');

// Queue alive? Dispatch through the queue; the job pings on handle().
Schedule::job(new \App\Jobs\QueueHeartbeat)->everyMinute();

// Housekeeping
Schedule::command('health:check')->everyMinute();
Schedule::command('pulse:check')->everyMinute();        // if using Pulse
Schedule::command('telescope:prune --hours=24')->daily(); // non-prod
Schedule::command('queue:prune-failed --hours=168')->daily();
Schedule::command('model:prune')->daily();
```

```php
// app/Jobs/QueueHeartbeat.php
class QueueHeartbeat implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;
    public function handle(): void
    {
        Http::get(env('KUMA_QUEUE_PUSH_URL'));
    }
}
```

**`app/Providers/AppServiceProvider.php`** - health checks + a SQLite size gauge:
```php
use Spatie\Health\Facades\Health;
use Spatie\Health\Checks\Checks\{DatabaseCheck, UsedDiskSpaceCheck, ScheduleCheck, CacheCheck, QueueCheck, DebugModeCheck, EnvironmentCheck};

public function boot(): void
{
    Health::checks([
        DatabaseCheck::new(),                          // real query against SQLite
        UsedDiskSpaceCheck::new()->warnWhenUsedSpaceIsAbovePercentage(70)
                                 ->failWhenUsedSpaceIsAbovePercentage(85),
        ScheduleCheck::new()->heartbeatMaxAgeInMinutes(6),
        QueueCheck::new(),
        CacheCheck::new(),
        DebugModeCheck::new(),
        EnvironmentCheck::new(),
    ]);
}
```

**`config/prometheus.php`** (spatie/laravel-prometheus) - register collectors for the signals the alert rules expect:
```php
'collectors' => [
    \Spatie\Prometheus\Collectors\Horizon\MasterSupervisorCollector::class, // if Horizon
],

// In a service provider, register custom gauges:
Prometheus::addGauge('sqlite_db_size_bytes')
    ->helpText('Size of the primary SQLite database file')
    ->value(fn () => @filesize(database_path('database.sqlite')) ?: 0);

Prometheus::addGauge('queue_pending_jobs')
    ->value(fn () => DB::table('jobs')->count());

Prometheus::addGauge('queue_oldest_pending_seconds')
    ->value(fn () => (int) (now()->timestamp - (DB::table('jobs')->min('available_at') ?? now()->timestamp)));

Prometheus::addGauge('queue_failed_jobs_total')
    ->value(fn () => DB::table('failed_jobs')->count());
```
Protect the route in `routes/web.php`:
```php
Route::get('/metrics', fn () => response(Prometheus::renderText(), 200, ['Content-Type' => 'text/plain']))
    ->middleware('auth.basic.once'); // or an allowlist middleware for the Prometheus container IP
```

### 9.4 Mail-delivery monitoring
```php
// EventServiceProvider
Event::listen(\Illuminate\Mail\Events\MessageSent::class, function ($e) {
    Log::channel('stderr')->info('mail.sent', [
        'to' => collect($e->message->getTo())->keys()->all(),
        'subject' => $e->message->getSubject(),
    ]);
});
Event::listen(\Illuminate\Mail\Events\MessageSending::class, /* increment a counter */);
```
- Alert in Loki on absence: `count_over_time({container="app"} |= "mail.sent" [1h]) == 0` during business hours.
- Add an hourly synthetic "send to a monitored mailbox" job with its own Kuma push.
- If using SES/Postmark/Mailgun, wire the **bounce/complaint webhook** to a controller that logs + increments a `mail_bounces_total` counter.

---

## 10. Storage, retention & Synology strategy

| Data | Lives on | Retention | Backup to Synology |
|---|---|---|---|
| Prometheus TSDB | Proxmox VM **SSD** (never NFS - I/O latency = scrape gaps) | 30 d (`--storage.tsdb.retention.time=30d`), ~2-8 GB | Nightly `restic` snapshot of the volume to an NFS share; or Proxmox Backup Server |
| Loki chunks + index | Proxmox VM SSD | 30 d (compactor `retention_period: 720h`), ~0.5-3 GB/mo | Nightly `restic` to NAS; **or** set Loki `object_store` to MinIO running on the NAS (Loki's write pattern tolerates it) |
| GlitchTip Postgres | Proxmox VM SSD | 90 d events (`GLITCHTIP_MAX_EVENT_LIFE_DAYS=90`) | Nightly `pg_dump` to NAS |
| Grafana config DB (SQLite) | Proxmox VM SSD | n/a | Nightly file copy + export dashboards as JSON to git |
| Uptime Kuma (SQLite) | Proxmox VM SSD | Kuma keeps rolling history; a few MB | Nightly file copy to NAS |
| Laravel `daily` log files | App volume | 14 d (`'days' => 14`) | Covered by app backup |
| Pulse MariaDB | Proxmox VM SSD | Pulse trims automatically (`PULSE_RETENTION` days) | Nightly `mysqldump` to NAS |

**Synology roles:** (1) backup target via an NFS/CIFS share consumed by `restic`/Proxmox Backup Server; (2) optionally run MinIO (Container Manager) as Loki's object store; (3) optionally run the *external-ish* pieces (a second Uptime Kuma instance) so a Proxmox-cluster-wide outage still has a monitor alive on the NAS. Do **not** put active Prometheus/Loki write paths on NAS spinning disks.

Total steady-state disk on the Proxmox side: **~30-50 GB**. Total RAM: **~2-4 GB** (Prometheus ~0.5, Grafana ~0.3, Loki ~0.3, Alloy ~0.1, Kuma ~0.25, GlitchTip stack ~1.0, exporters ~0.2).

---

## 11. Setup effort & ongoing maintenance (recommended blend)

**Initial (roughly half a day to a day):**
1. `docker compose up` the monitoring project; put Grafana/Kuma/GlitchTip behind your reverse proxy with auth. (~1-2 h)
2. GlitchTip: create org + project, copy DSN, `composer require sentry/sentry-laravel`, wire `withExceptions`. Trigger a test exception. (~30 min)
3. Loki/Alloy: mount the Docker socket, drop in `config.alloy`, confirm logs land in Grafana Explore. Tune the multiline regex to your log format. (~1-2 h)
4. Prometheus: add exporters, `spatie/laravel-prometheus`, `/metrics` route + auth, import Grafana dashboards 1860 (node), 14282 (cAdvisor), a Laravel/Horizon board. Write the ~8 alert rules. (~2-3 h)
5. Uptime Kuma: add HTTP monitors for `/up` and `/health` (keyword `"status":"ok"`), TLS monitor, two push monitors for scheduler + queue. Wire notifications (email + Telegram/Slack). (~30 min)
6. Better Stack (free): one external HTTP monitor on the public URL + one heartbeat for the scheduler. Point on-call notification at your phone. (~15 min)
7. Cloudflare Web Analytics: enable for the domain / paste beacon. (~10 min)
8. Alertmanager: route critical -> phone/Telegram, warning -> email/Slack. (~30 min)

**Ongoing (~1-2 h/month):**
- Bump image tags monthly (`louislam/uptime-kuma:2`, `grafana/*:latest` pinned to a minor, `glitchtip/glitchtip:v6`, `prom/*`).
- Skim Loki disk usage and alert noise; adjust rules.
- Verify backups restore quarterly.
- GlitchTip and Loki self-prune; nothing manual.

**Where complexity concentrates:** the Alloy log pipeline (multiline stack-trace stitching, label cardinality) and writing good Prometheus alert expressions. Everything else is web-UI or copy-paste.

---

## 12. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Monitoring runs on the same Proxmox cluster it watches - a cluster outage blinds you | Better Stack **free** external monitor + external heartbeat; optionally a second Kuma on the Synology |
| Loki/GlitchTip outage stalls the app if logging is synchronous | Log to stdout + Alloy (async); Sentry SDK sends out-of-band; `ignore_exceptions` guarded; never a blocking `loki` Monolog handler on the hot path |
| SQLite `database is locked` under concurrency | Loki alert on `SQLITE_BUSY`/`database is locked` rate; ensure WAL mode + sensible `busy_timeout`; watch `laravel_sqlite_db_size_bytes` growth |
| Telescope accidentally enabled in prod | `Telescope::stopRecording()` in `register()` when `environment('production')`; no route exposed |
| Alert fatigue | `for:` durations on rules, Alertmanager grouping/inhibition, severity-based routing (phone vs email) |
| Metric label cardinality blows up Prometheus/Loki | Keep labels bounded (no user IDs / request IDs as labels; put those in log *body*) |
| Hosted Sentry free 5k errors/mo cap (if you choose it over GlitchTip) | Set `SENTRY_TRACES_SAMPLE_RATE` low, add `before_send` rate-limiting, or self-host GlitchTip (recommended) |

---

## 13. Sources

- [Sentry Pricing 2026 - Last9](https://last9.io/blog/sentry-pricing/)
- [Sentry Pricing 2026 - ToolPick](https://www.toolpick.dev/pricing/sentry)
- [Sentry Pricing 2026 - Markaicode](https://markaicode.com/pricing/sentry-pricing/)
- [Self-hosted Sentry - official](https://develop.sentry.dev/self-hosted/)
- [Self-Hosted Sentry in 2026: requirements & review - Sam James](https://www.samdjames.uk/blog/sentry-local-install/)
- [Self-Hosted Sentry System Requirements - DeepWiki](https://deepwiki.com/getsentry/self-hosted/3.1-system-requirements)
- [How to Run Sentry in Docker - OneUptime](https://oneuptime.com/blog/post/2026-02-08-how-to-run-sentry-in-docker-for-error-tracking/view)
- [GlitchTip vs Sentry - selfhosting.sh](https://selfhosting.sh/compare/glitchtip-vs-sentry/)
- [GlitchTip vs Exceptionless vs Sentry 2026 - Pi Stack](https://www.pistack.xyz/posts/2026-04-23-glitchtip-vs-exceptionless-vs-sentry-self-hosted-error-tracking-2026/)
- [Self-Host Sentry or GlitchTip 2026 - DanubeData](https://danubedata.ro/blog/self-host-sentry-glitchtip-error-tracking-2026)
- [10 Best Sentry Alternatives in 2026 - OneUptime](https://oneuptime.com/blog/post/2026-03-12-10-best-sentry-alternatives-2026/view)
- [Better Stack Review 2026: Pricing - CubeAPM](https://cubeapm.com/blog/betterstack-pricing-review/)
- [Better Stack Pricing 2026 - StackScored](https://www.stackscored.com/pricing/uptime-monitoring/better-stack/)
- [Better Stack Pricing Explained 2026 - Nurbak](https://nurbak.com/en/blog/betterstack-pricing/)
- [Better Stack Pricing - Modern DataTools](https://www.modern-datatools.com/tools/better-stack/pricing)
- [Healthchecks.io Pricing 2026 - Capterra](https://www.capterra.com/p/249957/Healthchecksio/pricing/)
- [Healthchecks.io vs alternatives pricing - Drumbeats](https://drumbeats.io/blog/drumbeats-vs-healthchecks-io-pricing-features-comparison)
- [Healthchecks.io Review 2026 - MakerStack](https://makerstack.co/reviews/healthchecksio-review/)
- [Uptime Kuma - official site](https://uptime.kuma.pet/)
- [Self-Hosted Uptime Monitoring 2026: Uptime Kuma - Valebyte](https://valebyte.com/en/blog/self-hosted-uptime-monitoring-2026-uptime-kuma-and-what-to-run-around-it/)
- [How to Run Uptime Kuma in Docker - OneUptime](https://oneuptime.com/blog/post/2026-02-08-how-to-run-uptime-kuma-in-docker-for-status-monitoring/view)
- [Uptime Kuma Self-Hosting Guide - AiCybr](https://aicybr.com/blog/uptime-kuma-self-hosting-monitoring-operations-guide)
- [sebastianpopp/laravel-uptime-kuma-push - GitHub](https://github.com/sebastianpopp/laravel-uptime-kuma-push)
- [daun/laravel-uptime-ping - Packagist](https://packagist.org/packages/daun/laravel-uptime-ping)
- [Laravel Health Checks and Uptime Monitoring Guide 2026 - Khimananda](https://khimananda.com/blog/laravel-health-checks-and-uptime-monitoring)
- [spatie/laravel-prometheus - GitHub](https://github.com/spatie/laravel-prometheus)
- [Laravel Horizon Prometheus Exporter - Laravel News](https://laravel-news.com/horizon-prometheus)
- [arquivei/laravel-prometheus-exporter - GitHub](https://github.com/arquivei/laravel-prometheus-exporter)
- [bureaupartners/laravel-loki-logging - Packagist](https://packagist.org/packages/bureaupartners/laravel-loki-logging)
- [alexmacarthur/laravel-loki-logging - GitHub](https://github.com/alexmacarthur/laravel-loki-logging)
- [How to: Laravel Grafana Logging - Sudorealm](https://sudorealm.com/blog/how-to-laravel-grafana-logging)
- [Migrate from Promtail to Grafana Alloy - Grafana docs](https://grafana.com/docs/alloy/latest/set-up/migrate/from-promtail/)
- [Grafana Alloy Log Collection with Loki 2026 - GnTech](https://blog.gntech.me/posts/2026-05-14-grafana-alloy-log-collection/)
- [Send log data to Loki - Grafana docs](https://grafana.com/docs/loki/latest/send-data/)
- [What's Included in Grafana Cloud Free - Grafana Labs](https://grafana.com/products/cloud/free-tier/)
- [Grafana Cloud free plan limits 2026 - CostBench](https://costbench.com/software/observability/grafana-cloud/free-plan/)
- [Grafana Cloud Pricing 2026 - CloudZero](https://www.cloudzero.com/blog/grafana-cloud-pricing/)
- [Cloudflare Web Analytics in 2026 - Spilno](https://spilnoagency.com.ua/en/instructions-us/cloudflare-web-analytics-2026)
- [Free, privacy-first analytics - Cloudflare Blog](https://blog.cloudflare.com/free-privacy-first-analytics-for-a-better-web/)
- [Cloudflare Analytics product page](https://www.cloudflare.com/en-in/application-services/products/analytics/)
- [Laravel Telescope vs Pulse vs Nightwatch 2026 - Deploynix](https://deploynix.io/blog/laravel-telescope-vs-pulse-vs-nightwatch-2026-which-should-you-use)
- [Laravel Telescope in production - the honest answer - Night Owl](https://usenightowl.com/learn/laravel-telescope-in-production/)
- [Monitoring Laravel Telescope Prune in Production - Crontinel](https://crontinel.com/use-cases/monitor-telescope-prune/)
- [Announcing Laravel Pulse - Laravel News](https://laravel-news.com/announcing-laravel-pulse)
- [Laravel Pulse - official](https://pulse.laravel.com/)
- [laravel/pulse - Packagist](https://packagist.org/packages/laravel/pulse)
