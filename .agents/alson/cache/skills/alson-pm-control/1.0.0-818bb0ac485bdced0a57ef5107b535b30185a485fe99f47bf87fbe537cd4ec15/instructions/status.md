# Status Instruction

Produce a concise user-facing view from the current project control state.

The default status view is Layer 1. It is not a dump of the operational registers or evidence records.

## Inputs

| Source | What is needed |
|---|---|
| User | Requested view, optional review date, audience, or focus area |
| Control root | project-control.md and all registers; process-register.md and artifact-index.md when initialized |
| Workspace | references/presentation-rules.md, references/prioritization.md, references/definitions.md, references/thresholds.md, and references/authority-rules.md |
| External | None by default; load a source only when a register item needs verification |

## Process

1. Read the project dashboard and the canonical registers needed for the requested view.
2. When the process register exists, check active, completed, attention-required, and decision-waiting processes. Do not present all 40 processes by default.
3. Apply the attention and prioritization rules.
4. Select the requested on-demand view:
   - Project status
   - What needs attention
   - What changed this week
   - What risks should I care about
   - What decisions are waiting for me
   - What should I work on next
   - An executive update for the IT Director
5. Present the default response in this order:
   - Result
   - What needs attention
   - Decision required, if any
   - Important risks or gaps, if any
   - Next action
6. Use simple English and human labels. Do not show register IDs, process IDs, artifact IDs, run IDs, internal paths, or implementation mechanics unless the user asks for detail or they are needed to avoid an unsafe ambiguity.
7. If the user asks Why, provide only the relevant operational detail. If the user asks to show the evidence, provide the relevant source, validation, review, and traceability records.
8. Keep facts, inferences, recommendations, and PM decisions distinct.
9. Do not update registers during a review. Save a summary only when the user asks.

## Outputs

- Concise PM-facing status or attention view
- Decision list when a PM decision is needed
- Important risks, blockers, exceptions, or evidence gaps
- Human-facing process summary when relevant
- Optional saved summary at summaries/YYYY-MM-DD-<slug>.md only when requested
- Detailed operational or evidence view only when requested

## Validation

| Check | Pass condition |
|---|---|
| Answer first | The condition or most important finding is first |
| Compression | Empty sections are omitted and register content is not repeated |
| User language | Internal identifiers and mechanics are translated or hidden by default |
| Coverage | Relevant registers and process states are checked |
| Ordering | Attention rules are applied |
| Progressive disclosure | Why gives relevant detail; evidence requests give supporting records |
| Traceability | Every material item has internal register or source support |
| Evidence | Missing or stale evidence is flagged |
| Authority | No register state is changed during a review |
| On-demand view | No permanent artifact is created unless requested or durably needed |
