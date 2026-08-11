# Lead Lab (lead-lab)

Rebuild of the LeadLab Portal on a new platform to replace SharePoint. Same feature scope, restricted to participants, live before Sep 11, 2026.

Always load `AGENTS.md` for identity and output rules.

## Status

| Area | Status | Evidence |
|------|--------|----------|
| Project intake | Complete, accepted (100% quality) | `alson-project-intake/leadlab-rebuild/stages/02-measure/output/audit-findings.md` |
| Decision readiness | Complete, passed quality (95.7%), governance pending | `alson-decision-readiness/leadlab-rebuild-decisions/stages/06-measure/audit-findings.md` |
| Next actions | Complete, passed quality (96.9%), governance pending | `alson-next-actions/leadlab-rebuild-cycle-1/stages/05-measure/audit-findings.md` |
| Platform decision | Open, blocked on option comparison; blocks all build work | `alson-decision-readiness/leadlab-rebuild-decisions/stages/04-readiness-assessment/decision-readiness-register.md` (DEC-01) |
| Access decision | Open, blocked on DEC-01 | decision readiness register (DEC-02) |
| Build | Not started, blocked on decisions | - |
| Deadline | Before Sep 11, 2026 | request brief, Timing |

## Folder Map

```text
lead-lab/
├── CONTEXT.md              (you are here)
├── Old artifacts/          (closed-project source: charter, closure report, procedures)
├── alson-project-intake/
│   └── leadlab-rebuild/    (accepted intake run: request brief, audit, what-now)
├── alson-decision-readiness/
│   └── leadlab-rebuild-decisions/  (8 decisions DEC-01..08, needs, brief, what-now)
└── alson-next-actions/
    └── leadlab-rebuild-cycle-1/    (ACT-01..06 recommendations, audit, what-now)
```

## Task Routing

| Task | Go To | Description |
|------|-------|-------------|
| Recheck project intent or details | `alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` | Accepted brief, all fields sourced |
| Decide platform or access | `alson-decision-readiness/leadlab-rebuild-decisions/stages/05-decision-brief/project-decision-readiness-brief.md` | 8 assessed decisions; DEC-01 blocked pending option comparison |
| Check next actions | `alson-next-actions/leadlab-rebuild-cycle-1/stages/04-recommend/project-next-actions.md` | ACT-01..06: compare platforms, spike, date ask, privacy ask, decide DEC-01 |
| Verify against closed project facts | `Old artifacts/` | Charter, closure report, portal procedures |
| Start the build | Do not start until platform and access are decided | DEC-01 gates all build work |

## What to Load

| Task | Load These | Do Not Load |
|------|-----------|-------------|
| Status or routing | This file only | - |
| Project details | `request-brief.md` | Full `Old artifacts/` scan |
| Decisions | `alson-decision-readiness/` outputs | Build outputs |
| Next actions | `alson-next-actions/` outputs | - |
| Audit or history | `Old artifacts/`, intake run | - |

## Triggers

| Keyword | Action |
|---------|--------|
| `status` | Show current status and open decisions |
