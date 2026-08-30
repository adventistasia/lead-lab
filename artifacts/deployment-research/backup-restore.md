# Backup & Restore: Self-Hosted Laravel 13 + SQLite on Proxmox

Research date: 2026-08-30

## Scope & assumptions

- **App**: Laravel 13, PHP 8.3, running in Docker on a Proxmox cluster.
- **Database**: SQLite, single file (`database/database.sqlite` or a mounted volume path), WAL mode assumed (Laravel's practical default for production SQLite).
- **Files to protect**: `storage/app/private`, `storage/app/public` (user uploads), `.env`, anything under `storage/app` that is user data. Code comes from Git and does not need app-level backup.
- **Off-box target**: Synology NAS (LAN).
- **Existing**: Proxmox VM/CT backups (vzdump or Proxmox Backup Server). Treated as a floor, not the whole solution.
- **Scale**: 50-200 users. Data volume is almost certainly small (low single-digit GB for DB, uploads maybe tens of GB). This matters: it makes almost every approach cheap.

---

## TL;DR recommendation

**Top pick: Option 4 (Hybrid) - `spatie/laravel-backup` for an application-consistent, verified, retained backup set pushed to the NAS, layered on top of Proxmox Backup Server for bare-metal / whole-VM recovery. Add a nightly raw SQLite `.backup` snapshot (or Litestream) as a belt-and-suspenders DB copy with a tighter RPO.**

Reason: the Proxmox layer already exists and gives you fast full-system restore but produces only crash-consistent images of a running SQLite file. `spatie/laravel-backup` gives you the thing Proxmox cannot: a small, portable, integrity-checked, age-tiered archive of exactly the data that matters (DB dump + uploads + `.env`), stored off the hypervisor on the NAS, restorable onto any host in minutes. The two layers fail independently, which is the point.

If you want the simplest thing that is still correct: **Option 1** (SQLite `.backup` + cron + rsync to NAS) is a completely defensible standalone answer for a shop that prefers shell scripts over Composer packages.

---

## SQLite-specific primer (read this first)

SQLite is a database, but it is *also* just files on disk, and that duality is where backups go wrong.

### WAL mode: what it changes

In the default rollback-journal mode, a SQLite database is one file. In **WAL (Write-Ahead Logging) mode** - `PRAGMA journal_mode=WAL` - the live state of the database is spread across up to three files:

| File | Purpose |
|---|---|
| `database.sqlite` | The main database. May be **stale** - recent commits might not be in it yet. |
| `database.sqlite-wal` | The write-ahead log. Holds committed transactions **not yet checkpointed** into the main file. Can be many MB. |
| `database.sqlite-shm` | Shared-memory index into the WAL. Coordinates readers/writers. Ephemeral. |

A "checkpoint" is the operation that folds `-wal` pages back into the main file. It happens automatically (default: when the WAL passes ~1000 pages / ~4 MB), on the last connection closing, or on demand via `PRAGMA wal_checkpoint`.

Laravel/production guidance is to run SQLite in WAL mode because readers no longer block the writer (and vice versa), which is what makes SQLite viable for a 50-200 user web app.

### Why a plain file copy is risky

If your backup is `cp database.sqlite /backup/` (or an rsync, or a tar) and the app is running:

1. **You can miss committed data.** Copy the main file without a fresh checkpoint and every transaction still sitting in `-wal` is gone from your backup. The DB will open fine and look intact - it is just silently missing the last N minutes/hours of writes up to the last checkpoint.
2. **You can capture a torn copy.** `cp` is not atomic. A writer can modify page 5 after your copy tool has already passed page 5 but before it reaches page 900. The result is an internally inconsistent file that may pass a casual open and fail later with `database disk image is malformed` or subtle corruption.
3. **Copying all three files is not a fix.** Grabbing `.sqlite` + `-wal` + `-shm` non-atomically has the same torn-read problem across files, plus `-shm` content is host/process-specific.
4. **Networked filesystems make it worse.** Copying a live SQLite file over SMB/NFS, or letting the DB *live* on SMB/NFS, breaks the locking and mmap semantics SQLite relies on. Keep the live DB on local disk; only the *backup output* goes to the NAS.

Filesystem/VM snapshots (LVM, ZFS, Proxmox `snapshot` mode) are better than `cp` because they are atomic point-in-time captures - the copy is at least *crash-consistent*, i.e. equivalent to pulling the power. SQLite is designed to recover from that (it will replay/rollback the WAL on next open). But crash-consistent is not the same as *known-good*: you find out whether it worked only when you restore it.

### The correct ways to back up a live SQLite DB

All of these produce a single, self-consistent output file while the app keeps running:

| Method | Command | Notes |
|---|---|---|
| **Online Backup API** via `.backup` | `sqlite3 database.sqlite ".backup '/path/out.sqlite'"` | The canonical hot backup. Takes a shared lock, copies page by page, and **re-copies any page a writer changes mid-flight**, so the result is transactionally consistent. Output is a byte-faithful copy (includes free pages). No manual checkpoint needed. Restart-safe: if a write happens during the copy it restarts the page scan. |
| **`VACUUM INTO`** | `sqlite3 database.sqlite "VACUUM INTO '/path/out.sqlite'"` | Also hot-safe. Produces a **defragmented, smaller** file (free pages reclaimed). Needs SQLite >= 3.27 (2019, so fine). Slightly more I/O than `.backup`. Good default for archival copies. |
| **`.dump`** (logical) | `sqlite3 database.sqlite .dump \| gzip > out.sql.gz` | Plain SQL text. Compresses extremely well, portable across SQLite versions and even other engines, but **slowest to restore** and loses nothing-but-also-nothing-fancy. Nice as a secondary format for long-term retention. |
| **Litestream** (streaming) | daemon | Continuously ships WAL frames to S3/NAS/other. Gives **RPO of seconds** and point-in-time restore. Runs as a sidecar. See Option 5. |
| **`.backup` then checkpoint hygiene** | add `PRAGMA wal_checkpoint(TRUNCATE);` on a schedule | Not for backup correctness (the API handles that) - just to stop `-wal` growing unbounded on a busy DB. |

**Rule of thumb:** never back up SQLite by copying the file with a generic file tool while anything can write to it. Use `.backup` or `VACUUM INTO` to produce a clean file *first*, then let rsync/Hyper Backup/Proxmox copy that clean file around freely (it is inert, so file-level copy is perfectly safe on it).

### Docker volume considerations

- The live DB and its `-wal`/`-shm` siblings must all sit on the **same persisted volume**, in the **same directory**. Persisting only `database.sqlite` and losing `-wal` on container restart = data loss / corruption.
- Prefer a **named Docker volume** or a **bind mount to local VM disk** (e.g. `/opt/leadlab/data`). Do **not** put the live DB on an SMB/NFS mount from the NAS.
- If you run more than one container against the same DB file (e.g. `php-fpm` + queue worker + scheduler), that is fine **only if they are on the same host sharing the same volume** - same kernel + same filesystem is the requirement for WAL's shared-memory coordination. Do not share the DB file across hosts.
- Give your backup process access to the DB. Cleanest options:
  - Run `php artisan backup:run` / `sqlite3 .backup` **inside** the app container (`docker compose exec`), or
  - Bind-mount the data directory into a tiny sidecar that has the `sqlite3` binary, or
  - Run `sqlite3` on the host against the bind-mounted path (host needs the `sqlite3` package; version just needs to be >= 3.27).
- Backup **output** should be written to a directory that is itself on local disk first, then synced to the NAS - so a NAS outage never blocks or corrupts a backup run.

---

## Option 1 - SQLite `.backup` + cron + Synology rsync (file-level, DIY)

A shell script: snapshot the DB with `.backup`, tar the important `storage` paths and `.env`, write to a local staging dir with a timestamp, prune old ones, then `rsync` the staging dir to the NAS.

### SQLite backup safety
Correct by construction if you use `sqlite3 ... ".backup"` (or `VACUUM INTO`). The script owns the correctness; no package between you and the DB. Add `PRAGMA wal_checkpoint(TRUNCATE)` post-backup for WAL hygiene. Verify each snapshot with `PRAGMA integrity_check` before shipping it.

### What gets backed up
Whatever you script. Minimum set:
- `database/database.sqlite` -> via `.backup` to `db-YYYYmmdd-HHMM.sqlite`
- `storage/app/private/` and `storage/app/public/` (uploads) -> `tar`
- `.env` -> copied (contains APP_KEY - without it, encrypted columns/cookies are unrecoverable)
- optionally `storage/app/`, `storage/oauth-*.key`, any `config/*.php` you have hand-edited
- **not** code, `vendor/`, `node_modules/`, `storage/framework/{cache,sessions,views}`, `storage/logs`

### Frequency & retention
- DB: every 15-60 min (it is tiny; hourly is a fine default, 15 min if writes matter).
- Files: nightly (uploads change slower; rsync makes this cheap).
- Retention via script: keep hourly for 48 h, daily for 14 d, weekly for 8 w, monthly for 12 m. Implement with `find -mtime` tiers or use `rsnapshot`/`restic` if you want dedup + tiering for free.
- On the NAS: enable a **Btrfs snapshot schedule** (Snapshot Replication) or **Hyper Backup versioning** on the target share so a bad push (or ransomware on the app host) cannot erase history - the app host should ideally only be able to *add* to the NAS, not rewrite it.

### Synology integration
Three ways to get bytes onto the Synology:
- **rsync over SSH (push from app host)** - recommended here. Enable *Control Panel > File Services > rsync* (rsync service) on the Synology, create a dedicated backup user with write access to one shared folder only, use SSH key auth. `rsync -az --delete ... backup@nas:/volume1/backups/leadlab/`. Leaves files in plain readable form.
- **SMB/CIFS mount** - mount `//nas/backups` on the app host and `cp`. Simple, but a compromised/buggy app host can wipe the share; also SMB perms are fiddly. Acceptable if paired with NAS-side immutable snapshots.
- **Synology-initiated pull** - Synology's *Hyper Backup* or *Active Backup* reaching out to the app host over rsync/SSH. Inverts trust (NAS holds the credentials, app host cannot touch NAS storage). Nice for security; means the schedule/retention lives on the NAS. Hyper Backup "rsync (remote server)" mode + multi-version task gives versioned restore via Hyper Backup Explorer.

Best practice: **push clean files with rsync, and additionally enable NAS-side snapshots/versioning** so retention survives an app-host compromise.

### Restore procedure
1. Provision app (Docker image from registry / `git clone` + `composer install`).
2. Pull the wanted `db-*.sqlite` and `storage-*.tar` + `.env` from the NAS.
3. `sqlite3 db-xxxx.sqlite "PRAGMA integrity_check;"` -> expect `ok`.
4. Stop the app (or bring it up in maintenance mode).
5. Copy `db-xxxx.sqlite` to `database/database.sqlite`; delete any stale `-wal`/`-shm`.
6. `tar xf storage-xxxx.tar` into place; restore `.env`.
7. `chown` to the container user; start the app.
8. `php artisan migrate --pending` only if restoring an older DB against newer code; smoke-test login + a known record.

**Time to recover:** 5-15 min for DB-only; +time to transfer uploads (LAN, tens of GB => minutes).

### Verification
- In-script: `PRAGMA integrity_check` on every snapshot; abort + alert on non-`ok`.
- Nightly automated restore-test: spin a throwaway container, restore latest, run `php artisan migrate:status` + a couple of `SELECT count(*)` sanity queries + `php artisan tinker` health probe. Emit success to a healthcheck endpoint (Healthchecks.io / Uptime Kuma) so a *missing* success pings you.
- Monthly manual full restore to a scratch VM; document wall-clock time.
- Alert on: script exit != 0, rsync failure, backup file size deviating > 50% from trailing median, no new backup in X hours (dead-man switch).

### Cost & complexity
- **Cost:** $0 software. ~2-4 h to write/test the script well. NAS space trivial.
- **Complexity:** low-moderate. You own edge cases (disk full, partial rsync, clock skew, alerting). No app awareness (won't handle notifications, won't dump multiple connections, no encryption unless you add `gpg`/`age`).

---

## Option 2 - `spatie/laravel-backup` (application-aware)

The de-facto Laravel backup package. `php artisan backup:run` produces a single timestamped **zip** containing a DB dump + selected files, streams it to one or more Laravel filesystem disks, prunes old backups with a tiered strategy, and ships with monitoring + notification commands.

### SQLite backup safety
Here is the caveat. spatie/laravel-backup's SQLite handling historically **copies the database file** into the zip (via its Sqlite dumper) rather than invoking the Online Backup API. On a live WAL-mode DB that reintroduces the "might miss `-wal`, might tear" risk described above - low probability on a lightly loaded 50-200 user app, non-zero on a busy minute.

Mitigations, in order of preference:
1. **Custom dump command / wrapper**: configure the SQLite connection's `dump` options, or use a `before-backup` hook that runs `sqlite3 database.sqlite ".backup '/tmp/leadlab-hot.sqlite'"` (or `VACUUM INTO`) and point the backup source at the hot copy instead of the live file. This gives you app-aware packaging **and** a transactionally consistent DB.
2. Run `PRAGMA wal_checkpoint(TRUNCATE)` immediately before `backup:run` (via `Event::listen(BackupZipWasCreated...)` is too late - use the scheduler: checkpoint then backup). Shrinks the risk window; does not fully eliminate the torn-read race.
3. Accept crash-consistency on the grounds that the DB is small and idle most of the time, and rely on the nightly restore test to catch a bad one.

Recommendation: do **#1**. It is ~5 lines of config/hook and removes the only real weakness of this option.

### What gets backed up
- **DB**: dump of every connection listed in `config/backup.php > source.databases` (you can list more than one).
- **Files**: every path in `source.files.include` (default: base path), minus `source.files.exclude` (add `vendor`, `node_modules`, `.git`, `storage/framework`, `storage/logs`, `node_modules`). You explicitly include `.env`, `storage/app/private`, `storage/app/public`.
- Output is `AppName/AppName-YYYY-MM-DD-HH-mm-ss.zip`, optionally **AES-encrypted with a password** (set `backup.encryption` / `BACKUP_ARCHIVE_PASSWORD`) - useful because the zip will sit on the NAS containing `.env` secrets.

### Frequency & retention
- Schedule in `routes/console.php` / `app/Console`: `backup:clean` daily ~01:00, `backup:run` daily ~01:30, and a lighter `backup:run --only-db` every 1-4 h for a tighter DB RPO (the package supports DB-only runs).
- **Default cleanup strategy** (all configurable):
  - keep **all** backups for **7 days**
  - keep **daily** for **16 days**
  - keep **weekly** for **8 weeks**
  - keep **monthly** for **4 months**
  - keep **yearly** for **2 years**
  - `deleteOldestBackupsWhenUsingMoreMegabytesThan`: **5000 MB** (raise/lower to taste)
  - the newest backup is never deleted
- This tiering runs **per destination disk**, so your NAS copy is pruned independently of any local/S3 copy.

### Synology integration
The package writes to Laravel **filesystem disks**, so you need a disk that points at the NAS. Options:
- **SFTP/FTP disk** (`league/flysystem-sftp-v3`): define a `nas` disk with SFTP creds to the Synology (enable SFTP in *File Services*), list it in `backup.destination.disks`. Cleanest - the package pushes straight to the NAS, retention enforced remotely, no host mount.
- **SMB disk** via a Flysystem SMB adapter, or mount `//nas/backups` on the host and use a `local`-style disk rooted there. Works; mount reliability becomes your problem.
- **Local disk + external rsync/Hyper Backup**: let the package write to `local` (staging dir), then a separate cron `rsync` (or a Synology Hyper Backup rsync **pull**) moves zips to the NAS. Decouples "make backup" from "ship backup"; the extra hop is one more thing to monitor. Also lets Hyper Backup own versioning.
- List **two** disks (e.g. `local` + `nas`, or `nas` + `s3`) so one destination failing does not lose the run - the package continues to the others.

### Restore procedure
The package itself has **no restore command** (by design). Two paths:

**A. Manual (always works):**
1. Download the zip from the NAS; `unzip -P <password>` it.
2. It contains `db-dumps/` and your files tree.
3. For SQLite: the dump is a `.sql` file (`sqlite3 database/database.sqlite < db-dumps/sqlite-database.sql`) or, if you used the `.backup` hook, a ready `.sqlite` file to drop in place.
4. Copy files back into `storage/app/...`, restore `.env`.
5. `chown`, start app, `php artisan migrate --pending` if needed, smoke test.
- **Time to recover:** 10-20 min once the zip is on the box.

**B. Automated with `wnx/laravel-backup-restore` (stefanzweifel):**
- `composer require --dev wnx/laravel-backup-restore`
- `php artisan backup:restore --disk=nas --backup=latest --connection=sqlite --password=... [--reset] [--no-interaction]`
- Downloads, decrypts, extracts, imports the dump into the target connection, then runs **health checks** (default: "restored DB has tables"; extend with app-specific `SELECT count(*)` checks).
- Caveats: restores **database only, not files**; not multi-tenant aware; current versions target **Laravel >= 12 / PHP >= 8.4** - verify compatibility against your stack (Laravel 13/PHP 8.3) and pin accordingly, or use path A.

### Verification
- **`php artisan backup:monitor`** - checks every configured destination for "a healthy backup exists" (recent enough + not oversized). Schedule it hourly.
- **Notifications** built in (mail, Slack, Discord, Telegram, etc.) on `BackupWasSuccessful`, `BackupHasFailed`, `HealthyBackupWasFound`, `UnhealthyBackupWasFound`, `CleanupHasFailed`.
- **Restore test** (the real verification): nightly CI/cron job runs `backup:restore --no-interaction` into a scratch SQLite/container + health checks, then pings a dead-man's-switch. This is the only way to *know* the backup is restorable.
- The zip is self-describing (open it, see the dump + files) which makes manual spot-checks easy.

### Cost & complexity
- **Cost:** $0 (MIT). ~1-2 h initial config; well-trodden, lots of docs.
- **Complexity:** low. Main gotchas: (1) the SQLite copy-vs-`.backup` caveat above, (2) restore is a separate tool/manual, (3) needs a working queue/scheduler in the container (`php artisan schedule:run` every minute via cron or a `supervisor`/`--schedule` sidecar).

---

## Option 3 - Proxmox backup + Synology snapshot (infrastructure-level)

Whole-VM/CT image backups via **Proxmox Backup Server (PBS)** (or legacy `vzdump` to an NFS/CIFS store), with the PBS datastore itself living on - or replicated to - the Synology.

### SQLite backup safety
This is the weak axis. Proxmox `snapshot` mode backs up a **running** VM/CT:
- With the **QEMU guest agent installed and running**, Proxmox issues `fs-freeze` so the guest filesystem is quiesced -> the image is filesystem-consistent.
- **fs-freeze does not flush SQLite's own in-flight transaction state to a checkpoint.** You still get, at best, a **crash-consistent** SQLite file: the main DB + whatever is in `-wal` at freeze time. SQLite will recover this on next open (replay/rollback WAL), so it is *usually* fine - but "usually" is not a backup guarantee, and a crash-consistent image "can appear valid but fail on restore."
- Without the guest agent, you do not even get filesystem quiescence - genuinely risky for a database.
- `stop` mode (briefly power off the VM) is truly consistent but means downtime.

So: Proxmox alone gives you great *system* recovery and mediocre *database* recovery assurance. It should never be your only DB backup.

### What gets backed up
Everything in the VM/CT: OS, Docker, images, volumes, the live SQLite file(s), uploads, `.env` - the whole disk. Nothing app-specific is selectable; restore granularity is "the whole guest" (PBS **file-level restore** lets you pull individual files out of a backup snapshot without a full VM restore, which partly mitigates this).

### Frequency & retention
- Typical: nightly VM backup. PBS **incremental forever + dirty-bitmap** makes nightlies cheap after the first; **deduplication** across snapshots and guests keeps the datastore small.
- PBS **prune** schedule, e.g. keep-last 7, keep-daily 14, keep-weekly 8, keep-monthly 12, keep-yearly 2. **GC** reclaims unreferenced chunks.
- Add **verify jobs** (PBS re-hashes chunks to detect bit-rot).

### Synology integration
- **PBS datastore on the Synology**: mount an NFS/iSCSI share from the Synology on the PBS host and put the datastore there. Simple; Synology is now your backup storage.
- **PBS `sync` job to a second datastore**: primary datastore on local/fast disk, `sync` (pull) to a datastore on the Synology nightly. Better - primary stays fast, NAS is the offsite-ish copy.
- **`vzdump` straight to a Synology CIFS/NFS storage** defined in Proxmox: simplest, but no dedup/incremental - each backup is a full `.vma.zst`. Fine only if data is small and you keep few copies.
- Then **Synology Hyper Backup** the PBS datastore / vzdump share **off the NAS** (to C2, a second NAS, or USB) for the true offsite leg, and enable **Btrfs snapshots** on that share for immutability.

### Restore procedure
- **Full VM**: PBS -> "Restore" -> pick target node/storage -> new VMID -> boot. 10-40 min depending on disk size and network; near-zero thought required. Best-in-class for "the hypervisor node died."
- **Single file** (e.g. just the DB or an uploads folder): PBS file-level restore browser -> download the path -> drop into the running app. Minutes. Then treat the DB file with `PRAGMA integrity_check` and be aware it is only crash-consistent.
- **Time to recover:** full system 15-45 min; single-file minutes.

### Verification
- PBS **verify jobs** prove the *stored chunks* are intact - they do **not** prove the SQLite file inside boots into a healthy DB.
- Real verification = periodically restore the VM to an isolated VLAN/VMID, boot it, and run `PRAGMA integrity_check` + app smoke test. Manual; quarterly at least.
- Monitor PBS job status + datastore free space + verify-job results; alert on failure.

### Cost & complexity
- **Cost:** PBS is free (optional paid subscription for enterprise repo/support). A small VM or spare box for the PBS role. Storage modest thanks to dedup.
- **Complexity:** moderate one-time setup (PBS install, datastore, jobs, prune, sync, guest agent in the VM). Very low ongoing. But it does **not** by itself satisfy the "database backup" or "restore testing" needs to a high standard.

---

## Option 4 - Hybrid: `spatie/laravel-backup` (DB + app data) + Proxmox (filesystem/system)  ← recommended

Two independent layers with different failure modes and recovery targets:

| Layer | Tool | Protects against | RTO | RPO |
|---|---|---|---|---|
| **App-data layer** | `spatie/laravel-backup` (with `.backup` hook for SQLite) -> NAS (SFTP disk) + optionally S3 | Bad deploy, dropped table, corrupted upload, "restore last Tuesday", full site rebuild on new infra, hypervisor loss | 10-20 min (DB), + transfer for files | 1-4 h (DB-only runs), 24 h (full) |
| **System layer** | Proxmox Backup Server -> datastore on/synced-to NAS -> Hyper Backup offsite | Dead node, corrupted VM, OS/Docker hosed, ransomware on the guest, "I need the whole box back now" | 15-45 min whole VM | 24 h |
| **(optional) tight-RPO DB** | nightly raw `sqlite3 .backup` snapshot *or* Litestream sidecar -> NAS | Losing hours of DB writes; gives point-in-time (Litestream) | minutes | seconds (Litestream) / 1 h (`.backup` cron) |

### Why this is the pick
- **Covers every recovery scenario**: file-level "oops", whole-DB, whole-system, and off-hypervisor rebuild.
- **Independent failure domains**: spatie writes via SFTP from inside the guest; Proxmox writes from the hypervisor. A bug or compromise in one path does not poison the other. Different formats (zip of dump+files vs dedup chunk store) means a format-level defect cannot eat both.
- **Verification is tractable**: the spatie layer restore-tests nightly in a container (fast, cheap, automatable); the Proxmox layer restore-tests quarterly to a scratch VM.
- **Retention is handled twice, cheaply**: spatie's tiered strategy on the NAS disk; PBS prune on the datastore.
- **Marginal cost over "Proxmox only" is ~2 h of setup** and a Composer dependency.

### SQLite backup safety
Use the `.backup`/`VACUUM INTO` hook in the spatie layer so the DB copy that lands in the zip is transactionally consistent. The Proxmox layer stays crash-consistent (acceptable as the secondary DB copy + primary system copy). If you add Litestream, you also get continuous, transactionally-consistent replication with point-in-time restore - at which point the spatie DB dump becomes your "portable, human-inspectable, retained" copy and Litestream is your "lose almost nothing" copy.

### What gets backed up
- spatie: SQLite dump (via hook), `storage/app/private`, `storage/app/public`, `.env`, edited `config/*`, encrypted with `BACKUP_ARCHIVE_PASSWORD`.
- Proxmox: entire guest (OS, Docker images, volumes, everything).
- Overlap on files is fine and desirable.

### Frequency & retention
- spatie: `--only-db` every 2 h; full (`db+files`) nightly. Cleanup: defaults (all 7 d / daily 16 d / weekly 8 w / monthly 4 m / yearly 2 y).
- Proxmox: nightly VM backup; prune keep-daily 14 / keep-weekly 8 / keep-monthly 12 / keep-yearly 2; weekly verify.
- NAS: Btrfs snapshots on the backup share (immutability); Hyper Backup weekly to a true offsite (C2 / second NAS / rotated USB) to satisfy **3-2-1** (>=3 copies, >=2 media, >=1 offsite).

### Synology integration
- spatie -> **SFTP disk** to the Synology (dedicated restricted user, key auth, one shared folder).
- Proxmox -> PBS datastore on an **NFS/iSCSI** share from the Synology, or local datastore with a nightly **PBS sync** to a Synology-hosted datastore.
- Synology -> **Hyper Backup** both trees offsite; **snapshot schedule** on the shares for ransomware resistance.

### Restore procedure
- **Dropped table / bad data / single file** -> spatie: `backup:restore --backup=latest --only-db` (or manual unzip) into the running app. ~10 min.
- **DB is corrupt, app otherwise fine** -> restore latest good `.sqlite` from spatie zip (or `litestream restore`); `PRAGMA integrity_check`; swap file; restart. ~10-15 min.
- **Guest OS / Docker broken** -> PBS full VM restore to same or new VMID. ~20-40 min. Then optionally roll the DB forward from the freshest spatie/Litestream copy.
- **Hypervisor node dead** -> PBS restore VM onto another node. ~20-40 min.
- **Total loss, rebuilding on fresh infra** -> new host, `docker compose up` from registry image, `backup:restore` DB + unzip files + `.env` from the NAS. ~30-45 min.

### Verification
- spatie: `backup:monitor` hourly + failure notifications; **nightly automated restore-test** into a scratch container with `SELECT count(*)` health checks -> dead-man's-switch ping.
- Proxmox: weekly PBS verify jobs; **quarterly** full VM restore drill to an isolated VMID, boot, `integrity_check`, smoke test; record RTO.
- Central alerting (Healthchecks.io / Uptime Kuma / Grafana OnCall): page on missing spatie success, missing PBS job, verify failure, datastore/NAS free space < 15%, backup size anomaly.

### Cost & complexity
- **Cost:** $0 software (spatie MIT, PBS free). Storage small. Setup ~3-5 h total (spatie config + hook + SFTP disk + scheduler; PBS datastore + jobs + guest agent).
- **Complexity:** moderate, front-loaded. Ongoing effort near zero once the restore-tests are automated. Two systems to understand instead of one - justified by the coverage.

---

## Option 5 (bonus) - Litestream streaming replication

Not in the original list but the strongest answer to "I don't want to lose hours of DB writes."

- **How:** a `litestream` process (sidecar container sharing the DB volume, or host service) tails the WAL and ships frames to a replica target every few seconds. Targets: S3/MinIO, SFTP, Azure, GCS, or a plain file path (an SFTP mount of the Synology works).
- **Restore:** `litestream restore -o database.sqlite s3://.../db` recreates the DB at (near) the last replicated transaction. Common pattern: container entrypoint runs `litestream restore` if the DB file is missing, then `litestream replicate` alongside the app.
- **RPO:** seconds. **RTO:** seconds-to-minutes for DB.
- **Caveats:** it is replication, not retention - a `DROP TABLE` propagates in seconds. You still need periodic *snapshots* (spatie/`.backup`) for "go back to last week" and for an inspectable archive. Litestream generation/retention settings give some point-in-time window but treat it as HA-ish, not archival. Single-writer only (fine for one app container). Free, MIT.
- **Where it fits:** as the tight-RPO leg of Option 4, replacing the `.backup` cron.

---

## Recommendation matrix

Scores: 5 = excellent, 1 = poor. "Best" = weighted for this 50-200 user, small-data, NAS-available, Proxmox-already-present context.

| Criterion | Opt 1: `.backup`+cron+rsync | Opt 2: spatie only | Opt 3: Proxmox only | Opt 4: Hybrid (spatie+Proxmox) | Opt 5: Litestream (as a leg) |
|---|:--:|:--:|:--:|:--:|:--:|
| SQLite consistency (hot backup) | 5 (if `.backup`) | 3 (copy) / 5 (with hook) | 2-3 (crash-consistent) | 5 | 5 |
| Covers files (uploads, `.env`) | 4 (scripted) | 5 | 5 (whole disk) | 5 | 1 (DB only) |
| RPO (data loss window) | 4 (15-60 min) | 3 (1-4 h) | 2 (24 h) | 4 | 5 (seconds) |
| RTO - single file / table | 4 | 4 | 3 (file-level restore) | 5 | 4 (DB only) |
| RTO - whole system / new infra | 3 | 3 | 5 | 5 | 2 |
| Off-hypervisor portability | 5 | 5 | 3 (needs Proxmox target) | 5 | 5 |
| Retention / tiering | 3 (DIY) | 5 (built-in) | 4 (PBS prune) | 5 | 2 |
| Backup verification tooling | 2 (DIY) | 4 (`backup:monitor`+restore pkg) | 3 (verify chunks only) | 5 | 3 |
| Restore automation | 3 | 4 (`wnx` pkg, LV12+ caveat) | 4 (GUI) | 4 | 5 |
| Encryption at rest on NAS | 3 (add gpg/age) | 5 (native AES) | 4 (PBS encrypted datastore) | 5 | 4 (target-side) |
| Synology integration ease | 4 (rsync) | 4 (SFTP disk) | 3 (NFS datastore) | 4 | 4 |
| Setup effort | 3 (2-4 h) | 5 (1-2 h) | 3 (half day) | 3 (3-5 h) | 4 |
| Ongoing maintenance | 3 | 4 | 5 | 4 | 4 |
| Cost | 5 ($0) | 5 ($0) | 5 ($0) | 5 ($0) | 5 ($0) |
| 3-2-1 compliance out of the box | 2 | 3 | 3 | 5 | 2 |
| **Overall fit for this app** | **3.5** | **3.8** | **3.5** | **4.7** | **n/a (component)** |

### Verdict

1. **Adopt Option 4 (Hybrid).** spatie/laravel-backup (with the `.backup` hook) -> Synology SFTP disk, plus PBS -> datastore on/synced-to the Synology, plus Hyper Backup offsite and NAS-side snapshots. Add Litestream (Option 5) as the tight-RPO DB leg if losing more than a few minutes of writes is unacceptable.
2. **If you want one tool and a shell script:** Option 1 done carefully (uses `.backup`, `integrity_check`, immutable NAS snapshots, automated restore test) is genuinely fine and covers files too. It just lacks built-in monitoring/retention/encryption you'd otherwise reimplement.
3. **Do not run Option 3 alone.** Keep the Proxmox layer - it is the fastest whole-system recovery you have - but it is not an adequate database backup or a substitute for restore testing.
4. **Option 2 alone** is close behind the hybrid and acceptable if you have no appetite for the Proxmox side, provided you fix the SQLite copy with the hook and add a second destination disk (e.g. S3/MinIO) for the "2 media / 1 offsite" legs.

---

## Concrete backup script

Standalone Bash implementation of the **Option 1 / Option 4 tight-RPO leg**: hot SQLite snapshot + integrity check + files/`.env` archive + local retention tiers + rsync to Synology. Safe to run from cron on the Docker host; it execs into the container for the DB so it uses the app's own `sqlite3`.

```bash
#!/usr/bin/env bash
# /opt/leadlab/bin/backup.sh
# Hot backup of a Dockerised Laravel 13 + SQLite app to a local staging dir,
# then rsync to a Synology NAS. Run from cron on the Proxmox VM/CT (the Docker host).
#
#   crontab -e
#   */30 *  * * *  /opt/leadlab/bin/backup.sh db     >> /var/log/leadlab-backup.log 2>&1
#   15   2  * * *  /opt/leadlab/bin/backup.sh full    >> /var/log/leadlab-backup.log 2>&1

set -Eeuo pipefail

### ---- config -------------------------------------------------------------
APP_CONTAINER="leadlab-app"                       # docker container name / service
APP_DATA_DIR="/opt/leadlab/data"                  # host path of the bind-mounted volume
DB_IN_CONTAINER="/var/www/html/database/database.sqlite"
APP_ROOT_IN_CONTAINER="/var/www/html"

STAGING="/opt/leadlab/backups"                    # local staging (local disk!)
FILES_TO_TAR=(                                    # paths relative to APP_ROOT_IN_CONTAINER
  "storage/app/private"
  "storage/app/public"
  ".env"
)

NAS_USER="leadlab-backup"
NAS_HOST="nas.lan"
NAS_PATH="/volume1/backups/leadlab"               # dedicated share, restricted user, key auth
SSH_KEY="/opt/leadlab/.ssh/nas_backup_ed25519"

# retention (local staging); NAS keeps its own history via Btrfs snapshots / Hyper Backup
KEEP_DB_HOURS=48
KEEP_DAILY_DAYS=14
KEEP_WEEKLY_DAYS=56

HEALTHCHECK_URL="${HEALTHCHECK_URL:-}"            # optional dead-man's-switch (Healthchecks.io etc.)
### ----------------------------------------------------------------------

MODE="${1:-full}"
TS="$(date +%Y%m%d-%H%M%S)"
DOW="$(date +%u)"    # 1..7, 7 = Sunday
DAY="$(date +%d)"
mkdir -p "$STAGING"/{db,daily,weekly,files,tmp}

log()  { printf '%s  %s\n' "$(date -Is)" "$*"; }
fail() { log "ERROR: $*"; [[ -n "$HEALTHCHECK_URL" ]] && curl -fsS -m 10 "${HEALTHCHECK_URL}/fail" -d "$*" || true; exit 1; }
trap 'fail "line $LINENO"' ERR

dexec() { docker exec -i "$APP_CONTAINER" "$@"; }

# --- 1. hot SQLite snapshot via the Online Backup API (NOT a file copy) ---
backup_db() {
  local raw="$STAGING/tmp/db-$TS.sqlite"
  local out="$STAGING/db/db-$TS.sqlite.zst"

  log "SQLite .backup -> $raw"
  # .backup is transactionally consistent on a live WAL database; re-copies pages
  # a writer changes mid-flight. Fall back to VACUUM INTO if you prefer a compacted file.
  dexec sqlite3 "$DB_IN_CONTAINER" ".timeout 15000" ".backup '/tmp/hot-$TS.sqlite'"
  docker cp "$APP_CONTAINER:/tmp/hot-$TS.sqlite" "$raw"
  dexec rm -f "/tmp/hot-$TS.sqlite"

  log "integrity_check"
  local chk
  chk="$(sqlite3 "$raw" 'PRAGMA integrity_check;' || true)"
  [[ "$chk" == "ok" ]] || fail "integrity_check failed: $chk"

  # quick semantic sanity: expect some known tables / rows
  local users
  users="$(sqlite3 "$raw" "SELECT count(*) FROM sqlite_master WHERE type='table';")"
  [[ "$users" -ge 1 ]] || fail "restored snapshot has no tables"

  zstd -q -19 --rm -o "$out" "$raw"
  log "DB snapshot OK: $out ($(du -h "$out" | cut -f1))"

  # WAL hygiene on the live DB (keeps -wal from growing unbounded; not needed for correctness)
  dexec sqlite3 "$DB_IN_CONTAINER" "PRAGMA wal_checkpoint(TRUNCATE);" >/dev/null || true
}

# --- 2. files + .env ----------------------------------------------------
backup_files() {
  local out="$STAGING/files/files-$TS.tar.zst"
  log "tar files -> $out"
  docker exec "$APP_CONTAINER" tar -C "$APP_ROOT_IN_CONTAINER" -cf - "${FILES_TO_TAR[@]}" \
    | zstd -q -12 -o "$out"
  log "files archive OK: $out ($(du -h "$out" | cut -f1))"
}

# --- 3. promote to daily/weekly tiers ---------------------------------
promote() {
  # newest DB snapshot of the day -> daily/, Sundays -> weekly/
  local latest; latest="$(ls -1t "$STAGING/db/"*.zst | head -n1)"
  cp -n "$latest" "$STAGING/daily/db-$(date +%Y%m%d).sqlite.zst"
  [[ "$DOW" == "7" ]] && cp -n "$latest" "$STAGING/weekly/db-$(date +%Y%m%d).sqlite.zst" || true
  # keep a dated full-files archive alongside the daily DB
  [[ -f "$STAGING/files/files-$TS.tar.zst" ]] && \
    cp -n "$STAGING/files/files-$TS.tar.zst" "$STAGING/daily/files-$(date +%Y%m%d).tar.zst" || true
}

# --- 4. local retention ----------------------------------------------
prune() {
  find "$STAGING/db"     -name '*.zst' -mmin +$((KEEP_DB_HOURS*60)) -delete
  find "$STAGING/daily"  -name '*.zst' -mtime +$KEEP_DAILY_DAYS     -delete
  find "$STAGING/weekly" -name '*.zst' -mtime +$KEEP_WEEKLY_DAYS    -delete
  find "$STAGING/files"  -name '*.zst' -mmin +$((KEEP_DB_HOURS*60)) -delete
  find "$STAGING/tmp"    -type f -mmin +120 -delete
}

# --- 5. ship to Synology (rsync over SSH; NAS owns long-term history) ---
ship() {
  log "rsync -> $NAS_USER@$NAS_HOST:$NAS_PATH"
  rsync -a --delete-delay --partial --timeout=120 \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=accept-new" \
    "$STAGING/db" "$STAGING/daily" "$STAGING/weekly" "$STAGING/files" \
    "$NAS_USER@$NAS_HOST:$NAS_PATH/" \
    || fail "rsync to NAS failed"
  log "rsync OK"
}

### ---- run ----------------------------------------------------------------
log "=== backup start (mode=$MODE) ==="
backup_db
if [[ "$MODE" == "full" ]]; then
  backup_files
  promote
fi
prune
ship
log "=== backup done ==="
[[ -n "$HEALTHCHECK_URL" ]] && curl -fsS -m 10 "$HEALTHCHECK_URL" || true
```

### Companion: automated restore test (run nightly, alerts if a backup is NOT restorable)

```bash
#!/usr/bin/env bash
# /opt/leadlab/bin/restore-test.sh  - proves the newest DB snapshot actually restores.
set -Eeuo pipefail
NAS="leadlab-backup@nas.lan:/volume1/backups/leadlab"
SSH_KEY="/opt/leadlab/.ssh/nas_backup_ed25519"
HC="${RESTORE_HC_URL:-}"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT

# pull newest DB snapshot back FROM the NAS (tests the NAS copy, not the local one)
latest="$(ssh -i "$SSH_KEY" "${NAS%%:*}" "ls -1t ${NAS#*:}/db/*.zst | head -n1")"
scp -i "$SSH_KEY" "${NAS%%:*}:$latest" "$work/snap.sqlite.zst"
zstd -q -d "$work/snap.sqlite.zst" -o "$work/snap.sqlite"

chk="$(sqlite3 "$work/snap.sqlite" 'PRAGMA integrity_check;')"
[[ "$chk" == "ok" ]] || { echo "FAIL integrity: $chk"; [[ -n "$HC" ]] && curl -fsS "$HC/fail" -d "integrity $chk"; exit 1; }

# app-specific health checks - adjust table/row expectations to your schema
tables="$(sqlite3 "$work/snap.sqlite" "SELECT count(*) FROM sqlite_master WHERE type='table';")"
users="$(sqlite3 "$work/snap.sqlite"  "SELECT count(*) FROM users;" 2>/dev/null || echo -1)"
mig="$(sqlite3 "$work/snap.sqlite"    "SELECT count(*) FROM migrations;" 2>/dev/null || echo -1)"
echo "tables=$tables users=$users migrations=$mig  (from $(basename "$latest"))"
{ [[ "$tables" -ge 5 ]] && [[ "$users" -ge 0 ]] && [[ "$mig" -ge 1 ]]; } \
  || { echo "FAIL health checks"; [[ -n "$HC" ]] && curl -fsS "$HC/fail" -d "health t=$tables u=$users m=$mig"; exit 1; }

echo "restore test PASSED"
[[ -n "$HC" ]] && curl -fsS "$HC" || true
```

### If you go with spatie/laravel-backup instead (Option 2 / 4 app layer)

`config/backup.php` essentials:

```php
'backup' => [
    'name' => env('APP_NAME', 'leadlab'),
    'source' => [
        'files' => [
            'include' => [base_path()],
            'exclude' => [
                base_path('vendor'), base_path('node_modules'), base_path('.git'),
                storage_path('framework'), storage_path('logs'), storage_path('debugbar'),
                storage_path('app/livewire-tmp'),
            ],
            'follow_links' => false,
        ],
        'databases' => ['sqlite'],
    ],
    'destination' => [
        'compression_method' => ZipArchive::CM_DEFLATE,
        'disks' => ['nas', 's3'],   // >=2 destinations; run continues if one fails
    ],
    'database_dump_compressor' => Spatie\DbDumper\Compressors\GzipCompressor::class,
],
'encryption' => 'default',          // reads BACKUP_ARCHIVE_PASSWORD - the zip holds .env
```

Make the SQLite copy transactionally consistent with a pre-backup hook (Option 4's key fix):

```php
// app/Providers/AppServiceProvider.php  (boot)
Event::listen(\Spatie\Backup\Events\BackupHasStarted::class, function () {
    // produce a hot, consistent copy the backup will actually pick up
    $live = database_path('database.sqlite');
    $hot  = storage_path('app/backup-tmp/database.sqlite');
    @mkdir(dirname($hot), 0775, true);
    // .backup via the sqlite3 CLI - transactionally consistent on a live WAL DB
    Process::run(['sqlite3', $live, ".timeout 15000", ".backup '{$hot}'"])->throw();
});
```

...and point the `sqlite` connection's backup path (or a dedicated connection) at `storage/app/backup-tmp/database.sqlite`, or add that file to `source.files.include` and exclude the live one. Then:

```php
// routes/console.php
Schedule::command('backup:clean')->daily()->at('01:00');
Schedule::command('backup:run --only-db')->everyTwoHours();
Schedule::command('backup:run')->daily()->at('01:30');           // db + files
Schedule::command('backup:monitor')->hourly();
```

Restore (needs a version compatible with your Laravel 13 / PHP 8.3 - verify, else restore manually by unzipping):

```bash
composer require --dev wnx/laravel-backup-restore
php artisan backup:restore --disk=nas --backup=latest --connection=sqlite --reset --no-interaction
# runs health checks after import; exits non-zero if the restored DB looks empty/wrong
```

---

## Operational checklist

- [ ] SQLite backups use `.backup` / `VACUUM INTO` (or Litestream), never a bare file copy of a live DB.
- [ ] Live DB + `-wal` + `-shm` all on one persisted local volume; not on SMB/NFS.
- [ ] `.env` (APP_KEY!), `storage/app/private`, `storage/app/public` are in the file backup.
- [ ] Backups encrypted at rest on the NAS (spatie AES, or `age`/`gpg` in the script, or PBS encrypted datastore).
- [ ] >=2 destinations; >=1 truly offsite (Hyper Backup from the NAS to C2 / second NAS / rotated USB). 3-2-1.
- [ ] NAS-side immutability: Btrfs snapshot schedule or Hyper Backup versioning on the backup share; backup user can add but not rewrite history.
- [ ] Retention tiers configured (hourly 48 h / daily 14-16 d / weekly 8 w / monthly 4-12 m / yearly 2 y).
- [ ] `PRAGMA integrity_check` on every DB snapshot; abort + alert on failure.
- [ ] Automated nightly restore test (pull from NAS, decompress, integrity + app health checks) wired to a dead-man's-switch.
- [ ] Quarterly manual full-system restore drill from Proxmox/PBS to a scratch VMID; RTO recorded.
- [ ] Alerting on: job failure, no-new-backup-in-N-hours, size anomaly, datastore/NAS free space < 15%, verify-job failure.
- [ ] Runbook written: exact restore steps + where credentials/keys live (and a copy of `.env`/APP_KEY stored somewhere the backup system itself does not depend on).

---

## Sources

- [spatie/laravel-backup - GitHub](https://github.com/spatie/laravel-backup)
- [spatie/laravel-backup - Taking backups (overview)](https://spatie.be/docs/laravel-backup/v10/taking-backups/overview)
- [spatie/laravel-backup - High level overview](https://github.com/spatie/laravel-backup/blob/main/docs/high-level-overview.md)
- [spatie/laravel-backup - Cleaning up old backups (default strategy + defaults)](https://spatie.be/docs/laravel-backup/v10/cleaning-up-old-backups/overview)
- [spatie/laravel-backup - Installation and setup](https://spatie.be/docs/laravel-backup/v10/installation-and-setup)
- [stefanzweifel/wnx laravel-backup-restore - GitHub](https://github.com/stefanzweifel/laravel-backup-restore)
- [Introducing laravel-backup-restore - stefanzweifel.dev](https://stefanzweifel.dev/posts/2023/06/15/introducing-laravel-backup-restore/)
- [Restore Database Backups in Laravel - Laravel News](https://laravel-news.com/laravel-backup-restore)
- [Backup strategies for SQLite in production - Oldmoe's blog](https://oldmoe.blog/2024/04/30/backup-strategies-for-sqlite-in-production/)
- [SQLite User Forum - Hot backup database in WAL mode by copying](https://sqlite.org/forum/forumpost/2ea989bbe9)
- [Ensuring Consistent Backups in SQLite WAL Mode Without Disrupting Writers](https://sqlite.work/ensuring-consistent-backups-in-sqlite-wal-mode-without-disrupting-writers/)
- [How to Back Up SQLite Databases on Ubuntu - OneUptime](https://oneuptime.com/blog/post/2026-03-02-how-to-back-up-sqlite-databases-on-ubuntu/view)
- [How to VACUUM SQLite in WAL Mode (and why you need a checkpoint) - PhotoStructure](https://photostructure.com/coding/how-to-vacuum-sqlite/)
- [SQLite: Vacuuming the WALs - The Unterminated String](https://www.theunterminatedstring.com/sqlite-vacuuming/)
- [Runnable SQLite Docs: Backup & Restore - Coddy](https://coddy.tech/docs/sqlite/backup-and-restore)
- [How to Backup sqlite database properly - vaultwarden discussion](https://github.com/dani-garcia/vaultwarden/discussions/1613)
- [Litestream - Streaming SQLite Replication](https://litestream.io/)
- [Litestream - Getting Started](https://litestream.io/getting-started/)
- [Litestream - restore command reference](https://litestream.io/reference/restore/)
- [SQLite Litestream Replication in Production Guide - Matthew Wong](https://www.matthewswong.com/en/blog/sqlite-litestream-replication-production/)
- [Using SQLite in production with Laravel - Laravel News](https://laravel-news.com/using-sqlite-in-production-with-laravel)
- [Research: SQLite WAL Mode Across Docker Containers Sharing a Volume - Simon Willison](https://simonwillison.net/2026/Apr/7/sqlite-wal-docker-containers/)
- [How to Run SQLite in Docker (When and How) - OneUptime](https://oneuptime.com/blog/post/2026-02-08-how-to-run-sqlite-in-docker-when-and-how/view)
- [Proxmox VE - Backup and Restore (wiki)](https://pve.proxmox.com/wiki/Backup_and_Restore)
- [Proxmox vzdump(1) manpage](https://pve.proxmox.com/pve-docs/vzdump.1.html)
- [Proxmox Backup: The Complete 2026 Guide (PVE + PBS) - Cloud-PBS](https://cloud-pbs.com/resources/proxmox-backup-2026/)
- [Proxmox Backup Strategy: Complete Guide for 2026 and Beyond - Daniele Messi](https://daniele-messi.com/en/blog/proxmox-backup-strategy-complete-guide-for-2026-and-beyond/)
- [Proxmox Backup VM: Complete Guide For IT Teams - Zmanda](https://www.zmanda.com/blog/proxmox-backup-vm-guide/)
- [Hyper Backup - Remote NAS device vs rsync multi-version - SynoForum](https://www.synoforum.com/threads/hyper-backup-remote-nas-device-vs-rsync-multi-version.12267/)
- [rsync vs Hyper Backup - SynoForum](https://www.synoforum.com/threads/rsync-vs-hyper-backup.11346/)
- [Synology backup tools - usage and comparison - blackvoid.club](https://www.blackvoid.club/synology-backup-tools-usage-and-comparison/)
- [Synology Rsync Backup: Hyper Backup to Ubuntu - MorhafSH](https://www.morhafsh.com/blog/how-to-backup-your-synology-nas-using-rsync/)
