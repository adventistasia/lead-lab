# Lead Lab (lead-lab)

Rebuild of the LeadLab Portal on a new platform to replace SharePoint. Same feature scope, restricted to participants, live before Sep 11, 2026.

Always load `AGENTS.md` for identity and output rules.

## Status


| Area            | Status                            | Evidence                                                                          |
| --------------- | --------------------------------- | --------------------------------------------------------------------------------- |
| Project intake  | Complete, accepted (100% quality) | `alson-project-intake/leadlab-rebuild/stages/02-measure/output/audit-findings.md` |
| Funding         | Confirmed; IT Department shoulders third-party costs (D-09) | `artifacts/logs and registers/decision-log.md` (D-09) |
| Access decision | Made; native WordPress login selected for the prototype (D-02) | `artifacts/logs and registers/decision-log.md` (D-02) |
| Build           | In progress; WordPress is deployed on the team's server in staging; theme setup and prototype validation remain | Conversation (PM update, 2026-08-18) |
| Production readiness | Deferred to a later stage; D-05 remains open for domain, DNS, SSL, backups, and uptime | `artifacts/logs and registers/decision-log.md` (D-05) |
| Maintenance     | IT team assigned to maintain WordPress and the server after launch (D-03) | `artifacts/logs and registers/decision-log.md` (D-03) |
| Deadline        | Before Sep 11, 2026               | request brief, Timing                                                             |


## Folder Map

```text
lead-lab/
├── CONTEXT.md              (you are here)
├── Old artifacts/          (closed-project source: charter, closure report, procedures)
├── alson-project-intake/
│   └── leadlab-rebuild/    (accepted intake run: request brief, audit, what-now)
└── artifacts/
    └── logs and registers/ (decision log, RAID logs, backlog)
```

## Task Routing


| Task                                | Go To                                                                          | Description                                |
| ----------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| Recheck project intent or details   | `alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` | Accepted brief, all fields sourced         |
| Verify against closed project facts | `Old artifacts/`                                                               | Charter, closure report, portal procedures |
| Start the prototype build           | Staging WordPress is deployed; configure the theme and validate the accepted feature scope. Do not move to production until D-05 is confirmed | D-01 and D-02 decided; D-05 remains a production gate |


## What to Load


| Task              | Load These                   | Do Not Load                |
| ----------------- | ---------------------------- | -------------------------- |
| Status or routing | This file only               | -                          |
| Project details   | `request-brief.md`           | Full `Old artifacts/` scan |
| Audit or history  | `Old artifacts/`, intake run | -                          |


## Triggers


| Keyword  | Action                                 |
| -------- | -------------------------------------- |
| `status` | Show current status and open decisions |
