# Review Mandate

**Date:** 2026-08-11
**Run type:** Baseline

## Project

| Field | Value |
|-------|-------|
| Project name | LeadLab Portal Rebuild (lead-lab) |
| Project objective | Rebuild the LeadLab Portal on a new platform to replace SharePoint. Same feature scope, restricted to participants, live before Sep 11, 2026. |
| Review date | 2026-08-11 |
| Review cadence | Weekly |

## Decision Makers

| Role | Name | Authority |
|------|------|-----------|
| Primary decision maker | LeadLab Director | Final OK on the portal; accepts review |
| Secondary | Joven Francis C. Agno (Lead Dev / PM) | Accept review, authorize changes, PM decisions |
| Supporting | Requester + IT team; IT Director | Platform and access decisions (D-01, D-02) before build |
| Not engaged in rebuild evidence | Carmen Sarmiento (Owner), Stephen Salainti (Sponsor), Ryann Micua (Technical Adviser) | Roles from closed-project charter; current rebuild engagement not documented |

## Evidence Availability

| Category | Available | Location | Missing |
|----------|-----------|----------|---------|
| Governance | Yes | `projects/lead-lab/CONTEXT.md`, `artifacts/logs and registers/decision-log.md` | Decision-readiness and next-actions runs cited in CONTEXT.md not on disk; no escalation protocol; PM entry not yet in decision log |
| Scope | Yes | `alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md`, `artifacts/logs and registers/backlog.md` | Per-feature acceptance criteria; formal scope approval by LeadLab Director (D-08) |
| Schedule | Partial | request brief Timing; decision log due dates; backlog | No milestone list, schedule baseline, or variance records (deferred by prescription until D-01) |
| Finance | Partial | request brief Constraints; `Old artifacts/Project Closure Report.docx` | No cost records; domain/platform cost unknown (D-05); no budget by design |
| Stakeholders | Partial | request brief People; `Old artifacts/Project Charter.docx` | No stakeholder register or engagement plan; sponsor and participant engagement in rebuild undocumented |
| Resources | Partial | request brief People; `artifacts/logs and registers/dependencies-log.md` | No resource plan or availability data; hosting/domain resource undecided (D-05) |
| Risk | Yes | `artifacts/logs and registers/` (risk-register, issues-log, assumption-log, dependencies-log) | Human validation of AI-derived entries; monitoring dates on risks |
| RAID | Yes | `projects/lead-lab/artifacts/logs and registers/` (risk, issues, assumption, dependencies, decision log, backlog), all dated 11-Aug-2026 | None missing; entries unvalidated by PM; risks carry no due dates |

## Tolerances

| Domain | Variance Trigger |
|--------|------------------|
| Governance | Decisions open past due date; decision log not updated |
| Scope | Scope change without record; acceptance criteria undefined at build start |
| Schedule | Deadline slip risk (no fallback date confirmed); build not started by next review |
| Finance | Any unplanned cost (platform subscription, domain) without coverage |
| Stakeholders | Sponsor or LeadLab Director disengaged; participant access unclear |
| Resources | Named resource bottleneck on critical path; hosting undecided at build start |
| Risk | High-exposure risk (P x I >= 12) materialized without mitigation; RAID unvalidated past one cycle |

## Accepted Baseline Reference

| Field | Value |
|-------|-------|
| Prior accepted run | null (first run) |
| Prior acceptance date | null (first run) |
