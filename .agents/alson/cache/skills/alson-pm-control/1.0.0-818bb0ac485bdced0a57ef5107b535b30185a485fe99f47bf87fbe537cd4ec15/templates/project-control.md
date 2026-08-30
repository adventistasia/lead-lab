# {{PROJECT_NAME}} Project Control

**Overall condition:** {{ON_TRACK_ATTENTION_AT_RISK_OR_INSUFFICIENT_EVIDENCE}}

**Last updated:** {{YYYY-MM-DD}}

This is the small PM dashboard. It is a generated view of the canonical control records.
Do not copy register rows, long histories, process mechanics, or evidence packages into this file.

## Overall Condition

{{ONE_OR_TWO_SENTENCE_PROJECT_SUMMARY}}

## What Needs Attention

- {{MATERIAL_ITEM_OR_NONE}}
- {{MATERIAL_ITEM_OR_NONE}}
- {{MATERIAL_ITEM_OR_NONE}}

## Current Domains

| Area | Condition | What matters |
|---|---|---|
| Scope | {{CONDITION}} | {{MATERIAL_FINDING_OR_NONE}} |
| Schedule | {{CONDITION}} | {{MATERIAL_FINDING_OR_NONE}} |
| Finance | {{CONDITION}} | {{MATERIAL_FINDING_OR_NONE}} |
| Stakeholders | {{CONDITION}} | {{MATERIAL_FINDING_OR_NONE}} |
| Resources | {{CONDITION}} | {{MATERIAL_FINDING_OR_NONE}} |
| Risk | {{CONDITION}} | {{MATERIAL_FINDING_OR_NONE}} |
| Governance | {{CONDITION}} | {{MATERIAL_FINDING_OR_NONE}} |

## Decisions Needed

- {{DECISION_OR_NONE}}

## Recently Completed

- {{OUTCOME_OR_NONE}}

## Next Actions

- {{ACTION}}
- {{ACTION}}

## Control Records

Use the records below when operational detail is needed. Keep this dashboard concise and link to the canonical record instead of repeating its contents.

| Record | Purpose | Location |
|---|---|---|
| Source index | Where authoritative project sources are located | source-index.md |
| RAID and action registers | Current risks, assumptions, issues, dependencies, and actions | registers/ |
| Decision and change logs | Decisions and proposed or approved changes | registers/ |
| Lessons learned register | Reusable project knowledge and recommendations | registers/lessons-learned-register.md |
| Process register | Complete operational process state | process-register.md |
| Artifact index | Approved artifact ownership, need, treatment, and location | artifact-index.md |
| Process runs | Evidence, validation, approval, and reconciliation trail | runs/ |
| Control record location | Where project-control records are stored | {{CONTROL_ROOT_PATH}} |

## Baseline and Change Control

Keep only the current baseline pointer and the latest material change here. Detailed impact analysis belongs in the change log or process run.

| Area | Current state | Source or record |
|---|---|---|
| Scope | {{CURRENT_SCOPE_BASELINE_OR_UNKNOWN}} | {{LINK_OR_NONE}} |
| Schedule | {{CURRENT_SCHEDULE_BASELINE_OR_UNKNOWN}} | {{LINK_OR_NONE}} |
| Cost | {{CURRENT_COST_BASELINE_OR_UNKNOWN}} | {{LINK_OR_NONE}} |
| Quality | {{CURRENT_QUALITY_BASELINE_OR_UNKNOWN}} | {{LINK_OR_NONE}} |
| Last approved change | {{CHANGE_OR_NONE}} | {{LINK_OR_NONE}} |

## Project Preferences

These settings are maintained by Alson and shown only when configuration is needed.

| Setting | Value |
|---|---|
| Evidence refresh period | {{EVIDENCE_REFRESH_DAYS_OR_NOT_CONFIGURED}} |
| Status report audience and cadence | {{AUDIENCE_CADENCE_OR_NOT_CONFIGURED}} |
| RAG tolerance thresholds | {{TOLERANCES_OR_NOT_CONFIGURED}} |
| Decision attention window | {{DECISION_ATTENTION_DAYS_OR_NOT_CONFIGURED}} |
| Change escalation window | {{CHANGE_ESCALATION_DAYS_OR_NOT_CONFIGURED}} |
| Escalation thresholds | {{THRESHOLDS_OR_NOT_CONFIGURED}} |

## Dashboard Rules

- This file is Layer 1, the PM-facing view.
- The registers, process register, artifact index, source index, and approved artifacts remain canonical records.
- Values derived from canonical records are views, not second records.
- Use On Track, Attention, At Risk, or Insufficient evidence in the dashboard. Preserve the detailed health condition and evidence in the relevant records.
- Keep internal IDs, stage mechanics, run details, and Artifact Need Gate reasoning out of the default dashboard.
- Omit empty sections when the dashboard is generated.
- Update the dashboard only through the normal control workflow; do not use it to bypass approval rules.
