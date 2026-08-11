# Run Manifest

- **Skill:** Project Next Actions
- **Workspace:** `project-next-actions`
- **Date:** 2026-08-11
- **Run mode:** Revision cycle (cycle 2; continuation of `leadlab-rebuild-cycle-1`)
- **Run path:** `projects/lead-lab/alson-next-actions/leadlab-rebuild-cycle-2/`
- **Run slug:** `leadlab-rebuild-cycle-2`
- **Output root:** `projects/lead-lab/alson-next-actions/`

## Source Request

> Read `projects/lead-lab/CONTEXT.md` and execute the full project-next-actions pipeline for `projects/lead-lab/`.

## Project Identification

- Project: Lead Lab (lead-lab)
- Request brief ID: `leadlab-rebuild-2026-08-11` (accepted, 100% quality)
- Prior next-actions run: `projects/lead-lab/alson-next-actions/leadlab-rebuild-cycle-1/` (quality 96.9%, governance pending)
- Upstream intake run: `projects/lead-lab/alson-project-intake/leadlab-rebuild/`
- Upstream decision run: `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/`
- Upstream artifact-prescription run: `projects/lead-lab/alson-artifact-prescription/leadlab-rebuild-artifacts/`

## Evidence Sources

| # | Source | Location |
|---|--------|----------|
| 1 | Project CONTEXT | `projects/lead-lab/CONTEXT.md` |
| 2 | Cycle 1 what-now | `projects/lead-lab/alson-next-actions/leadlab-rebuild-cycle-1/stages/06-learn/what-now.md` |
| 3 | Cycle 1 next actions | `projects/lead-lab/alson-next-actions/leadlab-rebuild-cycle-1/stages/04-recommend/project-next-actions.md` |
| 4 | Artifact-prescription handoff (ASR-01 return) | `projects/lead-lab/alson-artifact-prescription/leadlab-rebuild-artifacts/stages/05-report/artifact-support-handoff.md` |
| 5 | Artifact-prescription what-now | `projects/lead-lab/alson-artifact-prescription/leadlab-rebuild-artifacts/stages/07-learn/what-now.md` |
| 6 | Decision readiness register | `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/stages/04-readiness-assessment/decision-readiness-register.md` |
| 7 | Request brief | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` |
| 8 | Risk register | `projects/lead-lab/artifacts/logs and registers/risk-register.md` |
| 9 | Decision log | `projects/lead-lab/artifacts/logs and registers/decision-log.md` |
| 10 | Issue log | `projects/lead-lab/artifacts/logs and registers/issues-log.md` |

## OS Handoff

| Field | Value |
|---|---|
| Handoff ID | `HND-03` |
| OS run | None (direct invocation; OS contract applied) |
| Source workflow | `project-next-actions` / `leadlab-rebuild-cycle-2` |
| Trigger | User request: run full project-next-actions pipeline for `projects/lead-lab/`; prior cycle recommendation to re-run when ACT-01..04 complete, DEC-01 decided, or 1 week without progress |
| Consumed state | Cycle 1 handoff HND-02 (ACT-01..06); ASR-01 return via `project-artifact-prescription` (DEV-07 Create later); DEC-01..08, NEED-01..08; logs and registers R-01..07, D-01..08, ISS-01..07 |
| Produced state | ACT-07..ACT-12 (cycle 2 recommendations) |
| Outcome | Project position assessed: At risk (unchanged); DEC-01 still blocks all build work; ASR-01 loop closed with a staged prescription; cycle 2 focuses on executing the four evidence actions and deciding DEC-01 |
| State | Governance pending (quality gate; decision maker response required) |
| Approval boundary | Platform decision (DEC-01) approval by requester + IT Director; final OK by LeadLab Director |
| Referral | `project-decision-readiness` (re-run when immediate actions complete); `mits` (daily execution) |
| Return trigger | DEC-01 decided, or immediate actions complete, or decision maker requests review |
| Canonical effect | None yet; recommendations are proposed outputs |
| Next control action | Present next actions to requester; execute ACT-07..10; decide DEC-01 |
| Open items | DEC-01 to DEC-08; NEED-01 to NEED-08; ACT-01 to ACT-06 carried from cycle 1; DEV-07 staged on DEC-01/DEC-02 |

## Artifacts

| Stage | Artifact | Path |
|---|---|---|
| 01 Intake | Analysis mandate | `stages/01-intake/analysis-mandate.md` |
| 02 Evidence | Project evidence base | `stages/02-evidence/project-evidence-base.md` |
| 03 Assessment | Project situation assessment | `stages/03-assessment/project-situation-assessment.md` |
| 04 Recommend | Project next actions | `stages/04-recommend/project-next-actions.md` |
| 05 Measure | Audit findings | `stages/05-measure/audit-findings.md` |
| 06 Learn | Next-cycle handoff | `stages/06-learn/what-now.md` |
