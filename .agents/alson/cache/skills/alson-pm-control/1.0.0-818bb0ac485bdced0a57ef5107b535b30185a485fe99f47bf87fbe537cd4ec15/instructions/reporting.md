# Reporting Instruction

Produce status reports and summaries from registers and external sources. The report is a communication output; registers stay the source of truth.

Use references/presentation-rules.md for the information layers, output contract, progressive disclosure, and audience translation.

PMI reference: reporting principles in references/pmi-source-map.md, section 2.1.6.7 and communications guidance.

## Inputs

| Source | What is needed |
|---|---|
| User | Audience, reporting period, requested view, and format |
| Control root | All registers, project-control.md, source-index.md, and process state when relevant |
| Workspace | references/presentation-rules.md, references/reporting-rules.md, references/definitions.md, references/health-rules.md, references/prioritization.md, references/thresholds.md |
| External | Source sections that evidence progress, milestones, and forecasts |

## Process

1. Load canonical registers and the dashboard. Load only the external sections needed for the reporting period and audience.
2. Compute the current condition per domain from register and source evidence using references/health-rules.md.
3. Lead with the result and most important finding in the first three lines.
4. Use the audience-appropriate PM view:
   - Sponsor or IT Director: condition, decisions, exceptions, recommendation, and next action.
   - Team: progress, blockers, actions, and next action.
   - PM working view: decisions, risks, changes, deadlines, gaps, and next actions.
5. Include only relevant sections:
   - Overall condition
   - What changed since the last report
   - Milestones and forecasts
   - Exceptions and important risks
   - Decisions and actions required
   - Evidence gaps
6. Use delta-only reporting on revisions. Reference unchanged information instead of repeating it.
7. Use controlled links or descriptive source notes for traceability. Do not make the reader decode internal IDs, process IDs, artifact IDs, or run mechanics.
8. Keep recommendations separate from PM or sponsor decisions.
9. Save a report only when requested. Never overwrite a prior report.

## Outputs

- In-chat concise summary when the user wants a quick view
- Saved status report at status-reports/YYYY-MM-DD-<slug>.md when requested
- Saved governance update or escalation only when requested
- Detailed evidence view only when requested

## Validation

| Check | Pass condition |
|---|---|
| Answer first | Condition and top finding are in the first three lines |
| User language | The report is understandable without internal terminology |
| Evidence cited | Every material claim traces to a register item or source section |
| No second truth | The report never contradicts canonical records |
| Delta on revision | Later reports list only changes |
| Empty sections | Empty sections are omitted |
| Missing evidence | Stated as Insufficient evidence, never assumed Healthy |
| Audience fit | The structure matches the requested audience |
| Decision clarity | Recommendations and PM decisions are separate |
| Compression | Links are used instead of copying register contents |
| Attribution | The Alson attribution label is present under the title when saved |
