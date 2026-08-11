# Run Manifest: LeadLab Rebuild Artifact Prescription

| Field | Value |
|-------|-------|
| Workspace | project-artifact-prescription |
| Run slug | leadlab-rebuild-artifacts |
| Date | 2026-08-11 |
| Mode | Full baseline (fallback rule) with ASR-01 response |
| Output root | `projects/lead-lab/` |
| Run path | `projects/lead-lab/alson-artifact-prescription/leadlab-rebuild-artifacts/` |
| Source request | ASR-01 from `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/stages/04-readiness-assessment/artifact-support-request.md` |
| Upstream run | `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/` |
| Prior accepted baseline | None found. Decision-linked revision cannot run (handoff contract, Full-Baseline Fallback Rule); full baseline executed, ASR-01 addressed within it |
| Project manager / prescription approver | Requester (IT team member; named responsible person in accepted request brief) |

## Why This Mode

The artifact-support request (ASR-01) arrived with no accepted baseline prescription in the repository. Per `_core/decision-artifact-handoff.md` lines 126-128, the pipeline runs a full baseline covering all PM, BA, and DEV catalog items, and returns the artifact-support handoff for ASR-01 from the baseline.

## Evidence Consumed

| Source | Location | Role |
|--------|----------|------|
| Request brief (accepted intake) | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` | Project intent, scope, people, constraints |
| Decision readiness register | `.../alson-decision-readiness/leadlab-rebuild-decisions/stages/04-readiness-assessment/decision-readiness-register.md` | DEC-01..08, NEED-01..08, ASR-01 |
| Artifact-support request | `.../stages/04-readiness-assessment/artifact-support-request.md` | ASR-01 referral |
| Decision evidence base | `.../stages/02-evidence/decision-evidence-base.md` | O-1..O-30 observations |
| Next actions | `projects/lead-lab/alson-next-actions/leadlab-rebuild-cycle-1/stages/04-recommend/project-next-actions.md` | ACT-01..06, HND-01 referral |
| Canonical registers | `projects/lead-lab/artifacts/logs and registers/` (assumption-log, backlog, decision-log, dependencies-log, issues-log, risk-register) | Existing PM-45, PM-48, PM-08, PM-15, PM-44 carriers |
| Old artifacts | `projects/lead-lab/Old artifacts/` (Project Charter.docx, Project Closure Report.docx, two procedures) | Historical facts, reference procedure |

## OS Handoff Fields (Project Operating Contract)

| Field | Value |
|-------|-------|
| Handoff ID | HND-02 (return of ASR-01 referral, which used HND-01) |
| OS run | None (not an OS-coordinated loop run; direct specialist execution) |
| Trigger | ASR-01 artifact-support request from decision readiness; no prior baseline existed |
| Consumed state | NEED-05 (Referred), DEC-02 (Blocked), DEC-01 (Blocked); canonical registers PM-08, PM-15, PM-44, PM-45, PM-48 |
| Produced state | ASR-01 → disposition Create later on DEV-07; baseline dispositions for 104 catalog items; HND-02 |
| Approval boundary | Project manager (requester) acceptance of the prescription; artifact creation actions execute only after DEC-01/DEC-02 decisions by IT Director |
| Return trigger | Decision readiness reassessment of DEC-02 when the access handling record exists and its acceptance test passes |
| Open items | DEC-01 (Blocked upstream), DEC-02 (Blocked), NEED-03 (privacy basis unconfirmed) |
| State | Accepted (approver: requester, recorded 2026-08-11) |

## Outputs

| Stage | File |
|-------|------|
| 01 Intake | `stages/01-intake/investigation-brief.md` |
| 02 Source inventory | `stages/02-source-inventory/source-inventory.md` |
| 03 Project assessment | `stages/03-project-assessment/project-assessment.md` |
| 04 Artifact prescription | `stages/04-artifact-prescription/artifact-prescription-register.md`, `dependency-map.csv` |
| 05 Report | `stages/05-report/project-artifact-prescription.md`, `artifact-support-handoff.md` |
| 06 Measure | `stages/06-measure/audit-findings.md` |
| 07 Learn | `stages/07-learn/what-now.md` |
