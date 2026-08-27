# RAID Instruction

Manage risks, assumptions, issues, and dependencies: capture, review, prioritize, and update. RAID is the primary operational health control area.

PMI reference: Risk domain, PMBOK transcript pages 199-215 (see `references/pmi-source-map.md`).

## Inputs

| Source | What is needed |
|---|---|
| User | Request, supplied document, meeting record, or source location |
| Control root | `source-index.md` for external locations |
| Workspace | `references/definitions.md`, `references/prioritization.md`, `references/authority-rules.md`, `references/source-routing.md` |
| Registers | The affected register: `risk-register.md`, `assumption-log.md`, `issues-log.md`, or `dependencies-log.md` |
| External | Only the source sections that contain the items to capture or verify |

## Process

Apply references/presentation-rules.md to the user-facing output. Lead with the result, then attention items, decision required, important risks or gaps, and next action. Keep internal IDs, paths, and implementation mechanics in the operational or evidence records unless the user asks for detail.

1. Resolve the control root and read the affected register.
2. Read the relevant external source sections when the task supplies or indexes a source.
3. For capture: check for duplicates, then draft each new item as `Proposed` with ID, description, owner when known, and source traceability.
   - Risk: probability, impact, exposure, trigger, response
   - Assumption: type (assumption or constraint), impact if false
   - Issue: priority, due date, resolution plan
   - Dependency: needed by date, impact if unmet
4. For a review: load all four registers, run the attention rules in `references/prioritization.md`, and present the attention list.
5. For an update: present proposed changes and apply only those the PM directs.
6. When a risk has occurred: propose moving it to the issue register with a cross-reference.

## Outputs

- Updated register rows with `Proposed` state and source fields
- Attention list presented in chat for review requests
- Recommended responses, labeled as recommendations

## Validation

| Check | Pass condition |
|---|---|
| Duplicates | No duplicate IDs; near-duplicates flagged |
| Traceability | Every new row has Source and Verified date |
| No invention | Every item traces to a source or user statement |
| Priority correct | Exposure and priority computed per `references/prioritization.md` |
| Occurred risks | Moved to issues only as a proposal |

Presentation validation: default output uses plain English and progressive disclosure. Show operational detail or evidence only when requested.

## Escalation

Prepare escalation as an output when the PM asks. Never send it. Flag to the PM when an item cannot be classified without more evidence.
