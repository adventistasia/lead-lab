# Actions Instruction

Track and review the action log: capture, assign direction, rank, and follow through.

PMI reference: schedule and risk response execution; see `references/pmi-source-map.md` for the applicable sections.

## Inputs

| Source | What is needed |
|---|---|
| User | Request or supplied material with work to capture |
| Control root | `source-index.md`, `action-log.md` |
| Workspace | `references/prioritization.md`, `references/authority-rules.md` |
| External | Source sections that state the work, when applicable |

## Process

Apply references/presentation-rules.md to the user-facing output. Lead with the result, then attention items, decision required, important risks or gaps, and next action. Keep internal IDs, paths, and implementation mechanics in the operational or evidence records unless the user asks for detail.

1. Read `action-log.md`.
2. Capture new actions as `Proposed` with description, source, and due date or trigger when stated.
3. Owners: use the owner stated in the source. If unknown, set `Unassigned` and flag it. Never invent an owner.
4. Rank actions per `references/prioritization.md` (blocked work first, then due date, then impact).
5. For a review request ("review outstanding work", "what is outstanding"): present open and in-progress actions ordered by rank, with overdue items first and their links to risks, issues, and dependencies.
6. For updates: present proposed changes and apply only what the PM directs.
7. When an action completes: present the completion with evidence and record the state the PM directs.

## Outputs

- Action log rows with `Proposed` state and source fields
- Outstanding work summary in chat
- Links from actions to related RAID or decision IDs

## Validation

| Check | Pass condition |
|---|---|
| Owner known | Owner stated or `Unassigned` with a flag |
| Due dates | Taken from the source; never guessed |
| Ranking | Ordered per prioritization rules |
| Traceability | Every row has Source and Verified date |
| Completion | Closed only on PM direction with evidence |

Presentation validation: default output uses plain English and progressive disclosure. Show operational detail or evidence only when requested.

## Escalation

Overdue actions that block High risks, High issues, or Critical dependencies are listed in escalation outputs when the PM prepares one. The agent never chases or assigns owners by itself.
