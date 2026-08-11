# Run Manifest

- **Skill:** Project Next Actions
- **Workspace:** `project-next-actions`
- **Date:** 2026-08-11
- **Run mode:** First run
- **Run path:** `projects/lead-lab/alson-next-actions/leadlab-rebuild-cycle-1/`
- **Run slug:** `leadlab-rebuild-cycle-1`
- **Output root:** `projects/lead-lab/alson-next-actions/`

## Source Request

> Read `projects/lead-lab/CONTEXT.md` and execute the full project-next-actions pipeline for `projects/lead-lab/`.

## Project Identification

- Project: Lead Lab (lead-lab)
- Request brief ID: `leadlab-rebuild-2026-08-11` (accepted, 100% quality)
- Upstream intake run: `projects/lead-lab/alson-project-intake/leadlab-rebuild/`
- Upstream decision run: `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/`

## Evidence Sources

| # | Source | Location |
|---|--------|----------|
| 1 | Project CONTEXT | `projects/lead-lab/CONTEXT.md` |
| 2 | Request brief | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` |
| 3 | Intake audit findings | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/02-measure/output/audit-findings.md` |
| 4 | Intake what-now | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/03-learn/output/what-now.md` |
| 5 | Decision readiness brief | `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/stages/05-decision-brief/project-decision-readiness-brief.md` |
| 6 | Decision readiness register | `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/stages/04-readiness-assessment/decision-readiness-register.md` |
| 7 | Decision evidence base | `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/stages/02-evidence/decision-evidence-base.md` |
| 8 | Decision audit findings | `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/stages/06-measure/audit-findings.md` |
| 9 | Decision what-now | `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/stages/07-learn/what-now.md` |
| 10 | Decision run manifest | `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/run-manifest.md` |

## OS Handoff

| Field | Value |
|---|---|
| Handoff ID | `HND-02` |
| OS run | None (direct invocation; OS contract applied) |
| Source workflow | `project-next-actions` / `leadlab-rebuild-cycle-1` |
| Trigger | User request: run full project-next-actions pipeline for `projects/lead-lab/` |
| Consumed state | Request brief `leadlab-rebuild-2026-08-11`; intake audit (100% quality); intake what-now; decision readiness run `leadlab-rebuild-decisions` (DEC-01 to DEC-08, NEED-01 to NEED-08, ASR-01, HND-01) |
| Produced state | ACT-01 to ACT-06 (actions and decisions); next-cycle recommendations |
| Outcome | Project position assessed: At risk, blocked on platform decision DEC-01. Five immediate actions and two current-phase actions recommended; two referral monitors tracked. |
| State | Governance pending (quality passed; requester response required) |
| Approval boundary | Platform decision (DEC-01) approval by requester + IT Director; final OK by LeadLab Director |
| Referral | `project-decision-readiness` (re-run when immediate actions complete); `project-artifact-prescription` (ASR-01 return monitor); `mits` (daily execution) |
| Return trigger | DEC-01 decided, or immediate actions complete, or decision maker requests review |
| Canonical effect | None yet; recommendations are proposed outputs |
| Next control action | Present next actions to requester; run immediate actions; record DEC-01 outcome |
| Open items | DEC-01 to DEC-08; NEED-01 to NEED-08; ASR-01; ACT-01 to ACT-06 |

## Artifacts

| Stage | Artifact | Path |
|---|---|---|
| 01 Intake | Analysis mandate | `stages/01-intake/analysis-mandate.md` |
| 02 Evidence | Project evidence base | `stages/02-evidence/project-evidence-base.md` |
| 03 Assessment | Project situation assessment | `stages/03-assessment/project-situation-assessment.md` |
| 04 Recommend | Project next actions | `stages/04-recommend/project-next-actions.md` |
| 05 Measure | Audit findings | `stages/05-measure/audit-findings.md` |
| 06 Learn | Next-cycle handoff | `stages/06-learn/what-now.md` |
