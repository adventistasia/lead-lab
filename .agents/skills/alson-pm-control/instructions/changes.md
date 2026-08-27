# Changes Instruction

Capture and assess changes to scope, schedule, cost, or baseline. The agent prepares the assessment; the PM decides.

PMI reference: scope and governance domains, PMBOK transcript pages 115-152 (see `references/pmi-source-map.md`).

## Inputs

| Source | What is needed |
|---|---|
| User | Change request or material describing the change |
| Control root | `source-index.md`, `change-log.md`, `project-control.md`, `artifact-index.md` |
| Workspace | `references/definitions.md`, `references/authority-rules.md`, `references/thresholds.md`, `references/state-transitions.md`, `references/artifact-management/essential-artifact-model.md`, `disposition-rules.md`, `artifact-completeness-model.md` |
| External | Sources that state the current scope, schedule, or cost baseline and the change evidence |

## Process

Apply references/presentation-rules.md to the user-facing output. Lead with the result, then attention items, decision required, important risks or gaps, and next action. Keep internal IDs, paths, and implementation mechanics in the operational or evidence records unless the user asks for detail.

1. Read `change-log.md` and `project-control.md` for the current baseline.
2. Capture the change as `Proposed` with:

   - ID and change description
   - Requested by and date
   - Affected area: scope, schedule, cost, quality, or other
   - Impact assessment: what the change affects and what depends on it
   - Source traceability

3. Assess impact against the current baseline and related registers (dependencies, risks, issues, actions).
4. Check whether the change activates an artifact trigger:

   - Regulatory, contractual, or organizational mandate
   - Sensitive or regulated data
   - Prototype or pilot becoming production
   - Vendor or external supplier introduced
   - Risk becoming high
   - Stakeholder complexity increasing
   - Project becoming large, long, or distributed
   - Audit exposure appearing

5. If a trigger is active, reassess only the affected artifact families against the current `artifact-index.md`. Preserve unaffected decisions and record the delta as Proposed.
6. Do not treat a missing document, PMI artifact name, new register row, or regenerable view as an artifact trigger.
7. Present the assessment with a recommendation only when the evidence supports one. The PM approves or rejects.
8. On approval: record the decision, update `project-control.md` baseline notes, link affected register items, and route approved artifact changes through the process review and reconciliation gate.
9. On rejection: record status `Rejected` with the outcome and rationale. Move it to `Closed` only when the PM directs archival.
10. Flag changes sitting `Proposed` beyond the configured change escalation window.

## Outputs

- Change log rows with `Proposed` state until decided
- Change impact assessment in chat
- Baseline updates in `project-control.md` only after approval
- Artifact-trigger delta assessment with affected artifact IDs and proposed need or treatment changes

## Validation

| Check | Pass condition |
|---|---|
| Baseline known | Current baseline cited or marked unknown |
| Impact covered | Affected registers checked for dependencies |
| No scope edit | External scope sources never modified |
| Traceability | Every row has Source and Verified date |
| Approval gate | Baseline changes applied only after PM approval |
| Artifact scope | Only trigger-affected artifacts are reassessed |
| Artifact treatment | Need is decided before treatment; missing evidence alone does not create an artifact |

Presentation validation: default output uses plain English and progressive disclosure. Show operational detail or evidence only when requested.

## Escalation

Changes that affect scope, committed dates, or cost beyond tolerance are flagged for PM decision and included in governance outputs when requested. The agent never approves a change.
