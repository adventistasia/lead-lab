# Source Refresh Instruction

Verify authoritative source locations and identify registers that may need reconciliation.

## Inputs

| Source | What is needed |
|---|---|
| User | Optional source location, review date, or request to check stale evidence |
| Control root | `source-index.md`, `project-control.md`, and affected registers |
| Workspace | `references/source-routing.md`, `references/thresholds.md`, and `references/authority-rules.md` |
| External | Indexed or user-provided source locations |

## Process

Apply references/presentation-rules.md to the user-facing output. Lead with the result, then attention items, decision required, important risks or gaps, and next action. Keep internal IDs, paths, and implementation mechanics in the operational or evidence records unless the user asks for detail.

1. Resolve the control root explicitly. If it is not supplied by the user or active project context, ask for it. Never guess from another project.
2. Read `source-index.md` and identify locations that are missing, inaccessible, conflicting, or beyond the configured evidence refresh period.
3. Check only the relevant source metadata and sections. Do not copy source documents into the control root.
4. Update `Last verified` and source notes only when the location and relevant evidence are accessible.
5. Identify register items that depend on changed, stale, or conflicting evidence.
6. Prepare proposed register updates or verification actions. Do not silently close, reopen, approve, assign, or escalate items.
7. Report source gaps, stale evidence, conflicts, affected register IDs, and the next verification action.

## Outputs

- Updated source-index verification fields
- Stale or inaccessible source list
- Affected register IDs and proposed reconciliation actions
- Evidence-refresh attention summary

## Validation

| Check | Pass condition |
|---|---|
| Root identity | Control-root path is explicit and belongs to the selected project |
| Access | Each checked source is accessible or clearly flagged |
| Scope | Only relevant source metadata and sections are loaded |
| Traceability | Updates include source, section, and verification date |
| Authority | Register state changes remain Proposed until PM direction |

Presentation validation: default output uses plain English and progressive disclosure. Show operational detail or evidence only when requested.
