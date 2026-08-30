# Agent Operability: Deployment Platform Research

**Research Date:** 2026-08-30
**Purpose:** Evaluate Coolify, Dokploy, and Kamal 2 for AI agent automation of Laravel deployments.

---

## Executive Summary

| Platform | API Quality | CLI Quality | Agent Score | Verdict |
|----------|------------|-------------|-------------|---------|
| **Coolify** | Excellent (REST, OpenAPI, Bearer auth) | Official Go CLI | **4/5** | Best API-first PaaS for agents |
| **Dokploy** | Good (tRPC + OpenAPI, x-api-key auth) | Official npm CLI (449 commands) | **4/5** | Strong, some log gaps |
| **Kamal 2** | N/A (CLI-only) | Excellent (Ruby gem) | **5/5** | Pure CLI, zero UI dependency |

**Recommendation:** Kamal 2 scores highest for agent operability because it is 100% CLI with no server component. Coolify is the best API-first PaaS if you also want a web dashboard for human operators.

> **Note:** Kamal 2 is also covered as **Option 2** in `deployment-method.md` (lines 301-405), including a full `deploy.yml` example, zero-downtime setup, and integration with GitHub Actions, GHCR, Litestream, and cloudflared. Refer to that document for the complete deployment architecture; this document focuses on API/CLI operability.

---

## Coolify

### API

- **Type:** REST API v1
- **Base URL:** `https://<instance>/api/v1`
- **Auth:** Bearer tokens (Laravel Sanctum). Tokens are team-scoped with granular permissions: `read`, `read:sensitive`, `write`, `deploy`, `root`.
- **Rate Limit:** 200 req/min (configurable via `API_RATE_LIMIT` env var)
- **Docs:** OpenAPI 3.1 spec, Swagger UI available
- **Endpoints cover:** Applications, databases, services, servers, deployments, projects, destinations, teams, notifications, scheduled tasks, S3, tags, shared env vars, private keys, system

**Key API operations:**
- Deploy: `POST /api/v1/deploy?uuid=<app-uuid>&force=true`
- Rollback: Not directly exposed (see gaps)
- Env vars: Full CRUD on shared environment variables
- Deployments list: `GET /api/v1/applications/{uuid}/deployments`
- Deployment logs: Available via API
- Webhook deploys: `GET /api/v1/deploy?uuid=<app-uuid>` (authenticated via Bearer)

### CLI

- **Official:** `coollabsio/coolify-cli` (Go binary)
- **Install:** `curl -fsSL https://raw.githubusercontent.com/coollabsio/coolify-cli/main/scripts/install.sh | bash` or `brew install coollabsio/coolify-cli/coolify-cli`
- **Auth:** Bearer token, stored per-context in `~/.config/coolify/config.json`
- **Output:** JSON mode (`--json`) for machine parsing

**CLI commands (full list):**
- `coolify app list/get/create/delete/start/stop/restart/update`
- `coolify app logs <uuid>` (with `--follow`, `--lines`, `--show-timestamps`)
- `coolify app deployments list/logs`
- `coolify app env set/get/delete/bulk-set`
- `coolify database list/get/create/delete` (postgresql, mysql, mariadb, mongodb, redis, etc.)
- `coolify server list/get/create/update/delete/setup`
- `coolify project list/get/create/update/delete`
- `coolify deploy` (trigger deploy)
- `coolify resources list`

### Capability Matrix

| Operation | API | CLI | Automatable? |
|-----------|-----|-----|-------------|
| Deploy | Yes | Yes | Yes |
| Rollback | **No dedicated endpoint** | **No CLI command** | No - must track and redeploy previous image |
| Status/Health | Yes (application details) | Yes | Yes |
| View Logs (app) | Yes | Yes | Yes |
| View Logs (deployment) | Yes | Yes | Yes |
| Env Vars | Yes (shared env vars) | Yes | Yes |
| Secrets | Via env vars | Via env vars | Yes |
| List Deployments | Yes | Yes | Yes |
| Create/Delete App | Yes | Yes | Yes |
| Server Management | Yes | Yes | Yes |
| Webhook Deploy | Yes (authenticated GET/POST) | N/A | Yes |

### Gaps / UI-Only Operations

1. **Rollback** - No API endpoint or CLI command for rollback. Must re-deploy a previous image tag.
2. **Application config changes** - Some advanced settings (buildpack config, docker options) may require API patching rather than a simple CLI command.
3. **Initial setup** - Server SSH key setup, initial Coolify installation require manual steps.

### Agent Score: 4/5

Coolify has the most complete API surface of any PaaS. The official CLI wraps every API call. The `--json` output mode makes parsing trivial for agents. Webhook deploys enable CI/CD-style automation. The significant gap is rollback - no API endpoint or CLI command exists, so the agent must track deployment versions and re-deploy the target image.

---

## Dokploy

### API

- **Type:** tRPC with OpenAPI auto-generation + dedicated REST endpoints
- **Base URL:** `https://<instance>/api`
- **Auth:** `x-api-key` header (API key generated in dashboard)
- **Rate Limit:** 100 req/min (authenticated)
- **Docs:** Swagger UI at `/api/docs`, Redoc at `/api/redoc`
- **Scope:** 500+ endpoints across 49 routers (auto-generated from tRPC)

**Key API operations:**
- Deploy: `POST /api/application.deploy` with `{ "applicationId": "..." }`
- Rollback: `POST /api/rollback.rollback` with `{ "rollbackId": "..." }`
- Rollback delete: `POST /api/rollback.delete`
- Application details: `POST /api/application.one`
- Env vars: Available through application update endpoints
- Webhook deploy: Each app has a webhook URL that triggers redeployment

### CLI

- **Official:** `@dokploy/cli` (npm, 449 commands auto-generated from OpenAPI spec)
- **Install:** `npm install -g @dokploy/cli`
- **Auth:** `dokploy auth -u <url> -t <api-key>` or env vars `DOKPLOY_URL` + `DOKPLOY_API_KEY`
- **Output:** `--json` flag for machine-readable output

**CLI commands (highlights):**
- `dokploy application create/deploy/stop/delete/all/one`
- `dokploy project all/one/create`
- `dokploy postgres/mysql/mariadb/mongo/redis create/stop/start/delete`
- `dokploy deployment allByCompose` (deployment history)
- `dokploy rollback rollback/delete`
- `dokploy compose deploy/sync/stop/start`
- 449 total commands covering every API endpoint

**Third-party CLI tools:**
- `dokploy-ctl` - AI-native CLI with workflow commands (deploy, status, logs, restart)
- `@sebbev/dokploy-cli` - Community CLI with app/project/env management
- `dokploy-mcp` - MCP server for AI agent integration

### Capability Matrix

| Operation | API | CLI | Automatable? |
|-----------|-----|-----|-------------|
| Deploy | Yes | Yes | Yes |
| Rollback | Yes (`rollback.rollback`) | Yes | Yes |
| Status/Health | Yes (`application.one`) | Yes | Yes |
| View Logs (build) | Yes (deployment logs) | Yes | Yes |
| View Logs (runtime) | **No REST endpoint** (WebSocket only) | Partial (via `dokploy-ctl`) | **Limited** |
| Env Vars | Yes | Yes | Yes |
| Secrets | Via env vars | Via env vars | Yes |
| List Deployments | Yes | Yes | Yes |
| Create/Delete App | Yes | Yes | Yes |
| Server Management | Yes | Yes | Yes |
| Webhook Deploy | Yes (per-app webhook URL) | N/A | Yes |

### Gaps / UI-Only Operations

1. **Runtime logs** - Container runtime logs (stdout/stderr) are only accessible via WebSocket in the UI. No REST API endpoint exists (GitHub issue #3719 is open). Workaround: SSH and `docker logs`.
2. **Rollback configuration** - Registry-based rollback must be enabled via UI before it works via API.
3. **Some compose operations** - Raw Docker Compose deployments have limited API support for certain operations.

### Agent Score: 4/5

Dokploy has an extensive API and official CLI with 449 commands. The rollback API is a significant advantage over Coolify. The main gap is runtime logs, which require WebSocket access or SSH as a workaround. The MCP server integration is a bonus for AI agents.

---

## Kamal 2

### Overview

Kamal is a CLI-only deployment tool. It has no server-side API, no dashboard - it is a Ruby gem that runs commands from your local machine via SSH.

### CLI Commands

| Command | Description |
|---------|-------------|
| `kamal deploy` | Deploy app to servers (build, push, pull, health check, switchover) |
| `kamal rollback [VERSION]` | Rollback to a previous image version |
| `kamal details` | Show details about all containers |
| `kamal app logs [-f]` | View/follow application logs |
| `kamal app containers` | List all containers including old versions |
| `kamal app exec` | Execute commands in running containers |
| `kamal setup` | Initial server setup + deploy |
| `kamal remove` | Remove everything from servers |
| `kamal build` | Build application image |
| `kamal registry` | Login/logout of container registry |
| `kamal secrets push` | Push secrets to servers |
| `kamal env` | Manage environment files |
| `kamal lock/unlock` | Manage deploy lock |
| `kamal prune` | Prune old images and containers |
| `kamal audit` | Show audit log from servers |
| `kamal accessory` | Manage accessories (db, redis, etc.) |
| `kamal server` | Bootstrap servers with Docker |
| `kamal config` | Show combined config |
| `kamal redeploy` | Redeploy without full bootstrap |

**Common options across all commands:**
- `--verbose` / `--quiet`
- `--hosts` (target specific hosts)
- `--primary` (primary host only)
- `--version` (run against specific app version)
- `--skip-hooks`

### Config Structure (`config/deploy.yml`)

```yaml
service: myapp

image: registry.example.com/myapp

servers:
  web:
    - 192.168.0.1
  job:
    hosts:
      - 192.168.0.1
    cmd: bundle exec sidekiq

proxy:
  ssl: true
  host: myapp.example.com
  app_port: 3000

registry:
  server: registry.example.com
  username: myuser
  password:
    - KAMAL_REGISTRY_PASSWORD

builder:
  arch: amd64

env:
  clear:
    RAILS_ENV: production
  secret:
    - RAILS_MASTER_KEY

accessories:
  db:
    image: mysql:8.0
    host: 192.168.0.2
    port: "3306:3306"
    env:
      secret:
        - MYSQL_ROOT_PASSWORD
    directories:
      - data:/var/lib/mysql
```

### Capability Matrix

| Operation | CLI | Automatable? |
|-----------|-----|-------------|
| Deploy | `kamal deploy` | Yes |
| Rollback | `kamal rollback <version>` | Yes |
| Status | `kamal details` | Yes |
| View Logs | `kamal app logs` | Yes |
| Exec | `kamal app exec` | Yes |
| Secrets | `kamal secrets push` | Yes |
| Env Vars | `kamal env` | Yes |
| Setup | `kamal setup` | Yes |
| Remove | `kamal remove` | Yes |
| Build | `kamal build` | Yes |
| Prune | `kamal prune` | Yes |

### Gaps / UI-Only Operations

None. Kamal is 100% CLI-operated.

### Agent Score: 4/5

Kamal is the most agent-friendly tool because it requires no server component and no API - everything is a CLI command. The trade-off is that it has no web dashboard and no REST API, so the agent must have SSH access to the target server and a container registry. For pure automation this is ideal; for teams that want a visual dashboard, it falls short.

---

## Comparison Summary

### API & CLI Comparison

| Feature | Coolify | Dokploy | Kamal 2 |
|---------|---------|---------|---------|
| REST API | Yes (v1, OpenAPI) | Yes (tRPC + OpenAPI) | No |
| Official CLI | Yes (Go binary) | Yes (npm, 449 cmds) | Yes (Ruby gem) |
| Auth method | Bearer token | x-api-key | SSH keys |
| Deploy via API | Yes | Yes | N/A (CLI only) |
| Rollback via API | **No** | Yes | N/A (CLI: `kamal rollback`) |
| Logs via API | Yes | Build yes, runtime **no** | N/A (CLI: `kamal app logs`) |
| Env var management | Yes | Yes | Yes |
| Webhook deploys | Yes | Yes | No (CI via `kamal deploy`) |
| JSON output | Yes (`--json`) | Yes (`--json`) | No (human-readable) |
| Health checks | Yes | Yes | Yes |
| MCP integration | Community | Official | No |
| Multi-server | Yes | Yes | Yes |

### What Requires Human UI

| Operation | Coolify | Dokploy | Kamal 2 |
|-----------|---------|---------|---------|
| Initial setup | Some (server SSH) | Some (server setup) | No |
| Deploy | No | No | No |
| Rollback | **Yes** (no API) | No (API available) | No |
| View logs | No | **Runtime logs: Yes** | No |
| Env/secrets | No | No | No |
| Server management | No | No | No |

### Agent-Operability Score

| Platform | Score | Reasoning |
|----------|-------|-----------|
| **Kamal 2** | **5/5** | Pure CLI, no server component, full lifecycle (deploy, rollback, status, logs, exec). Zero UI dependency. Ideal for agent automation. |
| **Coolify** | **4/5** | Comprehensive REST API, official CLI with JSON output, webhook deploys, granular auth. Deducted for: no rollback API. |
| **Dokploy** | **4/5** | Excellent API (500+ endpoints), official CLI (449 commands), rollback API. Deducted for: runtime logs only via WebSocket, some config requires UI. |

### Recommendation for AI-Agent Deployment

**Kamal 2 is the top choice** for pure AI-agent automation because:

1. **Zero UI dependency** - 100% CLI, no server component to maintain
2. **Full lifecycle** - deploy, rollback, status, logs, exec all via CLI
3. **Simple architecture** - YAML config + SSH, no PaaS layer
4. **No API needed** - agents run commands directly
5. **Direct control** - SSH-level access for debugging

**Coolify is the best PaaS choice** if you also want a web dashboard for human operators:

1. **Complete API surface** - Every significant operation has an API endpoint
2. **Official CLI** - `coolify` CLI wraps all API calls with JSON output for machine parsing
3. **Webhook deploys** - Agents can trigger deploys via simple HTTP requests
4. **Granular auth** - Tokens with specific permissions (`deploy`, `read:sensitive`) limit blast radius
5. **Self-hosted** - Full control over the platform
6. **Trade-off:** No rollback API - agent must track and redeploy previous images

**Dokploy is viable** but the runtime log gap (issue #3719) and some UI-only configuration make it less ideal for full agent automation without human intervention.

---

## References

- Coolify API docs: https://coolify.io/docs/api-reference
- Coolify CLI: https://github.com/coollabsio/coolify-cli
- Dokploy API docs: https://docs.dokploy.com/docs/api
- Dokploy CLI: https://github.com/Dokploy/cli
- Dokploy runtime logs issue: https://github.com/Dokploy/dokploy/issues/3719
- Kamal docs: https://kamal-deploy.org/docs/
- Kamal config reference: https://kamal-deploy.org/docs/configuration/overview/
