# Run Manifest: LeadLab Rebuild Artifact Build 1

| Field | Value |
|-------|-------|
| Workspace | project-artifact-builder |
| Run slug | leadlab-rebuild-build-1 |
| Date | 2026-08-11 |
| Prescription run | `projects/lead-lab/alson-artifact-prescription/leadlab-rebuild-artifacts/` |
| Prescription terminal state | Accepted (approver: requester, recorded 2026-08-11) |
| Source request | Build provisional artifacts for the accepted LeadLab portal rebuild prescription |
| Run path | `projects/lead-lab/alson-artifact-builder/leadlab-rebuild-build-1/` |

## OS Handoff Fields (Project Operating Contract)

| Field | Value |
|-------|-------|
| Handoff ID | HND-03 |
| OS run | None (direct specialist execution chained from HND-02) |
| Trigger | Prescription accepted; user approved build |
| Consumed state | ASR-01 (Prescribed → In progress via DEV-07 shell); prescription dispositions PM-11, PM-23/BA-19, PM-31, BA-15, BA-34, DEV-03, DEV-06, DEV-07, DEV-08, DEV-10 |
| Produced state | 10 provisional artifact shells; package index; information backlog |
| Approval boundary | None for shell production; artifact activation requires DEC-01/DEC-02 decisions |
| Return trigger | DEC-01 decided (activate gated shells); then DEC-02 (DEV-07 content) |
| Open items | DEC-01, DEC-02, NEED-03, DEC-06; all TBDs in information backlog |
| State | Content pending |

## Actionable Artifacts

| Count | Value |
|-------|-------|
| Total actionable | 10 (all Create later → deferred shells) |
| Combined entries | 1 (PM-23/BA-19 acceptance criteria) |
| Conditional shells | 1 (DEV-10, activates only if DEC-01 = custom code) |
| Hard dependency chains | 1 intra-package (PM-23 → DEV-08); remainder gated on external decisions |

## Outputs

| Stage | File |
|-------|------|
| 01 Plan | `stages/01-plan/artifact-build-plan.md` |
| 02 Build | `stages/02-build/artifacts/*.md`, `package-index.md`, `information-backlog.md` |
| 03 Measure | `stages/03-measure/artifact-quality-report.md` |
| 04 Learn | `stages/04-learn/what-now.md` |
