# Intake Instruction

Classify information from a meeting record or project source and route it to the correct control registers.

## Inputs

| Source | What is needed |
|---|---|
| User | Meeting record, document, folder, or source location and the requested review |
| Control root | `source-index.md`, `project-control.md`, and the affected registers, including `lessons-learned-register.md` when lessons are captured |
| Workspace | `references/definitions.md`, `references/authority-rules.md`, `references/source-routing.md`, and `references/prioritization.md` |
| External | Only the relevant sections of the supplied record or indexed source |

## Process

Apply references/presentation-rules.md to the user-facing output. Lead with the result, then attention items, decision required, important risks or gaps, and next action. Keep internal IDs, paths, and implementation mechanics in the operational or evidence records unless the user asks for detail.

1. Confirm the source location and identify the relevant date, author, and sections.
2. Load only the sections needed for the requested control review.
3. Classify each candidate item as one or more of:

   - Risk: may happen and could affect the project.
   - Assumption: treated as true without proof.
   - Issue: has happened and needs attention.
   - Dependency: delivery relies on another person, team, system, activity, or condition.
   - Action: concrete work needed to move the project forward.
   - Decision: choice made or required.
   - Change: proposed or approved modification to scope, schedule, cost, or baseline.
   - Lesson learned: reusable insight from project experience, with its context and recommended application.

4. Read the relevant registers and check for duplicate or near-duplicate items.
5. Draft each new item as `Proposed` with the required fields, source traceability, and `Related IDs`.
   - Lesson learned: date, category, description, impact, and recommendation.
6. Apply the relevant priority, exposure, due-date, and attention rules. Lessons learned use their status and related actions or decisions instead of RAID priority.
7. Present proposed captures grouped by register. State conflicts, missing owners, missing dates, and missing evidence.
8. Apply only the changes the PM directs. A user request to capture information creates proposed entries; it does not silently approve, assign, close, or escalate them.
9. Preserve the source path or URL, section or item ID, and verification date for every captured row.

## Outputs

- Proposed rows grouped by affected register
- Duplicate and conflict findings
- Cross-register relationships
- Attention items and PM decisions required
- Updated registers only after the applicable PM direction

## Validation

| Check | Pass condition |
|---|---|
| Classification | Each candidate has an explicit register destination |
| Duplicates | Existing and near-duplicate items are checked |
| Traceability | Every proposed row has source, section or item, and verified date |
| Relationships | Related register IDs are recorded when known |
| No invention | Missing owners, dates, or evidence are flagged |
| Authority | Final states and PM-only actions require explicit direction |

Presentation validation: default output uses plain English and progressive disclosure. Show operational detail or evidence only when requested.
