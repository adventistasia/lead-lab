# Definitions

Common terms for the control workspace. Keep definitions stable. The project manager can tailor them per project in the control root.

## RAID

| Term | Meaning | Register |
|---|---|---|
| Risk | Something that may happen and could affect the project. Not happened yet. | `risk-register.md` |
| Assumption | Something treated as true without proof. May need validation. | `assumption-log.md` |
| Issue | Something that has already happened and requires attention. | `issues-log.md` |
| Dependency | Delivery relies on another person, team, system, activity, or condition. | `dependencies-log.md` |

## Other Working Items

A lesson learned is maintained in the register below; retrospective notes are source inputs, not a second canonical record.

| Term | Meaning | Register |
|---|---|---|
| Action | A concrete task to move work forward, with an owner and a due date or trigger. | `action-log.md` |
| Decision | A choice made or required, with owner, timing, rationale, and consequence of delay. | `decision-log.md` |
| Change | A proposed or approved modification to scope, schedule, cost, or baseline. | `change-log.md` |
| Lesson learned | A reusable insight from project experience, including its context and recommended application. | `lessons-learned-register.md` |

## Process Terms

| Term | Meaning | Record |
|---|---|---|
| Process run | One execution of a selected PMI process through the five ICM stages. | `<control-root>/runs/` |
| Disposition | Tailoring decision: Required, Conditional, or Not needed. | `process-register.md` |
| Process recipe | Stable domain guidance for one PMI process. | `references/processes/` |
| Canonical artifact | The approved project-control record used as the current source of truth. | `artifact-index.md` |
| Governance pending | Quality passed but required post-review human direction is not recorded; Stage 05 is blocked. | Run manifest and review record |

## Artifact Prescription Terms

| Term | Meaning | Record or reference |
|---|---|---|
| Artifact catalog | Full library of PM, BA, and DEV artifact types available for consideration. | `references/artifact-management/artifact-catalog.md` |
| Artifact candidate | A catalog entry mapped to the selected process or activated by a material change trigger. | Process run evidence package |
| Artifact Need Gate | The Stage 02 decision point that determines need before treatment. | Evidence package |
| Need | Whether information must be retained: `Essential`, `Optional`, `Not needed`, `Needs confirmation`, or `View`. | Evidence package and approved artifact index |
| Treatment | How information is provided: `Use as-is`, `Update`, `Create`, `Create later`, `Combine`, or `Generate on demand`. | Evidence package and approved artifact index |
| Generated view | A non-authoritative report, summary, analysis, or presentation regenerated from durable source records. | `View` need and `Generate on demand` treatment |
| Process-artifact map | Many-to-many routing map between the 40 processes and catalog candidates. | `references/artifact-management/process-artifact-map.md` |
| Artifact ID | PM Control internal ID using `ART-PM-*`, `ART-BA-*`, or `ART-DEV-*`. | `artifact-index.md` |

## Item States

Common states used across registers:

| State | Meaning |
|---|---|
| Proposed | Captured by the agent. Not yet reviewed or accepted by the PM. |
| Open | Active. Needs attention or monitoring. |
| In Progress | Action is underway. |
| At Risk | Likely to fail or slip without intervention. |
| Blocked | A real barrier prevents progress. |
| Validated | Confirmed against evidence (assumptions). |
| Invalidated | Proven false and handled (assumptions). |
| Occurred | Risk event happened; must move to the issue register. |
| Mitigated | Controls reduce the exposure; residual risk accepted. |
| Resolved | Action complete or issue handled. |
| Closed | Verified and archived. No further action. |
| Superseded | Replaced by a newer item. |

## Source Traceability

Every register row may record:

- Source: path or URL of the authoritative document
- Section: document section or reference such as REQ-024
- Verified: date the evidence was last confirmed
- Related: IDs of connected items

Store only enough to find the source again. Never duplicate the source document.

## Health

Use `references/health-rules.md` as the single source for health conditions, trends, confidence, evidence rules, and overall condition precedence.

## Shared Rules

- Use `references/state-transitions.md` for register lifecycle and PM approval gates.
- Use `references/health-rules.md` for domain and overall condition calculations.
- Use `references/thresholds.md` for project-specific time windows and tolerance thresholds.
- Use `references/process-execution-rules.md` for process selection and run states.
- Use `references/artifact-rules.md` for draft and canonical artifact ownership.
