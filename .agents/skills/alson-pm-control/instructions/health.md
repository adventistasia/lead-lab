# Health Instruction

Assess project health across the PMI performance domains and return a concise user-facing condition view.

PMI reference: PMBOK 2.1 to 2.7, transcript pages 115-215, check-outcome tables 2-5 to 2-11 (see references/pmi-source-map.md).

## Inputs

| Source | What is needed |
|---|---|
| User | Project to review, review date, or focus area |
| Control root | source-index.md, project-control.md, and all registers |
| Workspace | references/presentation-rules.md, references/definitions.md, references/health-rules.md, references/pmi-source-map.md, references/source-routing.md |
| External | Only the source sections that evidence a material domain finding |

## Process

1. Confirm the control root and load project-control.md and the registers needed for the review.
2. Read source-index.md and load only the external sections needed for each domain.
3. Assess the seven domains:
   - Governance: oversight, decisions, lifecycle, escalation
   - Scope: scope definition, requirements, acceptance, and quality
   - Schedule: timeline, milestones, and progress
   - Finance: budget, costs, funding, and forecast
   - Stakeholders: identification, engagement, and communication
   - Resources: team and material availability
   - Risk: RAID health, exposures, and responses
4. Assess RAID inside the Risk domain. RAID is evidence, not an eighth domain.
5. Apply the domain and overall condition rules in references/health-rules.md.
6. Return the user-facing view:
   - Overall condition and the most important finding
   - Domain table with Area, Condition, and What matters
   - Decisions required
   - Important risks or evidence gaps
   - Next action
7. Keep trend, confidence, source locations, register IDs, and detailed reasoning in the operational detail. Show them when the user asks Why or asks for more detail.
8. On later reviews, report only meaningful changes when a prior review is available.
9. Prepare escalation outputs only when the PM asks.

## Outputs

- Concise health view returned in chat
- Domain condition table with material findings
- Decisions and next actions
- Evidence gaps and risks when present
- Saved review at summaries/YYYY-MM-DD-health-review.md only when requested
- Operational detail or evidence only when requested

## Validation

| Check | Pass condition |
|---|---|
| All domains assessed | Each domain has a condition and material finding, or an explicit evidence gap |
| User language | Default view uses plain-English area names and conditions |
| Answer first | Overall condition and top finding appear first |
| RAID covered | RAID state is reported inside Risk |
| Evidence traceable | Every condition has internal source or register support |
| No fabrication | Missing evidence produces Insufficient evidence |
| Progressive disclosure | Detail is supplied only when requested or needed for a decision |
| Delta rule | Later reviews report only meaningful changes |
| Governance state | Outstanding PM decisions are listed with timing and consequence |
