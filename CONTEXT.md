# Lead Lab (lead-lab)

Rebuild of the LeadLab Portal on a new platform to replace SharePoint. Same feature scope, restricted to participants, live before Sep 11, 2026.

Always load `AGENTS.md` for identity and output rules.

## Status

| Area | Status | Evidence |
|------|--------|----------|
| Project intake | Complete, accepted (100% quality) | `alson-project-intake/leadlab-rebuild/stages/02-measure/output/audit-findings.md` |
| Platform decision | Open, blocks all build work | request brief, Risks and Open Questions |
| Access decision | Open | request brief, Risks and Open Questions |
| Build | Not started, blocked on decisions | - |
| Deadline | Before Sep 11, 2026 | request brief, Timing |

## Folder Map

```text
lead-lab/
├── CONTEXT.md              (you are here)
├── Old artifacts/          (closed-project source: charter, closure report, procedures)
└── alson-project-intake/
    └── leadlab-rebuild/    (accepted intake run: request brief, audit, what-now)
```

## Task Routing

| Task | Go To | Description |
|------|-------|-------------|
| Recheck project intent or details | `alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` | Accepted brief, all fields sourced |
| Decide platform or access | `workspaces/project-decision-readiness/` | Intake flags platform and access as blocking decisions |
| Check next actions | `alson-project-intake/leadlab-rebuild/stages/03-learn/output/what-now.md` | Prioritized actions: platform first |
| Verify against closed project facts | `Old artifacts/` | Charter, closure report, portal procedures |
| Start the build | Do not start until platform and access are decided | Current intake shows no build plan yet |

## What to Load

| Task | Load These | Do Not Load |
|------|-----------|-------------|
| Status or routing | This file only | - |
| Project details | `request-brief.md` | Full `Old artifacts/` scan |
| Decisions | `project-decision-readiness/CONTEXT.md` and intake evidence | Build outputs |
| Audit or history | `Old artifacts/`, intake run | - |

## Triggers

| Keyword | Action |
|---------|--------|
| `status` | Show current status and open decisions |
