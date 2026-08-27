# Governance Instruction

Prepare governance updates and escalation summaries. The agent prepares; the PM sends.

PMI reference: governance domain, PMBOK transcript pages 115-140 (see `references/pmi-source-map.md`).

## Inputs

| Source | What is needed |
|---|---|
| User | Request and intended audience (sponsor, steering body, board) |
| Control root | `source-index.md`, `project-control.md`, all registers |
| Workspace | `references/definitions.md`, `references/prioritization.md`, `references/reporting-rules.md`, `references/thresholds.md`, `references/health-rules.md` |
| External | Governance sources: charter, decision records, escalation protocol, meeting records |

## Process

Apply references/presentation-rules.md to the user-facing output. Lead with the result, then attention items, decision required, important risks or gaps, and next action. Keep internal IDs, paths, and implementation mechanics in the operational or evidence records unless the user asks for detail.

1. Load `project-control.md`, all registers, and the governance sources.
2. Identify items that meet escalation thresholds:

   - Decisions overdue or due within the configured decision attention window
   - Blocked or overdue actions
   - High exposure risks
   - High priority issues
   - Critical or at-risk dependencies
   - Tolerance breaches in schedule, cost, or quality
   - Changes awaiting approval beyond the configured change escalation window

3. Structure the governance update:

   - Situation summary and why governance attention is needed
   - Decision requests with owner, timing, and consequence of delay
   - Escalation list with evidence and recommended responses
   - What the agent recommends vs what remains the PM's decision

4. Present the update in chat. Save to `<control-root>/governance-updates/YYYY-MM-DD-<slug>.md` only when the user asks.
5. Never send the update to any recipient. Provide the file or text for the PM to distribute.

## Outputs

- Prepared governance update or escalation summary
- Saved file only on request

## Validation

| Check | Pass condition |
|---|---|
| Thresholds applied | Escalation list follows `references/prioritization.md` |
| Evidence cited | Every escalated item has register ID and source |
| Recommended vs decided | Recommendation and PM decision separated |
| Not sent | Output is prepared only; PM distributes |
| Attribution | Label present under the title when saved |

Presentation validation: default output uses plain English and progressive disclosure. Show operational detail or evidence only when requested.

## Escalation

The escalation itself is the prepared output. The PM decides whether to send it, to whom, and when. The agent never escalates on the PM's behalf.
