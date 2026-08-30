# Email Delivery Options - Laravel 13 Calendar/Registration App

Research date: 2026-08-30

## 1. Context and volume model

**App:** Laravel 13, Fortify auth, calendar event reminders, participant registration.
**Infra:** Proxmox (on-prem), Microsoft 365 tenant, Synology NAS, Docker deployment, low cost.
**Budget:** < $50/mo additional. **Users:** 50-200, internal + public participants.

### Email types and estimated volume

| Email type | Trigger | Recipients | Est. monthly volume |
|---|---|---|---|
| Email verification (Fortify) | Signup / resend | 1 (the user) | 50-300 |
| Registration alert to admins | Participant registers for event | 1-3 admins | 300-900 |
| Event reminder: 3-day | Scheduled batch per event | all registrants | ~1 x registrants x events |
| Event reminder: 1-day | Scheduled batch per event | all registrants | ~1 x registrants x events |
| Event reminder: 15-min | Scheduled batch per event | all registrants | ~1 x registrants x events |

Realistic steady state: **3,000-8,000 emails/month**. Peak: an event with 150-200
registrants generates a **150-200 email burst inside a 1-2 minute window** for the
15-minute reminder. Daily peak on a busy event day: 600-1,200 emails.

This volume is trivially small for every transactional service and sits near the
edge of the free tiers only because of the **burst pattern** (per-second and
per-minute caps matter more than monthly caps).

---

## 2. Option A - Microsoft 365 SMTP (existing tenant)

### Sub-methods (M365 has several; they are not equivalent)

| Method | External recipients? | Auth | Practical cap | Cost |
|---|---|---|---|---|
| **SMTP AUTH client submission** (`smtp.office365.com:587`) | Yes | Basic auth being retired; OAuth2 only going forward | 30 msg/min, 10,000 recipients/day per mailbox | Included in license |
| **Direct Send** (`<tenant>.mail.protection.outlook.com`) | Internal only | None (IP-based) | Higher, but internal-only | Included |
| **Connector / SMTP relay** (inbound connector, cert or static IP) | Yes | Cert or source IP | ~10,000/day, still throttled | Included |
| **High Volume Email (HVE)** | **Internal only** - rejects external mail | Dedicated HVE accounts | 100,000/day | Metered: **$42 per 1M recipients** from 2026-06-01 |
| **Azure Communication Services (ACS) Email** | Yes | Connection string / Entra | Very high | **$0.00025/email** + $0.00012/MB |

### Critical caveat - Basic auth deprecation

Microsoft is retiring **Basic authentication for SMTP AUTH client submission**.
The timeline has slipped repeatedly (rejection ramp began ~March 2026, with full
enforcement pushed toward **late December 2026**, and new tenants defaulting to
OAuth-only afterward). As of this research date you must assume:

- **Do not build on `MAIL_USERNAME` / `MAIL_PASSWORD` Basic auth against M365.** It
  is end-of-life within months and may already be throttled/rejected on your tenant.
- OAuth2 client-credentials flow for SMTP AUTH is possible but Laravel's Symfony
  Mailer `EsmtpTransport` has **no built-in M365 OAuth2 token provider**. You would
  add a custom transport / `Swift`-style XOAUTH2 shim or a community package and
  handle token refresh yourself. This is real ongoing maintenance.
- The "blessed" Microsoft paths for app-generated mail are now **Microsoft Graph
  `sendMail`** or **Azure Communication Services**, not SMTP.

### Laravel config (if you still use SMTP AUTH short-term)

`.env`:
```dotenv
MAIL_MAILER=m365
MAIL_SCHEME=smtp
MAIL_HOST=smtp.office365.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com   # a licensed mailbox
MAIL_PASSWORD=                         # app password / Basic auth - being killed
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

`config/mail.php` -> `mailers`:
```php
'm365' => [
    'transport' => 'smtp',
    'url' => env('MAIL_URL'),
    'host' => env('MAIL_HOST', 'smtp.office365.com'),
    'port' => env('MAIL_PORT', 587),
    'encryption' => env('MAIL_ENCRYPTION', 'tls'),
    'username' => env('MAIL_USERNAME'),
    'password' => env('MAIL_PASSWORD'),
    'timeout' => 30,
    'local_domain' => env('MAIL_EHLO_DOMAIN', parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST)),
    // From must equal the authenticated mailbox or a configured "Send As" alias.
],
```

**Graph API alternative** (survives the deprecation): use a package such as
`microsoft/microsoft-graph` + a custom Mailer transport, or
`innoflash/laravel-ms-graph-mail` style community drivers. Auth is Entra app
registration with `Mail.Send` application permission (optionally scoped to one
mailbox via an application access policy).

### Deliverability

- SPF: your domain already publishes `include:spf.protection.outlook.com` if MX is
  M365. DKIM: enable per-domain DKIM in Defender / Exchange admin (two CNAMEs).
  DMARC: you likely already have a record; keep `p=none` until you confirm the app
  mail passes alignment.
- Shared outbound IP pool - reputation is managed by Microsoft and is generally
  good, but you share it with the whole tenant and cannot warm a dedicated IP.
- From-address must be a real mailbox you control; SNDS/feedback loop tooling is
  limited compared to a transactional ESP.

### Rate limits vs. our burst

30 messages/minute per mailbox is the binding constraint. A 200-registrant 15-min
reminder blast takes **~7 minutes to drain** through one mailbox. With Laravel
queue + a `->throttle()` / rate-limited job this is *tolerable* for 3-day and
1-day reminders but **erodes the precision of the 15-minute reminder** (some
recipients get it at T-8 min). Splitting across 2-3 sender mailboxes is a hack,
not a design.

### Cost

$0 incremental for SMTP AUTH / Direct Send / connector (within license).
HVE would be internal-only and ~$0.30/mo at our volume but cannot email participants.

### Verdict

Fine for **internal admin alerts** (small volume, internal recipients, Direct Send
or a mailbox). **Not a good primary channel for participant-facing mail** in 2026
because of the auth deprecation and the 30/min throttle.

---

## 3. Option B - Self-hosted mail server (Mailcow / Mailu on Proxmox)

### What it is

`docker-compose` stack: Mailcow bundles Postfix, Dovecot, Rspamd, ClamAV, SOGo,
Nginx, Redis, MariaDB. Mailu is a lighter equivalent. Runs as a VM/LXC on the
Proxmox cluster.

### Requirements and effort

- Dedicated VM: **>= 4 GB RAM, 2 vCPU, ~40 GB disk**, plus antivirus RAM headroom.
- **Outbound port 25** must be open from your network to the internet. Many
  business/residential ISPs block or filter 25; you may need a business circuit or
  an SMTP smarthost (which defeats the purpose).
- **Static IP with a matching PTR / reverse DNS record** - requires ISP
  cooperation. Consumer/most on-prem IP ranges are on PBL/blocklists by default.
- Full DNS control: A/AAAA, PTR, SPF (`v=spf1 ip4:<your-ip> -all`), DKIM
  (generated by Rspamd), DMARC, MTA-STS + TLS-RPT recommended.
- Ongoing: **1-2 hours/month** minimum - container updates, log review, blocklist
  monitoring, cert renewal, spam-rule tuning, security patching. You are now
  running mail-server security surface for a calendar app.

### Deliverability reality

Even with flawless SPF/DKIM/DMARC, a **cold self-hosted IP lands in Gmail/Outlook
spam for days to weeks** and needs slow warmup. Any transient compromise or
misconfiguration can get the IP blocklisted, and delisting from Microsoft SNDS in
particular is slow. For **verification emails and time-sensitive reminders**,
spam-foldering is a functional outage.

### Laravel config

Identical to any SMTP server:
```dotenv
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
```

### Cost

No per-message fee. Real cost is the VM resources you already own **plus your
time**, plus possibly a business internet circuit / static IP fee. Blocklist
monitoring tools (optional) add cost.

### Compliance

You become the data processor and are fully responsible for TLS, at-rest
encryption, retention, and breach handling. More burden, not less.

### Verdict

**Not recommended** for this use case. Justified only if you also want to host
real user mailboxes/calendars (SOGo) for the organization. For transactional-only
sending it is the highest-effort, highest-risk, lowest-deliverability option.

---

## 4. Option C - Transactional email service

### Pricing snapshot (2026)

| Service | Free tier | Entry paid | Per-email at our scale | Notes |
|---|---|---|---|---|
| **Amazon SES** | 3,000 msg/mo for 12 mo (accounts pre-2025-07-15); newer accounts get $200 credits instead | none needed | **$0.10 / 1,000** => ~$0.30-0.80/mo | Native Laravel driver. Sandbox until you request production access. |
| **Brevo** | **300/day (~9,000/mo), forever** | Starter **$9/mo = 5,000/mo**; ~$18 = 20k; ~$29 = 40k | $0-9/mo | EU (France) company; dashboard, logs, SMTP + REST API. Logo on free/Starter unless +$10.80/mo. |
| **Postmark** | 100/mo dev only | **$15/mo = 10,000/mo**, overage $1.80/1k | $15/mo | Best-in-class deliverability + message history UI. Strict on non-transactional content. |
| **Mailgun** | 100/day (test only) | Foundation **$35/mo = 50,000/mo** | $35/mo | Free tier too small for our burst; entry paid tier over-provisioned for us. |
| **SendGrid** | removed (60-day trial only) | Email API from ~$19.95/mo | ~$20/mo | No longer the default pick since the free tier was cut in 2025. |

### 4a. Amazon SES

**Laravel driver:** first-class. Uses the SES `SendEmail` / v2 API over HTTPS - no
SMTP port needed, so it works cleanly from behind the Proxmox egress firewall and
from Docker without port 587/25 open.

```bash
composer require aws/aws-sdk-php
```

`.env`:
```dotenv
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=eu-west-1        # Ireland or eu-central-1 Frankfurt for GDPR data residency
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
SES_CONFIGURATION_SET=leadlab-app  # for event tracking / bounce routing
```

`config/services.php`:
```php
'ses' => [
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    // optional: 'token' => env('AWS_SESSION_TOKEN'),
],
```

`config/mail.php` -> `mailers`:
```php
'ses' => [
    'transport' => 'ses',
    // Passed straight to the AWS SDK SendEmail call:
    'options' => [
        'ConfigurationSetName' => env('SES_CONFIGURATION_SET'),
        // 'Tags' => [['Name' => 'type', 'Value' => 'reminder']],
    ],
],
```

Use an **IAM user (or role) scoped to `ses:SendEmail` / `ses:SendRawEmail` only**,
ideally with a condition on `ses:FromAddress`.

**Sandbox -> production:** new accounts start in sandbox (200 msg/day, 1/sec,
verified recipients only). Submit the production-access request describing:
transactional-only content, opt-in via account registration + double opt-in email
verification, and that bounces/complaints are handled via SNS auto-suppression.
Approval is typically ~24h. Production starting quota is commonly **~50,000/day
and ~14 msg/sec**, region-specific - **easily covers our 200-email burst in ~15
seconds**, which comfortably preserves 15-minute-reminder precision.

**Deliverability:** verify the domain; SES gives you **3 DKIM CNAME records**
(Easy DKIM). Add SPF via a **custom MAIL FROM subdomain** (e.g.
`bounce.yourdomain.com` with `MX` -> `feedback-smtp.<region>.amazonses.com` and
`TXT "v=spf1 include:amazonses.com -all"`) so SPF aligns without touching your
root SPF (which stays pointed at M365). Keep DMARC `p=none`, monitor aggregate
reports, then move to `quarantine`/`reject`. Shared IP pool by default is fine at
this volume; a dedicated IP (~$25/mo) is **not** worth it under ~100k/mo and would
need warmup.

**Bounce/complaint handling (required, not optional):** create an SES
Configuration Set with an SNS destination for `Bounce` and `Complaint`, point SNS
at a Laravel webhook route, and persist a suppression list you check before
sending reminders. Also enable **account-level suppression list** (SES managed).

**Cost at our scale:** ~$0.30-$0.80/month. Effectively free. Only extra costs
would be optional dedicated IP, VDM ($0.07/1,000), or SNS at negligible volume.

### 4b. Brevo (easiest, no AWS account)

**Laravel:** use plain SMTP (no extra package) or the REST API via
`getbrevo/brevo-php`.

```dotenv
MAIL_MAILER=brevo
```
`config/mail.php`:
```php
'brevo' => [
    'transport' => 'smtp',
    'host' => 'smtp-relay.brevo.com',
    'port' => 587,
    'encryption' => 'tls',
    'username' => env('BREVO_SMTP_USER'),   // your Brevo login
    'password' => env('BREVO_SMTP_KEY'),    // SMTP key, not account password
],
```
Deliverability: authenticate your domain in Brevo's dashboard - it provides a
`brevo._domainkey` DKIM CNAME (actually two) and a Brevo SPF include or a
`mail.yourdomain.com` subdomain delegation; DMARC as above. Brevo runs shared IPs
with decent reputation and a good log/event UI.

**Binding limit: 300 emails/day on the free plan.** A single 150-200 registrant
event reminder consumes most of a day's quota and a busy event day will exceed it.
Plan on the **$9/mo Starter (5,000/mo)** if you go this route - still well under
budget - and note there is **no documented hard per-second cap** that would hurt
the 15-min burst.

### 4c. Postmark (deliverability premium)

Same Laravel pattern - dedicated `postmark` transport is built in:
```bash
composer require symfony/postmark-mailer symfony/http-client
```
```php
'postmark' => [
    'transport' => 'postmark',
    'token' => env('POSTMARK_TOKEN'),
    'message_stream_id' => env('POSTMARK_MESSAGE_STREAM_ID'), // e.g. "outbound"
],
```
Use the **transactional message stream** for verification/alerts and a separate
**broadcast stream** for reminders (Postmark enforces this separation).
$15/mo flat for 10,000 - over budget-justifiable, and the strongest inbox
placement of the group, with a searchable 45-day message history that is very
handy for "did the reminder actually send?" support questions.

### Queue integration (same for all services)

- Mark mailables/notifications `implements ShouldQueue` (or `Mail::to()->queue()`).
- `QUEUE_CONNECTION=redis` (Redis on the NAS or a sidecar container) or `database`.
- Run `php artisan queue:work --queue=reminders,mail,default` under **Supervisor
  or a systemd unit** in the Docker image (or a dedicated worker container).
  Consider **Laravel Horizon** for Redis (dashboard + auto-balancing).
- **Dedicated `reminders` queue with its own worker** so a backlog of verification
  emails never delays a time-sensitive 15-min reminder. Give it higher priority.
- Set `failed_jobs` + retry policy (`--tries=3 --backoff=60`); alert on failures.
- Per-provider throttle when needed:
  `Redis::throttle('m365-send')->allow(28)->every(60)` inside the job, or the
  `RateLimited` middleware. Not needed for SES production (14/s headroom).

### Calendar reminder scheduling (queued + time-sensitive)

Recommended pattern - **scheduler sweep, not delayed dispatch**:

```php
// routes/console.php  (Laravel 13)
Schedule::command('reminders:dispatch')->everyMinute()
    ->withoutOverlapping()->runInBackground();
```

`reminders:dispatch` each minute:
1. Query registrations whose event `starts_at` falls in a due window
   (`[now, now+3d]` boundary crossing, `+1d`, `+15m`) and that have **no row in a
   `sent_reminders(registration_id, offset)` table**.
2. For each, `SendEventReminder::dispatch($registration, $offset)->onQueue('reminders')`.
3. The job re-checks idempotency (`sent_reminders` unique constraint) inside a
   `Cache::lock()` before sending, then records the send.

Why not `->delay(now()->addDays(3))`? Delayed jobs sitting in the queue for days
are fragile: they don't reflect **event time changes or cancellations**, DB/Redis
queue growth, or worker restarts losing visibility. A per-minute sweep is
self-healing, handles reschedules, and keeps the 15-min reminder accurate to
within one minute + queue latency (sub-second on SES).

Precision budget for the 15-min reminder: scheduler tick (<=60 s) + queue pickup
(<=few s) + provider accept (SES ~0.1 s/msg, 14/s => 200 msgs in ~15 s). Total
worst case ~75 s. With M365 SMTP (30/min) the same burst adds ~6.5 min of skew -
the concrete reason to prefer a transactional service for reminders.

### Compliance and privacy (transactional services)

- **Data residency:** SES `eu-west-1` (Ireland) or `eu-central-1` (Frankfurt)
  keeps message content in the EU; Brevo is EU-headquartered (France); Postmark is
  US (ActiveCampaign) with an EU data-region option on request. Pick to match your
  tenant's residency posture.
- **DPA:** AWS DPA is incorporated by reference in the AWS agreement; Brevo and
  Postmark publish DPAs - execute whichever applies.
- **Lawful basis:** verification + registration-confirmation + event reminders are
  **contractual / legitimate interest** tied to the user's own registration, so
  no marketing consent needed - but store the registration timestamp as your
  audit trail and let participants **opt out of reminder emails** in their profile
  (still send the transactional verification/receipt).
- **Minimize PII in payloads:** pass IDs to queued jobs (`SerializesModels` does
  this), render content at send time; don't log full message bodies.
- **Retention:** cap provider log retention (SES event logs via config set, Brevo
  30-90 days, Postmark 45 days) and your own `sent_reminders` table.
- Suppression list handling (bounces/complaints) is also a GDPR data-accuracy plus.

---

## 5. Option D - Hybrid: M365 internal + transactional external

**Design:** route by audience using Laravel's multi-mailer support.

```php
// config/mail.php
'mailers' => [
    'ses'  => [ /* as in 4a - participant-facing */ ],
    'm365' => [ /* as in section 2 - internal admin alerts */ ],
],
```

```php
// Admin registration alert - internal recipients, low volume
Mail::mailer('m365')->to($admins)->queue(new RegistrationReceived($registration));

// Verification + reminders - participant-facing
Mail::mailer('ses')->to($user)->queue(new VerifyEmail($user));
SendEventReminder::dispatch($registration, $offset)->onQueue('reminders'); // uses 'ses' default
```

Or set `MAIL_MAILER=ses` as default and only override to `m365` for the admin
alert path.

**Pros:** admin alerts stay entirely inside the M365 trust boundary (no external
processor sees internal staff addresses/content); participant mail gets ESP-grade
deliverability and burst capacity; still ~$0-9/mo.

**Cons:** two sender identities, two DKIM setups, two failure modes to monitor.
The M365 leg still faces the Basic-auth deprecation - so the internal leg should
use **Direct Send** (`<tenant>.mail.protection.outlook.com`, no auth, internal
recipients only) or Graph API, both of which survive the deprecation.

**Practical take:** the isolation benefit is modest for a 1-3 admin alert. Worth
it only if org policy requires internal comms not transit a third party.
Otherwise send everything via the transactional service and skip the second
integration.

---

## 6. Recommendation matrix

Scoring: 5 = best fit for this app. Weighted for: deliverability, burst handling,
setup+maintenance effort, cost, and 2026 longevity.

| Criterion | M365 SMTP | Self-hosted (Mailcow) | Amazon SES | Brevo | Postmark | Hybrid (SES+M365) |
|---|---|---|---|---|---|---|
| Laravel integration | 3 (custom OAuth transport) | 4 (plain SMTP) | **5 (native `ses` driver)** | 4 (SMTP/API) | 5 (native `postmark`) | 4 |
| Deliverability / reputation | 3 (shared tenant IP) | 1 (cold IP, spam risk) | 4 (good, needs DKIM+MAIL FROM) | 4 (good shared IPs) | **5 (top tier)** | 4 |
| Burst / rate capacity (200 in ~1 min) | 2 (30/min throttle) | 3 (self-managed) | **5 (14/s prod)** | 4 (no hard per-sec cap) | 5 | 5 |
| Setup complexity | 2 (OAuth, deprecation) | 1 (DNS, PTR, port 25, VM) | 4 (sandbox req + SNS wiring) | **5 (dashboard, minutes)** | 5 (dashboard) | 3 |
| Ongoing maintenance | 3 (auth migration looming) | 1 (1-2 h/mo, security) | 4 (bounce webhook, quotas) | **5 (managed)** | 5 (managed) | 3 |
| Cost at 3-8k/mo | **5 ($0)** | 3 (VM + possible circuit/IP $) | **5 (~$0.50/mo)** | 5 ($0-9/mo) | 3 ($15/mo) | 5 (~$0-9/mo) |
| 2026+ longevity | 2 (Basic auth EOL) | 3 | **5** | 5 | 5 | 4 |
| Privacy control | 4 (in-tenant) | **5 (fully self-hosted)** | 3 (US co., EU region avail.) | 4 (EU co.) | 3 (US co.) | 4 |
| **Fit total** | **26** | **21** | **35** | **36** | **36** | **32** |

---

## 7. Top pick

### Primary: Amazon SES via Laravel's native `ses` driver

**Why:**
- **Native Laravel 13 support** - `MAIL_MAILER=ses`, `aws/aws-sdk-php`, a small
  `config/services.php` block. HTTPS API means no SMTP egress port to open from
  Proxmox/Docker.
- **Cost ~$0.30-$0.80/month** for our volume - the cheapest credible option by an
  order of magnitude, far under the $50 budget, with no tier cliffs as the app
  grows.
- **Burst capacity solves the 15-minute reminder problem**: 14 msg/sec in
  production clears a 200-person blast in ~15 seconds, so reminder timing stays
  accurate to about a minute end to end.
- **Deliverability is solid** with Easy DKIM (3 CNAMEs) + a custom MAIL FROM
  subdomain for SPF alignment, leaving your root domain's M365 SPF untouched.
- **EU region** (`eu-west-1` / `eu-central-1`) keeps content in-region for GDPR.
- Longevity: no looming auth deprecation, unlike M365 SMTP.

**Accepted costs / setup tasks:**
1. Request production access (~24h) with a transactional-use description.
2. Wire an SNS -> Laravel webhook for bounces/complaints + a suppression check
   before reminder sends (this is the one piece of real integration work).
3. DNS: 3 DKIM CNAMEs, MAIL FROM subdomain MX+TXT, keep DMARC `p=none` -> tighten.
4. IAM user scoped to `ses:SendEmail` only.

### If you want zero AWS and a dashboard: Brevo

Start on the **free 300/day** tier for dev and launch; move to **$9/mo Starter
(5,000/mo)** before your first large event so a single reminder blast doesn't
exhaust the daily quota. Plain SMTP config, domain authentication in their UI,
built-in event logs. Slightly less setup than SES, slightly less headroom, still
trivially within budget. This is the pragmatic pick if operational simplicity
matters more than the last few dollars.

### If deliverability of the verification email is mission-critical: Postmark

$15/mo flat for 10,000, native `postmark` transport, separate transactional vs.
broadcast streams, best inbox placement and the nicest "prove it sent" message
history. Over budget-justifiable, still well under $50.

### Not recommended

- **Self-hosted Mailcow/Mailu** - only if you also want to host organizational
  mailboxes. For transactional-only it is the worst effort/deliverability/risk
  trade-off (cold IP spam-foldering, port 25 egress, PTR dependency, 1-2 h/mo
  security upkeep).
- **M365 SMTP as the *primary* channel** - Basic-auth retirement plus the 30/min
  throttle make it a poor fit for participant-facing and burst reminder mail.

### Optional refinement: hybrid

Keep SES as the default mailer and add `Mail::mailer('m365')` (via Direct Send or
Graph, not Basic auth SMTP) **only** for the admin registration alert, if org
policy says internal staff email must not transit a third-party processor.
Otherwise send everything through SES and keep one integration to monitor.

---

## Sources

- [Office 365 SMTP: the 5 relay methods that work in 2026 - The Inbox Ledger](https://theinboxledger.com/office-365-smtp/)
- [High volume mails in Microsoft 365 - Microsoft Learn](https://learn.microsoft.com/Exchange/mail-flow-best-practices/high-volume-mails-m365)
- [Exchange Online to retire Basic auth for Client Submission (SMTP AUTH) - Microsoft Community Hub](https://techcommunity.microsoft.com/blog/exchange/exchange-online-to-retire-basic-auth-for-client-submission-smtp-auth/4114750)
- [Updated Exchange Online SMTP AUTH Basic Authentication Deprecation Timeline - Microsoft Community Hub](https://techcommunity.microsoft.com/blog/exchange/updated-exchange-online-smtp-auth-basic-authentication-deprecation-timeline/4489835)
- [SMTP AUTH Client Submission Retirement Delayed - Office 365 for IT Pros](https://office365itpros.com/2026/01/29/smtp-auth-basic-retirement/)
- [MC1243552 - High Volume Email for Microsoft 365 now generally available](https://mc.merill.net/message/MC1243552)
- [High-Volume Email (HVE) is GA and Ready for Charging - Office 365 for IT Pros](https://office365itpros.com/2026/04/23/hve-ga-charging/)
- [Email pricing - Azure Communication Services - Microsoft Learn](https://learn.microsoft.com/en-us/azure/communication-services/concepts/email-pricing)
- [Microsoft 365 vs. Azure: Choosing the Right Service for High-Volume Emails - Techielass](https://www.techielass.com/high-volume-email-vs-azure-communication-services/)
- [Self-hosted email in 2026: mailcow vs Stalwart vs Mailu - profor.pro](https://profor.pro/blog/self-hosted-email-2026-mailcow-stalwart-mailu/)
- [Running Your Own Mail Server in 2026: Mailcow, Mail-in-a-Box, and the Deliverability Problem - netguardia.com](https://netguardia.com/privacy/self-hosting/running-your-own-mail-server-in-2026-mailcow-mail-in-a-box-and-the-deliverability-problem/)
- [Mailcow Setup Guide 2026: Docker Deployment, Hardening, and Deliverability - OSH](https://www.offshoreserverhosting.com/blog/mailcow-setup-guide-2026-docker-deployment-hardening-deliverability/)
- [Amazon SES Pricing 2026: Calculator, Limits, Use Cases - CampaignHQ](https://blog.campaignhq.co/amazon-ses-pricing-2026/)
- [Amazon SES Pricing 2026: Free Tier Catches to Know - SaaS Price Pulse](https://www.saaspricepulse.com/tools/amazon-ses)
- [Request production access (Moving out of the Amazon SES sandbox) - AWS docs](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Increasing your Amazon SES sending quotas - AWS docs](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas-request-increase.html)
- [How to Move Amazon SES Out of the Sandbox - OneUptime](https://oneuptime.com/blog/post/2026-02-12-move-amazon-ses-out-of-sandbox/view)
- [Mail - Laravel 13.x docs](https://laravel.com/docs/13.x/mail)
- [Task Scheduling - Laravel 13.x docs](https://laravel.com/docs/13.x/scheduling)
- [Sending Scheduled Emails (Queues or Cron?) - Laracasts](https://laracasts.com/discuss/channels/general-discussion/sending-scheduled-emails-queues-or-cron)
- [10 Best Transactional Email Services Compared (2026) - Brevo](https://www.brevo.com/blog/best-transactional-email-services/)
- [Brevo Pricing 2026: All Plans, Cost per Email & Hidden Fees - smtpedia](https://smtpedia.com/brevo-pricing/)
- [SendGrid Free Tier 2026: Current Limits & Plans - SaaS Price Pulse](https://www.saaspricepulse.com/tools/sendgrid)
- [Postmark Pricing 2026: $15/mo for 10K Emails + History - SaaS Price Pulse](https://www.saaspricepulse.com/tools/postmark)
- [Mailgun Pricing 2026: $35/mo Foundation - SaaS Price Pulse](https://www.saaspricepulse.com/tools/mailgun)
- [6 Best Transactional Email Services Compared [2026] - Mailtrap](https://mailtrap.io/blog/transactional-email-services/)
