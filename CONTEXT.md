# Lead Lab (lead-lab)

Rebuild of the LeadLab Portal on a new platform to replace SharePoint. Same feature scope, restricted to participants, live before Sep 11, 2026.

Always load `AGENTS.md` for identity and output rules.

## Status


| Area            | Status                            | Evidence                                                                          |
| --------------- | --------------------------------- | --------------------------------------------------------------------------------- |
| Project intake  | Complete, accepted (100% quality) | `alson-project-intake/leadlab-rebuild/stages/02-measure/output/audit-findings.md` |
| Funding         | Confirmed; IT Department shoulders third-party costs (D-09) | `artifacts/logs and registers/decision-log.md` (D-09) |
| Access decision | Open (D-02); unblocked by D-01 | `artifacts/logs and registers/decision-log.md` (D-02) |
| Build           | Not started, blocked on D-02 (access) and D-05 (server/domain) | - |
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
| Start the build                     | Do not start until access (D-02) and server/domain (D-05) are confirmed                             | D-01 decided (WordPress); D-02/D-05 gate build work |


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
