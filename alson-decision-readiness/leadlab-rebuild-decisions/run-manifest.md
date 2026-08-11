# Run Manifest

- **Skill:** Alson Project Decision Readiness
- **Workspace:** `project-decision-readiness`
- **Date:** 2026-08-11
- **Run mode:** First run
- **Run path:** `projects/lead-lab/alson-decision-readiness/leadlab-rebuild-decisions/`
- **Run slug:** `leadlab-rebuild-decisions`
- **Output root:** `projects/lead-lab/alson-decision-readiness/`

## Source Request

> Run the full project-decision-readiness pipeline for `projects/lead-lab/`. Platform and access decisions are open and block all build work.

## Project Identification

- Project: Lead Lab (lead-lab)
- Request brief ID: `leadlab-rebuild-2026-08-11` (accepted, 100% quality)
- Upstream intake run: `projects/lead-lab/alson-project-intake/leadlab-rebuild/`

## Evidence Sources

| # | Source | Location |
|---|--------|----------|
| 1 | Request brief | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` |
| 2 | Intake audit findings | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/02-measure/output/audit-findings.md` |
| 3 | Intake what-now | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/03-learn/output/what-now.md` |
| 4 | Intake run manifest | `projects/lead-lab/alson-project-intake/leadlab-rebuild/run-manifest.md` |
| 5 | Project Charter | `projects/lead-lab/Old artifacts/Project Charter.docx` |
| 6 | Project Closure Report | `projects/lead-lab/Old artifacts/Project Closure Report.docx` |
| 7 | Procedure: adding videos | `projects/lead-lab/Old artifacts/Procedures/How to add videos in the portal.docx` |
| 8 | Procedure: granting access | `projects/lead-lab/Old artifacts/Procedures/How to give Lead Lab participants access to the portal.docx` |

Unreadable: two `.webm` training videos (`LeadLab Portal - Process Part 1/2.webm`). Reason: video format, no transcript; excluded, procedures cover the same content in text.

## OS Handoff

| Field | Value |
|---|---|
| Handoff ID | `HND-01` |
| OS run | None (direct invocation; OS contract applied) |
| Source workflow | `project-decision-readiness` / `leadlab-rebuild-decisions` |
| Trigger | User request: run full decision-readiness pipeline for `projects/lead-lab/` |
| Consumed state | Request brief `leadlab-rebuild-2026-08-11`; intake audit findings (100% quality); intake what-now; charter; closure report; two procedures |
| Produced state | DEC-01 to DEC-08; NEED-01 to NEED-08; ASR-01 |
| Outcome | Platform and access decisions assessed; readiness states, interventions, prioritized action plan |
| State | Governance pending (quality passed; decision maker response required) |
| Approval boundary | Platform decision (DEC-01) approval by requester / IT Director; final OK by LeadLab Director |
| Referral | `project-artifact-prescription` for ASR-01 (durable participant access handling record) |
| Return trigger | Decision maker responds to the brief; next Alson Project OS control loop |
| Canonical effect | None yet; brief and register are proposed outputs |
| Next control action | Present brief to decision maker; record decision outcome |
| Open items | DEC-01 to DEC-08 (open decisions); NEED-01 to NEED-08; ASR-01 |

## Artifacts

| Stage | Artifact | Path |
|---|---|---|
| 01 Intake | Decision mandate | `stages/01-intake/decision-mandate.md` |
| 02 Evidence | Decision evidence base | `stages/02-evidence/decision-evidence-base.md` |
| 03 Landscape | Decision landscape | `stages/03-decision-landscape/decision-landscape.md` |
| 04 Readiness | Readiness register | `stages/04-readiness-assessment/decision-readiness-register.md` |
| 04 Readiness | Dependency map | `stages/04-readiness-assessment/decision-dependency-map.csv` |
| 04 Readiness | Artifact-support request | `stages/04-readiness-assessment/artifact-support-request.md` |
| 05 Brief | Project decision readiness brief | `stages/05-decision-brief/project-decision-readiness-brief.md` |
| 06 Measure | Audit findings | `stages/06-measure/audit-findings.md` |
| 07 Learn | Next-cycle handoff | `stages/07-learn/what-now.md` |
