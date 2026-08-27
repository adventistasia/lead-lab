# Decisions Instruction

Record and track decisions: capture the question, owner, timing, rationale, and consequence of delay.

PMI reference: governance domain decision making, PMBOK transcript pages 115-140 (see `references/pmi-source-map.md`).

## Inputs

| Source | What is needed |
|---|---|
| User | Decision statement, question, or material containing a decision |
| Control root | `source-index.md`, `decision-log.md` |
| Workspace | `references/definitions.md`, `references/authority-rules.md`, `references/thresholds.md`, `references/state-transitions.md` |
| External | Source sections that state the decision, its options, or its timing |

## Process

Apply references/presentation-rules.md to the user-facing output. Lead with the result, then attention items, decision required, important risks or gaps, and next action. Keep internal IDs, paths, and implementation mechanics in the operational or evidence records unless the user asks for detail.

1. Read `decision-log.md`.
2. Capture a decision as `Proposed` with:

   - ID and decision question
   - Owner (decision maker when known, else `Unassigned`)
   - Needed by date when known
   - Options and consequences when stated
   - Source traceability

3. For "understand a previous decision": present the decision, rationale, outcome, and source.
4. For a new decision: present options and trade-offs from the source; never recommend a decision the PM must own unless the PM asks for a recommendation and the evidence supports one.
5. When the PM confirms the outcome: record the decision with rationale, date, and outcome. Record superseded decisions as `Superseded` with a link to the new one.
6. Flag decisions whose needed-by date is passed or within the configured decision attention window.

## Outputs

- Decision log rows with `Proposed` state until confirmed
- Decision summaries in chat with options and consequences
- Supersession links between related decisions

## Validation

| Check | Pass condition |
|---|---|
| Owner | Decision maker stated or `Unassigned` with a flag |
| Timing | Needed by date from the source or marked unknown |
| Rationale | Recorded only when stated or when the PM directs it |
| Traceability | Every row has Source and Verified date |
| Confirmation | Outcomes recorded only after PM confirmation |

Presentation validation: default output uses plain English and progressive disclosure. Show operational detail or evidence only when requested.

## Escalation

Pending decisions with passed or near deadlines are the first group in escalation outputs. The agent prepares the decision brief but the PM approves and issues the decision.
