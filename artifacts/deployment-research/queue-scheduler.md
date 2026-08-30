# Queue & Scheduler Research - Laravel 13 + SQLite (Docker on Proxmox)

Research date: 2026-08-30
App context: Laravel 13, PHP 8.3, Docker Compose on a single Proxmox host/VM, SQLite as the
production database, 50-200 users, budget < $50/mo.

Workloads in scope:

- **Registration alert emails** - queued, not latency critical (a minute or two of delay is fine).
- **Calendar event reminders** - time sensitive, dispatched from a scheduler that runs every
  minute, following a 3-day / 1-day / 15-minute offset pattern.

---

## 0. TL;DR / Top pick

**Use the native `database` queue driver on a _dedicated_ SQLite file (separate from the app
database), with WAL mode + `busy_timeout`, a single `queue:work` worker container, and a
separate `schedule:work` scheduler container.** Add `romanzipp/laravel-queue-monitor` (or
Laravel Pulse) for dashboard visibility and a `Queue::failing()` hook for failure alerts.

Why this wins for this specific workload:

- The volume is tiny (realistically < 100 emails/minute at absolute peak, usually a handful per
  hour). SQLite's single-writer limit is never the bottleneck - the SMTP provider is.
- No new infrastructure, no new daemon to patch/monitor, matches the stated SQLite preference.
- Jobs are **persisted to disk**, so a container restart or host reboot does not lose queued
  reminders (unlike Beanstalkd).
- A dedicated queue DB isolates the queue's write churn from web-request writes, which is the
  main thing that makes the SQLite queue driver misbehave.

**Fallback / upgrade path:** self-hosted Redis in Docker. Switch to it the day you add a second
app server, need Laravel Horizon, or start pushing thousands of jobs/minute. It is a
one-line `QUEUE_CONNECTION` change.

**Do not** run multiple queue workers against one SQLite file, and **do not** use the `sync`
driver for the reminder emails (a slow SMTP call would block the web request or the scheduler
tick).

---

## 1. SQLite fundamentals that drive every option below

These apply to options 1 and 4 (anything that touches SQLite for queue state). They are the
"don't sugarcoat it" section.

### 1.1 One writer. Globally. Always.

SQLite takes a **database-level write lock**, not a row-level or table-level lock. At any
instant exactly one connection can be writing to a given database file. Every other writer
either waits (up to `busy_timeout`) or fails with `SQLITE_BUSY` -> PHP sees
`database is locked` / `database table is locked`.

A single queue job touches the DB **2-3 times**:

1. `INSERT` into `jobs` when dispatched.
2. `UPDATE jobs SET reserved_at = ? WHERE id = ?` when a worker picks it up.
3. `DELETE FROM jobs WHERE id = ?` on success (or `UPDATE` to release/retry on failure).

With one worker and a low-traffic web app this serializes fine. With **two or more workers**,
or a write-heavy web request landing at the same moment, these operations collide and you get
`database is locked` exceptions. When step 3 fails after the handler already ran, the job is
retried -> **duplicate email**. This is the core risk.

### 1.2 WAL mode helps readers vs writers, NOT writers vs writers

`PRAGMA journal_mode = WAL` (write-ahead logging) means:

- Readers never block writers and writers never block readers (readers see a consistent
  snapshot; writes append to a `-wal` sidecar file).
- **Writers still block writers.** There is still exactly one writer at a time. This constraint
  never goes away.

WAL is mandatory for any production SQLite use, but it does not make the queue driver
concurrent-write-safe.

### 1.3 `busy_timeout` - necessary but not sufficient

`PRAGMA busy_timeout = 5000` (ms) tells SQLite to spin-retry a locked write for up to N ms
before throwing. Set it to **5000-10000 ms** for the queue DB. It papers over brief
contention.

It does **not** rescue the classic failure: a transaction that starts as a read (`BEGIN
DEFERRED`, SQLite's default) and then tries to upgrade to a write while another connection
holds the write lock -> immediate `SQLITE_BUSY`, `busy_timeout` is ignored for lock upgrades.

### 1.4 `BEGIN IMMEDIATE` and Laravel 11+

The deferred-to-immediate lock-upgrade deadlock is mitigated in modern Laravel: since Laravel
11 the SQLite driver issues write transactions as `BEGIN IMMEDIATE` (acquires the write lock
up front). Laravel 13 keeps this. Two workers will therefore not both reserve the same job -
but the losing worker still eats a lock-timeout exception rather than gracefully skipping the
row, because...

### 1.5 No `SELECT ... FOR UPDATE`, no `SKIP LOCKED` on SQLite

On MySQL 8 / PostgreSQL 9.5+, Laravel's database queue driver uses
`SELECT ... FOR UPDATE SKIP LOCKED` so concurrent workers cleanly step over each other's
reserved rows. **SQLite supports neither.** Laravel's `lockForUpdate()` compiles to an empty
string on SQLite. Concurrency correctness rests entirely on the conditional
`UPDATE ... WHERE reserved_at IS NULL` inside the immediate transaction. It is *correct* (no
double-reserve) but *not graceful* (the loser throws instead of skipping).

Net: **the SQLite queue driver is a single-worker design.** Treat >1 worker as unsupported.

### 1.6 Polling, not push

The database driver polls: the worker runs a `SELECT` every `--sleep` seconds. It is not
event-driven like Redis `BLPOP` or Beanstalkd `reserve`. Minimum pickup latency ~= the sleep
interval. On local SSD, polling once per second is negligible load, so use `--sleep=1` for the
time-sensitive reminders.

### 1.7 Multi-container / multi-host

Every container that opens the SQLite file (web, worker, scheduler) must run **on the same
host** against a **real local filesystem** (Docker named volume or same-host bind mount).
**NFS / network filesystems break SQLite locking** - never do it. This rules SQLite out the
moment you need a second app node.

### 1.8 Backups with WAL

Naive `cp queue.sqlite backup.sqlite` while the app is running can miss data still in the
`-wal` file. Use one of:

- `sqlite3 queue.sqlite ".backup '/backups/queue-$(date +%F).sqlite'"`
- `VACUUM INTO '/backups/queue.sqlite';`
- Litestream sidecar for continuous replication (overkill for a queue DB you can afford to
  lose).

For a *dedicated queue DB* this barely matters - a lost queue DB just means "unsent reminders
in the last few minutes", which the catch-up logic (section 6.4) re-generates anyway.

---

## 2. Workload sizing - how much throughput do we actually need?

| Metric | Estimate |
| --- | --- |
| Users | 50-200 |
| Registration alerts | a few per day, bursty at launch; not latency sensitive |
| Calendar events per user per day | assume generous 1-2 |
| Reminders per event | 3 (3-day, 1-day, 15-min) |
| Total reminder emails/day (200 users x 2 events x 3) | ~1,200/day |
| Average | ~1/minute |
| Realistic peak (top of the hour clustering) | 20-60/minute |
| Pathological peak (everyone books 9:00 AM) | maybe 200 in one minute |

**One `queue:work` process sends 1-5 emails/second** in practice, gated almost entirely by the
SMTP round-trip (Postmark/SES/Mailgun ~200-500 ms each, or slower). That is **60-300
emails/minute** with a single worker. SQLite enqueue/dequeue on local SSD handles **hundreds
of jobs/second** with one writer - three orders of magnitude more headroom than this workload
needs.

**Conclusion: any of the four options can move this volume. The decision is about operational
complexity, failure semantics, and monitoring - not throughput.**

---

## 3. Option 1 - Native `database` driver on SQLite

### 3.1 Two sub-variants

**1a. Same SQLite file as the app database.** Simplest. But every job insert/reserve/delete
competes for the *same single write lock* as every web request write. A burst of signups +
reminder dispatch + a worker = `database is locked` noise.

**1b. Dedicated SQLite file for the queue (RECOMMENDED variant).** A second connection
(`sqlite_queue`) pointing at `database/queue.sqlite`. Queue write churn no longer contends with
app writes. Each file still has its own single writer, but now the queue's writer only fights
*other queue writers* (i.e. only matters if you run >1 worker, which you should not). Failed
jobs table lives here too, keeping that noise isolated. Downside: you cannot wrap an app-data
write and a job insert in one transaction, so you must mark jobs `->afterCommit()` (or set
`after_commit => true`) to avoid dispatching a job that references an uncommitted row.

### 3.2 SQLite compatibility / limitations

See section 1 in full. Summary: works, is *correct* with one worker, degrades to exceptions
and possible duplicate sends with concurrent writers. WAL + `busy_timeout` required. No
`SKIP LOCKED`. Single host only.

### 3.3 Throughput for this workload

More than enough. One worker: 60-300 emails/minute (SMTP-bound). SQLite is not the limiter.
If you ever need more, you scale the *SMTP concurrency*, not SQLite - and at that point move to
Redis.

### 3.4 Failure handling

- `--tries=3` + per-job `public $backoff = [30, 60, 120];` (or `--backoff=30`).
- After max attempts -> row written to `failed_jobs` table.
- `php artisan queue:failed` to list, `queue:retry {uuid|all}`, `queue:forget {uuid}`,
  `queue:flush`.
- `php artisan queue:prune-failed --hours=168` on a weekly schedule.
- No native dead-letter queue; the `failed_jobs` table *is* the DLQ.
- Register an alert in `AppServiceProvider::boot()`:
  ```php
  use Illuminate\Support\Facades\Queue;
  use Illuminate\Queue\Events\JobFailed;

  Queue::failing(function (JobFailed $event) {
      // notify Slack / email / Sentry with $event->job, $event->exception
  });
  ```
- `--max-time=3600` so the worker restarts hourly (frees memory, picks up new code after
  deploy). The container's `restart: unless-stopped` brings it back.
- `--rest=0` and `--sleep=1` for prompt pickup.
- Set a sane `timeout` (`--timeout=60`); must be less than the connection's `retry_after`
  (default 90s) or a job can be retried while still running.

### 3.5 Monitoring visibility

The database driver has **no built-in dashboard** (Horizon is Redis-only). Options:

- **`romanzipp/laravel-queue-monitor`** - migration + `IsMonitored` trait on jobs; provides a
  Horizon-like UI for any driver, stores exceptions, progress, retry-from-UI. Actively
  maintained, works with the database driver. Best low-effort choice.
- **`cboxdk/laravel-queue-monitor`** - per-job CPU/memory/payload/exception/retry-chain
  tracking via Laravel's queue events; no Redis, no Horizon. Heavier, more analytics.
- **Laravel Pulse** (first-party) - has a "Queues" card (processed/failed/pending over time)
  that works with the database driver. Lightweight, also gives you slow queries / slow jobs /
  exceptions. Good if you want one general-purpose dashboard.
- **`php artisan queue:monitor database:default --max=100`** on the schedule - fires a
  `QueueBusy` event if backlog exceeds a threshold; wire it to an alert.
- Raw: `SELECT count(*) FROM jobs;` and `SELECT count(*) FROM failed_jobs;`.

### 3.6 Docker Compose service definition

```yaml
services:
  app: # php-fpm / octane, serves HTTP
    build: .
    volumes:
      - app-code:/var/www/html
      - sqlite-data:/var/www/html/database   # holds database.sqlite AND queue.sqlite
    environment:
      DB_CONNECTION: sqlite
      DB_DATABASE: /var/www/html/database/database.sqlite
      QUEUE_CONNECTION: database
    restart: unless-stopped

  queue-worker:
    build: .
    command: >
      php artisan queue:work database
      --queue=reminders,default
      --sleep=1 --tries=3 --backoff=30
      --max-time=3600 --timeout=60
    volumes:
      - app-code:/var/www/html
      - sqlite-data:/var/www/html/database
    environment:
      DB_CONNECTION: sqlite
      DB_DATABASE: /var/www/html/database/database.sqlite
      QUEUE_CONNECTION: database
    stop_signal: SIGTERM      # let the worker finish the current job
    stop_grace_period: 65s    # >= --timeout so in-flight job can complete
    restart: unless-stopped
    depends_on: [app]

  scheduler:
    build: .
    command: php artisan schedule:work
    volumes:
      - app-code:/var/www/html
      - sqlite-data:/var/www/html/database
    environment:
      DB_CONNECTION: sqlite
      DB_DATABASE: /var/www/html/database/database.sqlite
      QUEUE_CONNECTION: database
    restart: unless-stopped
    depends_on: [app]

volumes:
  app-code:
  sqlite-data:
```

`config/database.php` (Laravel 11+ accepts these pragma keys natively):

```php
'sqlite' => [
    'driver' => 'sqlite',
    'database' => env('DB_DATABASE', database_path('database.sqlite')),
    'foreign_key_constraints' => true,
    'busy_timeout' => 5000,
    'journal_mode' => 'WAL',
    'synchronous' => 'NORMAL',
],

// Dedicated queue DB (variant 1b)
'sqlite_queue' => [
    'driver' => 'sqlite',
    'database' => database_path('queue.sqlite'),
    'foreign_key_constraints' => false,
    'busy_timeout' => 10000,
    'journal_mode' => 'WAL',
    'synchronous' => 'NORMAL',
],
```

`config/queue.php`:

```php
'database' => [
    'driver' => 'database',
    'connection' => 'sqlite_queue',   // omit / null to use the default connection (variant 1a)
    'table' => 'jobs',
    'queue' => 'default',
    'retry_after' => 90,
    'after_commit' => true,           // important when job + app data are in different DBs
],

'failed' => [
    'driver' => 'database-uuids',
    'database' => 'sqlite_queue',
    'table' => 'failed_jobs',
],
```

Create the tables: `php artisan make:queue-table`, `php artisan make:queue-failed-table`, then
`php artisan migrate` (add `--database=sqlite_queue` if the migration doesn't target it, or set
the connection in the migration).

### 3.7 Setup & maintenance complexity

**Low.** One migration, a few config keys, two extra containers (worker + scheduler). No new
daemon. Maintenance = weekly `queue:prune-failed`, occasional glance at the monitor dashboard,
and the failure alert hook. The one sharp edge is "never add a second worker."

### 3.8 Cost

**$0 marginal.** No extra RAM (worker/scheduler containers are just PHP, ~30-60 MB each). Only
cost is the transactional email provider, which is out of scope and cheap at this volume
(SES ~$0.10 per 1,000; Postmark free tier ~100/mo then ~$15/mo).

---

## 4. Option 2 - Self-hosted Redis in Docker

### 4.1 SQLite compatibility

N/A - Redis stores the queue in memory, entirely independent of the app's SQLite database. The
app database stays SQLite; only the queue moves to Redis. No locking interaction at all. This
is actually the cleanest separation: SQLite for durable domain data, Redis for ephemeral job
state.

### 4.2 Throughput

Vastly more than needed - tens of thousands of jobs/second, true blocking pop (`BLPOP`, no
polling latency), atomic reserve via Lua scripts, `SKIP LOCKED`-equivalent semantics for free.
Supports **multiple concurrent workers** with zero contention, so horizontal scaling is
trivial later.

### 4.3 Failure handling

- Same `--tries` / `--backoff` / `failed_jobs` model as the database driver (failed jobs are
  still recorded in a database table - point it at your SQLite DB or a dedicated one).
- `retry_after` + `block_for` (Redis-specific): `block_for => 5` makes the worker block up to
  5s waiting for a job instead of polling - efficient and responsive. Do **not** set
  `block_for => 0` (blocks forever, breaks signal handling / graceful shutdown).
- Redis persistence: enable **AOF** (`appendonly yes`, `appendfsync everysec`) so a Redis
  container restart loses at most ~1s of jobs. With only RDB snapshots you can lose minutes of
  jobs on crash. This is the one thing to get right.
- Reserved jobs whose worker died are returned to the queue after `retry_after` seconds.

### 4.4 Monitoring visibility

**Best in class.** **Laravel Horizon** (first-party, Redis-only): real-time throughput graphs,
job/queue counts, wait times, failed jobs with stack traces + retry button, tags, per-queue
config, `horizon:snapshot` metrics, notifications on long wait times. This is the single
biggest reason to pick Redis. Also works with Pulse.

Horizon needs its own long-running process (`php artisan horizon`) - it replaces
`queue:work` and manages worker pools itself.

### 4.5 Docker Compose service definition

```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --appendfsync everysec --maxmemory 256mb --maxmemory-policy noeviction
    volumes:
      - redis-data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  horizon:
    build: .
    command: php artisan horizon
    volumes:
      - app-code:/var/www/html
      - sqlite-data:/var/www/html/database
    environment:
      QUEUE_CONNECTION: redis
      REDIS_HOST: redis
    stop_signal: SIGTERM
    stop_grace_period: 65s
    restart: unless-stopped
    depends_on:
      redis: { condition: service_healthy }

  scheduler:
    build: .
    command: php artisan schedule:work
    volumes:
      - app-code:/var/www/html
      - sqlite-data:/var/www/html/database
    environment:
      QUEUE_CONNECTION: redis
      REDIS_HOST: redis
    restart: unless-stopped
    depends_on:
      redis: { condition: service_healthy }

volumes:
  app-code:
  sqlite-data:
  redis-data:
```

`maxmemory-policy noeviction` is deliberate - you never want Redis silently dropping queued
jobs under memory pressure; you want writes to error instead so you notice.

### 4.6 Setup & maintenance complexity

**Medium.** One more stateful service to run, patch (Redis CVEs), back up (the AOF file),
monitor (memory, `INFO persistence`), and secure (bind to the compose network only, set
`requirepass`, never expose 6379 to the host/internet). Horizon config file to tune. Still
very manageable for one host, and the payoff (Horizon + multi-worker + future multi-node) is
real.

### 4.7 Cost

**$0 marginal** on the existing Proxmox host. Redis Alpine container idles at ~5-10 MB, cap it
at 256 MB. No managed service needed. (A managed Redis like Upstash/Redis Cloud free tier
would also fit the budget, but self-hosting is the stated preference and avoids an external
dependency.)

---

## 5. Option 3 - Beanstalkd in Docker

### 5.1 SQLite compatibility

N/A, like Redis - independent job store. App DB stays SQLite. `failed_jobs` still goes to a
database table.

### 5.2 Throughput

Plenty - thousands of jobs/second, true `reserve` (blocking, no polling), built-in per-tube
priorities, delays, and TTR (time-to-run) that maps cleanly onto Laravel's retry model.
Multiple workers supported with no contention. Extremely light: the daemon is a single ~2 MB C
binary, ~5 MB RAM.

### 5.3 Failure handling - the dealbreaker

- Beanstalkd's binlog persistence (`-b /data -f`) exists but is **not** as battle-tested or as
  safe as Redis AOF. The widely repeated caution: **removing, rebuilding, or restarting the
  container can lose every queued, reserved, and buried job with no recovery** unless the
  binlog is enabled *and* on a persistent volume *and* fsync is frequent. Even then, "buried"
  (failed) jobs living only in the beanstalkd daemon are fragile.
- Laravel maps failures to the `failed_jobs` DB table on final failure, so *permanently* failed
  jobs are safe - but jobs sitting in the queue or mid-retry when the daemon dies are gone.
- For **time-sensitive calendar reminders that must survive a container restart**, this is the
  wrong trade. The whole point of not using `sync` is durability.

### 5.4 Monitoring visibility

**Weak.** No first-party Laravel dashboard. Third-party web UIs exist (`beanstalkd-console`,
`aurora`) but they are unmaintained-ish and show raw tube stats, not Laravel job context. You
would lean on `romanzipp/laravel-queue-monitor` / Pulse for job-level visibility (same as the
database driver) plus `beanstalkd`'s `stats` command for tube depth. Net: no better than the
database driver on visibility, and you've added a daemon.

### 5.5 Docker Compose service definition

```yaml
services:
  beanstalkd:
    image: schickling/beanstalkd   # or build a 5-line Alpine image with `beanstalkd`
    command: beanstalkd -b /data -f 0   # -b enables binlog, -f 0 = fsync every write (slow but safe)
    volumes:
      - beanstalkd-data:/data
    restart: unless-stopped

  queue-worker:
    build: .
    command: php artisan queue:work beanstalkd --queue=reminders,default --sleep=1 --tries=3 --max-time=3600
    volumes:
      - app-code:/var/www/html
      - sqlite-data:/var/www/html/database
    environment:
      QUEUE_CONNECTION: beanstalkd
      BEANSTALKD_HOST: beanstalkd
      BEANSTALKD_PORT: "11300"
    restart: unless-stopped
    depends_on: [beanstalkd]

  scheduler:
    build: .
    command: php artisan schedule:work
    volumes:
      - app-code:/var/www/html
      - sqlite-data:/var/www/html/database
    environment:
      QUEUE_CONNECTION: beanstalkd
      BEANSTALKD_HOST: beanstalkd
    restart: unless-stopped

volumes:
  app-code:
  sqlite-data:
  beanstalkd-data:
```

Requires `composer require pda/pheanstalk`.

### 5.6 Setup & maintenance complexity

**Medium** - another daemon, but simpler than Redis (no memory tuning, no auth story worth
speaking of - just keep port 11300 off the host). The catch is you pay that complexity and get
*worse* durability and *no better* monitoring than option 1.

### 5.7 Cost

**$0 marginal.** ~5 MB RAM. Cheapest of the external-broker options.

---

## 6. Option 4 - `sync` driver

### 6.1 What it does

`QUEUE_CONNECTION=sync` executes the job **inline, in the dispatching process**, immediately.
No `jobs` table, no worker, no broker.

### 6.2 SQLite compatibility

Perfect - there is no queue state. But irrelevant, because...

### 6.3 Why it's wrong for the email workloads

- **Registration alert**: the SMTP call (200 ms-2 s, or a timeout of 30 s if the provider is
  down) happens *inside the HTTP request* that created the registration. The user waits. A mail
  provider hiccup becomes a 500 on signup.
- **Calendar reminders**: dispatched from the scheduler tick. With `sync`, sending 60 reminders
  takes 60 x ~0.5 s = 30 s of the `schedule:run` minute, single-threaded, and any one slow send
  stalls the rest. `withoutOverlapping` then blocks the next minute's tick. The 15-minute
  reminder's timeliness degrades under exactly the load where it matters.
- No retry, no `failed_jobs`, no backoff. A transient SMTP failure = lost email, full stop.
- No monitoring - nothing to monitor.

### 6.4 When `sync` *would* be acceptable

Only if you moved the actual sending off the request path anyway: e.g. the scheduler runs a
command that does the SMTP calls directly with its own try/catch + a `sent_at` column for
idempotency, and registration alerts are also batched into that command rather than dispatched
on signup. At that point you've hand-rolled a worse queue. Not worth it. `sync` is fine for
local dev and tests; not for this.

### 6.5 Cost / complexity

Zero infrastructure, but you inherit reliability and latency problems that cost more in
incidents than a worker container costs to run.

---

## 7. The scheduler

### 7.1 How Laravel's scheduler works

- You define tasks in `routes/console.php` (or `bootstrap/app.php` `->withSchedule(...)`).
- **One** OS-level trigger runs `php artisan schedule:run` every minute. That command checks
  which tasks are due *this minute* and runs them.
- `schedule:run` is **stateless about the past**: if it doesn't run for 10 minutes, those 10
  minutes of `everyMinute()` tasks simply never fire. **Laravel does not catch up missed
  runs.** (This is the key fact for "what if the container restarts".)
- Sub-minute tasks (`everyTenSeconds()`, etc.): when any are defined, `schedule:run` stays
  resident until the end of the minute, re-checking. Docs recommend sub-minute tasks only
  *dispatch* queued jobs / background commands, never do the work inline.

### 7.2 Four ways to run it in Docker

| Approach | How | Verdict for this app |
| --- | --- | --- |
| **Dedicated `schedule:work` container** | `command: php artisan schedule:work`, `restart: unless-stopped`. `schedule:work` sleeps until the top of each minute, then invokes `schedule:run`. No cron needed. | **Recommended.** Simplest. One process, clean SIGTERM, container restart policy handles crashes. Officially supported (not "local only" folklore - it works fine in containers). |
| **cron inside a container** | Install `cron`/`cronie` in the image, `* * * * * cd /app && php artisan schedule:run >> /proc/1/fd/1 2>&1`, run `crond -f` as PID 1. | Works, "canonical". More moving parts (cron package, log plumbing, PID 1 semantics). Choose this only if you already trust cron and want top-of-minute exactness. |
| **Supervisor running both scheduler + workers in one container** | `supervisord` with a `[program:scheduler]` running `schedule:work` and `[program:worker]` running `queue:work`, `autorestart=true`. | Fine if you dislike having 2-3 tiny containers. Supervisor restarts crashed processes and gives one place to check status. Slightly heavier image. Reasonable alternative. |
| **Host cron -> `docker compose exec`** | Proxmox host crontab calls `docker compose exec app php artisan schedule:run`. | Avoid. Couples host to compose, brittle across redeploys, exec into a running container each minute. |

**Pick: dedicated `schedule:work` container.** If you want fewer containers, fold the scheduler
and the single worker into one Supervisor container.

`schedule:work` vs a raw bash `while true; do php artisan schedule:run; sleep 60; done`: the
bash loop drifts (fires 60 s after start, not on the minute) and re-bootstraps oddly; prefer
`schedule:work`, which aligns to the minute boundary.

### 7.3 Supervisor config (if consolidating)

```ini
; /etc/supervisor/conf.d/laravel.conf
[supervisord]
nodaemon=true

[program:scheduler]
command=php /var/www/html/artisan schedule:work
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:worker]
command=php /var/www/html/artisan queue:work database --queue=reminders,default --sleep=1 --tries=3 --backoff=30 --max-time=3600 --timeout=60
autostart=true
autorestart=true
stopwaitsecs=70
numprocs=1            ; DO NOT raise this with SQLite
stdout_logfile=/dev/stdout
stderr_logfile=/dev/stderr
```

### 7.4 Calendar reminders - the 3-day / 1-day / 15-minute pattern

**Do not schedule three separate cron-like tasks per event.** Instead: one command that runs
`everyMinute()` and reconciles what should have gone out by now. This is what makes missed
runs harmless.

**Schema - an idempotency ledger:**

```
event_reminders
  id
  calendar_event_id   (FK)
  offset_label        enum: '3d','1d','15m'   -- or store offset_minutes int
  send_after          datetime  -- event.start_at minus the offset
  sent_at             datetime nullable
  UNIQUE (calendar_event_id, offset_label)
```

Rows are created when an event is created/rescheduled (and deleted/recomputed on reschedule).
`send_after = start_at->copy()->subMinutes(offset)`.

**The dispatcher command (`reminders:dispatch`), scheduled every minute:**

```php
// routes/console.php
Schedule::command('reminders:dispatch')
    ->everyMinute()
    ->withoutOverlapping(5)      // lock auto-expires after 5 min if the process is killed
    ->onOneServer();             // harmless with one host; future-proofs

// app/Console/Commands/DispatchReminders.php  (handle())
$now = now();
$catchUpFloor = $now->copy()->subMinutes(180);   // how far back we're willing to catch up

EventReminder::query()
    ->whereNull('sent_at')
    ->whereBetween('send_after', [$catchUpFloor, $now])
    ->with('calendarEvent')
    ->chunkById(200, function ($due) use ($now) {
        foreach ($due as $reminder) {
            // guard: never send a "reminder" for an event that already started
            if ($reminder->calendarEvent->start_at->isPast() && $reminder->offset_label !== '15m') {
                $reminder->update(['sent_at' => $now, 'skipped' => true]);
                continue;
            }
            // atomically claim, then dispatch
            $claimed = EventReminder::whereKey($reminder->id)
                ->whereNull('sent_at')
                ->update(['sent_at' => $now]);
            if ($claimed) {
                SendEventReminder::dispatch($reminder->id)->afterCommit();
            }
        }
    });
```

Key properties:

- **Idempotent**: the `UNIQUE` constraint + `whereNull('sent_at')->update()` claim means an
  event's `15m` reminder can be sent at most once, even if the command runs twice or overlaps.
- **Catch-up on missed runs**: because it selects a *window* (`send_after` between
  `now()-180min` and `now()`), a scheduler outage of up to 3 hours is invisible for the 3-day
  and 1-day reminders. For the 15-minute reminder, an outage longer than ~15 min means it goes
  out late (or is skipped by the `isPast()` guard) - acceptable; tune `catchUpFloor` and the
  guard to your tolerance.
- **Marking `sent_at` before dispatch** trades a rare "claimed but job later failed" (fixable
  via `failed_jobs` + the alert) against the worse "sent twice". If double-send is more
  tolerable than missed-send for your product, flip it: dispatch first, set `sent_at` in the
  job on success.
- The actual send is a **queued job** (`SendEventReminder`), so the scheduler tick returns in
  milliseconds regardless of how many reminders are due or how slow SMTP is.

**On event reschedule/cancel:** recompute or delete the `event_reminders` rows. If a row's
`sent_at` is already set, leave it (the old reminder went out) and create fresh rows for the
new time.

### 7.5 Handling missed scheduler runs / container restarts - summary

| Failure | Effect | Mitigation |
| --- | --- | --- |
| Scheduler container crashes & restarts in seconds | ~0-1 missed ticks | `restart: unless-stopped`; catch-up window absorbs it |
| Scheduler down for minutes (deploy, host reboot) | `everyMinute` tasks skipped for that span; **no auto catch-up** | Window-based reconciliation (7.4) makes 3d/1d reminders immune; 15m reminders go late or are guarded-skipped |
| Worker container down | Jobs pile up in `jobs` table (durable on disk), drain on restart | `restart: unless-stopped`; alert on `queue:monitor` backlog |
| `schedule:run` killed mid-task (SIGKILL) | `withoutOverlapping` cache lock can stick | `withoutOverlapping(5)` short TTL; run `php artisan schedule:clear-cache` in the container entrypoint |
| Deploy while `schedule:run` is mid-minute (sub-minute tasks) | Old code runs to end of minute | `php artisan schedule:interrupt` in the deploy script |
| Two schedulers accidentally running | Double dispatch | `->onOneServer()` (needs `database`/`redis`/`memcached` cache driver + shared cache) + the idempotency ledger |
| `withoutOverlapping` needs a cache | Uses default cache store | Use `database` or `file` cache driver (both fine with SQLite/one host); not `array` |

Also schedule housekeeping:

```php
Schedule::command('queue:prune-failed --hours=168')->weekly();
Schedule::command('queue:monitor database:default,database:reminders --max=200')->everyFiveMinutes();
Schedule::command('model:prune')->daily();          // if you prune old event_reminders
Schedule::command('schedule:clear-cache')->hourly(); // optional safety net
```

### 7.6 Scheduler monitoring

- **`spatie/laravel-schedule-monitor`** - logs every scheduled task start/finish/fail/skip to a
  table, `schedule-monitor:list` shows last-run + whether a task is overdue, integrates with
  Oh Dear for "task didn't run" alerts. Best option if reminder timeliness is important.
- **`->pingOnSuccess($url)` / `->pingOnFailure($url)` / `->emailOutputOnFailure()`** built in -
  point at a healthchecks.io / Oh Dear / Cronitor check URL; you get paged if the ping stops.
  Zero package, ~free.
- **Laravel Pulse** shows a "Scheduled Tasks"-adjacent view via slow-jobs/exceptions; less
  targeted.

For a < $50/mo budget: `->pingOnFailure()` + a healthchecks.io free check on the
`reminders:dispatch` task is enough to know the scheduler stopped.

---

## 8. Failure handling - cross-option reference

| Concern | database (SQLite) | Redis | Beanstalkd | sync |
| --- | --- | --- | --- | --- |
| Retries / backoff | yes (`--tries`, `$backoff`) | yes | yes (TTR) | none |
| Failed-job store (DLQ) | `failed_jobs` table | `failed_jobs` table | `failed_jobs` table | none |
| Retry from UI | via monitor pkg | Horizon button | via monitor pkg | n/a |
| Survives broker restart | **yes** (on disk) | yes *if AOF* | **risky** even with binlog | n/a |
| Survives worker crash | yes (`retry_after` re-queues) | yes | yes | n/a |
| Lost-job risk | duplicate-send under multi-worker contention | minimal | queued/buried jobs on container rebuild | every transient failure = lost email |
| Poison-job protection | `MaxExceptions`, `dontRetry([...])` | same | same | n/a |

---

## 9. Monitoring - cross-option reference

| | database (SQLite) | Redis | Beanstalkd |
| --- | --- | --- | --- |
| First-party dashboard | none (use Pulse or a pkg) | **Horizon** (rich) | none |
| Job counts / backlog | `queue:monitor`, SQL, pkg | Horizon, `queue:monitor` | `stats` cmd, pkg |
| Failure alerts | `Queue::failing()` hook, pkg | Horizon notifications, hook | hook, pkg |
| Throughput graphs | Pulse card | Horizon (native) | none |
| Per-job drill-down | `romanzipp`/`cboxdk` pkg | Horizon | pkg |
| Extra infra to get it | none | none (Horizon rides Redis) | none, but weak |

---

## 10. Setup / maintenance / cost - cross-option reference

| | database (SQLite, dedicated file) | Redis + Horizon | Beanstalkd | sync |
| --- | --- | --- | --- | --- |
| New daemons to run/patch/secure | 0 | 1 (Redis) | 1 (beanstalkd) | 0 |
| Extra containers | 2 (worker, scheduler) | 3 (redis, horizon, scheduler) | 3 | 1 (scheduler) |
| Config effort | low (2 migrations, pragmas) | medium (Horizon cfg, AOF, auth) | medium (pheanstalk, binlog) | trivial |
| Ongoing ops | prune-failed, glance at dash | + Redis mem/persistence checks | + daemon, fragile persistence | none |
| RAM overhead | ~0 | ~10-256 MB | ~5 MB | 0 |
| Marginal $/mo | $0 | $0 | $0 | $0 |
| Scales to 2nd app node | **no** | yes | yes | no |
| Multi-worker safe | **no** | yes | yes | n/a |

All four are comfortably under $50/mo (all $0 marginal on existing Proxmox hardware). Budget is
not a differentiator; the only real money is the transactional-email provider, which every
option shares.

---

## 11. Recommendation matrix

Scoring 1 (poor) - 5 (excellent) for *this* workload (50-200 users, SQLite preference, single
Proxmox host, time-sensitive reminders, small team).

| Criterion | Weight | database / SQLite (dedicated file) | Redis + Horizon | Beanstalkd | sync |
| --- | --- | --- | --- | --- | --- |
| Fits SQLite preference / no new infra | high | 5 | 3 | 3 | 5 |
| Throughput for workload | med | 5 | 5 | 5 | 2 |
| Durability (survives restart/reboot) | high | 5 | 4 (needs AOF) | 2 | 1 |
| Failure handling (retry/DLQ/alerts) | high | 4 | 5 | 4 | 1 |
| Monitoring visibility | med | 3 (with pkg/Pulse) | 5 (Horizon) | 2 | 1 |
| Reminder latency / timeliness | high | 4 | 5 | 5 | 2 |
| Setup complexity (lower = better) | med | 5 | 3 | 3 | 5 |
| Maintenance burden (lower = better) | med | 4 | 3 | 3 | 5 |
| Multi-worker / multi-node headroom | low | 1 | 5 | 4 | 1 |
| Cost | low | 5 | 5 | 5 | 5 |
| **Weighted overall** | | **~4.2 - best balance** | **~4.1 - close, more ops** | **~3.0** | **~2.2** |

---

## 12. Final recommendation

### Top pick: native `database` queue driver on a dedicated SQLite file

1. **Queue**: `QUEUE_CONNECTION=database`, `connection => 'sqlite_queue'` pointing at
   `database/queue.sqlite`, `after_commit => true`, WAL + `busy_timeout=10000` +
   `synchronous=NORMAL` on that connection.
2. **Exactly one** `queue:work` container:
   `queue:work database --queue=reminders,default --sleep=1 --tries=3 --backoff=30
   --max-time=3600 --timeout=60`, `restart: unless-stopped`, `stop_grace_period: 65s`.
   Never scale `numprocs` / add a second worker container against SQLite.
3. **Scheduler**: dedicated `php artisan schedule:work` container, `restart: unless-stopped`.
   (Or fold worker + scheduler into one Supervisor container if you prefer fewer services.)
4. **Reminders**: `event_reminders` idempotency ledger + a single `reminders:dispatch`
   command scheduled `->everyMinute()->withoutOverlapping(5)->onOneServer()` that reconciles a
   time *window*, claims each row with a conditional `UPDATE`, and dispatches a queued
   `SendEventReminder` job. This makes missed scheduler runs harmless for the 3-day/1-day
   reminders and bounded for the 15-minute one.
5. **Monitoring**: `romanzipp/laravel-queue-monitor` **or** Laravel Pulse for the queue
   dashboard; `Queue::failing()` -> Slack/email/Sentry for failure alerts;
   `spatie/laravel-schedule-monitor` or a `->pingOnFailure(healthchecks.io)` on
   `reminders:dispatch` so you know if the scheduler dies.
6. **Housekeeping** on the schedule: `queue:prune-failed --hours=168` weekly,
   `queue:monitor` every 5 min with a backlog threshold, `schedule:clear-cache` hourly.
7. **Backups**: `sqlite3 database.sqlite ".backup ..."` for the app DB (nightly). The queue
   DB is effectively disposable - the reminder ledger + catch-up window regenerate anything
   lost.

### Switch to Redis + Horizon when any of these becomes true

- You add a second app server / move off a single host (SQLite queue is then impossible).
- You want Horizon's real-time dashboard and throughput graphs as a first-class thing.
- Sustained volume climbs past a few hundred jobs/minute or you need multiple concurrent
  workers.
- You start seeing `database is locked` in worker logs despite a single worker (sign the app
  DB and queue DB contention model has outgrown SQLite).

It is a `QUEUE_CONNECTION` change plus adding the `redis` + `horizon` services from section 4.5;
the job classes and the reminder ledger design do not change.

### Explicitly not recommended

- **Beanstalkd**: adds a daemon while giving *worse* durability than the SQLite `jobs` table
  (its whole failure mode is "lose jobs on container rebuild") and *no better* monitoring.
  No upside for this workload.
- **`sync`**: puts 30 s mail providers on the signup request path and serializes reminder
  sends inside the scheduler minute, with no retry and no failed-job record. Dev/test only.
- **Multiple SQLite queue workers**: correctness holds (conditional reserve) but you trade it
  for `SQLITE_BUSY` exception noise and duplicate-send risk when a post-handler `DELETE`
  loses the write lock. If you need concurrency, that is the signal to move to Redis, not to
  add workers.

---

## Sources

- [Queues - Laravel 13.x docs](https://laravel.com/docs/13.x/queues)
- [Task Scheduling - Laravel 13.x docs](https://laravel.com/docs/13.x/scheduling)
- [Queues - Laravel 12.x docs](https://laravel.com/docs/12.x/queues)
- [Using SQLite in production with Laravel - Laravel News](https://laravel-news.com/using-sqlite-in-production-with-laravel)
- [SQLite in Production for Laravel: When One File Wins - Deploynix](https://deploynix.io/blog/sqlite-in-production-for-laravel-when-one-file-wins)
- [SQLite concurrent writes and "database is locked" errors - tenthousandmeters.com](https://tenthousandmeters.com/blog/sqlite-concurrent-writes-and-database-is-locked-errors/)
- [SQLite Concurrent Writes: WAL Mode and Lock Handling (2026) - ADHDecode](https://adhdecode.com/articles/sqlite/sqlite-concurrent-writes-locking/)
- [Database locked errors with multiple queue workers and SQLite - Laracasts](https://laracasts.com/discuss/channels/laravel/database-locked-errors-with-multiple-queue-workers-and-sqlite)
- [Database queue driver deadlock + solution - laravel/framework#31660](https://github.com/laravel/framework/issues/31660)
- [A production-ready database queue driver for Laravel - themsaid, DEV](https://dev.to/themsaid/a-production-ready-database-queue-diver-for-laravel-22eh)
- [ph4r05/laravel-queue-database-ph4 (optimistic locking)](https://github.com/ph4r05/laravel-queue-database-ph4)
- [Running the Laravel Scheduler and Queue with Docker - Laravel News](https://laravel-news.com/laravel-scheduler-queue-docker)
- [Dockerizing Laravel queues, workers, and schedulers - Sevalla](https://sevalla.com/blog/dockerizing-laravel-queues/)
- [Orchestrating Laravel Queues & Scheduling in Docker with Cron & Supervisor - Rajesh Nautiyal](https://www.rajeshnautiyal.me/blogs/orchestrating-laravel-queues-and-scheduling-in-docker-with-cron-and-supervisor)
- [Running Laravel in Docker with supervisord - Chris Geiger](https://www.chrisgeiger.dev/posts/Running-Laravel-in-Docker-with-supervisord/)
- [Laravel Queue Drivers: Database, Redis & Beanstalkd Compared - maxw3ll.com](https://maxw3ll.com/blog/laravel-series/queues/mastering-laravel-queues-from-first-job-to-production-workers-part-2)
- [Is Redis really suitable as a queue driver in Laravel - Tom Ellis, Medium](https://tomgrohl.medium.com/is-redis-really-suitable-as-a-queue-driver-in-laravel-9d36a1b50fca)
- [beanstalkd vs redis - StackShare](https://stackshare.io/stackups/beanstalkd-vs-redis)
- [Beanstalkd - Laradock docs](https://laradock.io/docs/services/beanstalkd/)
- [romanzipp/Laravel-Queue-Monitor](https://github.com/romanzipp/Laravel-Queue-Monitor)
- [cboxdk/laravel-queue-monitor](https://github.com/cboxdk/laravel-queue-monitor)
- [Jobs monitoring for database driver (Horizon lite) - Laracasts](https://laracasts.com/discuss/channels/laravel/jobs-monitoring-for-database-driver-horizon-lite-if-you-want)
- [The Laravel Scheduler Under the Hood - Wendell Adriel](https://wendelladriel.com/blog/the-laravel-scheduler-under-the-hood)
- [Moving a Laravel Scheduler to Kubernetes with Non-idempotent Cron Jobs - Kubernetes forum](https://discuss.kubernetes.io/t/moving-a-laravel-scheduler-to-kubernetes-with-non-idempotent-cron-jobs/25435)
- [spatie/laravel-schedule-monitor](https://github.com/spatie/laravel-schedule-monitor)
- [Run a scheduled task, then catch up if it is missed - Laravel.io forum](https://laravel.io/forum/07-14-2015-run-a-scheduled-task-then-catch-up-if-it-is-missed)
