# Run Manifest

| Field | Value |
|-------|-------|
| Workspace | project-performance-domain-review |
| Run slug | leadlab-rebuild-cycle-1 |
| Run path | `projects/lead-lab/project-performance-domain-review/leadlab-rebuild-cycle-1/` |
| Run type | Baseline (first run) |
| Date | 2026-08-11 |
| Project | LeadLab Portal Rebuild (lead-lab) |
| Request | Execute the full project performance domain review pipeline for lead-lab |
| Coordinator | Standalone run (not OS-coordinated; no OS orientation exists for lead-lab) |
| Cadence | Weekly |
| Prior accepted baseline | none (first run) |
| Accepted baseline on acceptance | `stages/04-review/project-performance-domain-review.md` (this run becomes baseline when accepted by LeadLab Director / PM) |

## Evidence Sources

| Role | Path |
|------|------|
| Project container | `projects/lead-lab/CONTEXT.md` |
| Request brief (accepted, 100%) | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` |
| Intake audit | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/02-measure/output/audit-findings.md` |
| Intake handoff | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/03-learn/output/what-now.md` |
| Artifact prescription (100%) | `projects/lead-lab/alson-project-artifact-prescription/leadlab-rebuild-prescription/stages/05-report/project-artifact-prescription.md` |
| Prescription handoff | `projects/lead-lab/alson-project-artifact-prescription/leadlab-rebuild-prescription/stages/07-learn/what-now.md` |
| RAID (risk, issues, assumptions, dependencies, decision log, backlog) | `projects/lead-lab/artifacts/logs and registers/` |
| Closed-project source | `projects/lead-lab/Old artifacts/` (Project Charter.docx, Project Closure Report.docx) |
| Supporting context (optional, not required) | Prescription run outputs above; intake run outputs above |

## Notes

- Prior workspace outputs are supporting context only; they are never required inputs.
- Conflict: `CONTEXT.md` cites decision-readiness (95.7%) and next-actions (96.9%) runs that do not exist on disk. Prescription audit also flagged this. Recorded in evidence register as a conflict.
- RAID health check in scope this cycle (default for all cycles).

## Pipeline Completion

| Stage | Artifact | Status |
|-------|----------|--------|
| 01-intake | `stages/01-intake/review-mandate.md` | Complete |
| 02-evidence | `stages/02-evidence/domain-evidence-register.md` | Complete |
| 03-assessment | `stages/03-assessment/domain-assessment.md` | Complete |
| 04-review | `stages/04-review/project-performance-domain-review.md`, `stages/04-review/build-handoff.md` | Complete |
| 05-measure | `stages/05-measure/audit-findings.md` | Complete (quality 100%, gate Pass) |
| 06-learn | `stages/06-learn/what-now.md` | Complete (Governance pending) |
