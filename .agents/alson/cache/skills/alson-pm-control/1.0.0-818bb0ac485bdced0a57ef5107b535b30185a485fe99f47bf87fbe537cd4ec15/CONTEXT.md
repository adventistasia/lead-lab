# Project Management Control Workspace

Routing engine for day-to-day project control and tailored execution of the 40 PMBOK 8 processes. Each process run also applies the integrated artifact catalog and Artifact Need Gate to decide which artifacts are relevant and how they should be treated. External project documents stay in their own locations and are inputs only. Registers, approved control-root artifacts, and outputs live in a project control root.

Apply the identity and output rules in `SKILL.md`. Load `references/presentation-rules.md` for the user-facing information layers, response contract, progressive disclosure, approval language, and output compression rules.

## Invocation Precedence

When PM Control is invoked, this workspace is the governing route. Use all routing, instructions, references, registers, authority rules, and output options inside this workspace. Do not switch to another skill or workspace unless the user explicitly requests it. Requests that also match a specialist skill, including status-report production, remain within PM Control unless separately invoked outside PM Control.

## First-Use Experience

Normal users should be able to begin with a plain-English request such as:

```text
Help me set up project control for Lead Lab.
My project files are in /projects/lead-lab.
```

Do not require the user to understand workspace stages, process IDs, register names, or control-root structure before doing useful work.

When a project has no control root yet:

1. Load `setup/CONTEXT.md`.
2. Use the supplied project name and source location when available.
3. If a safe local control-root suggestion can be derived, propose it.
4. Ask for one setup confirmation rather than a sequence of setup questions.
5. Ask only for information that is required for safe initialization.
6. Do not block setup on optional PM preferences.
7. After setup, return a short completion summary and plain-English next actions.

If the user already supplied and authorized an exact control-root path, do not ask for it again.

## Control Root

On first use of a project, initialize the control root through `setup/CONTEXT.md`. The exact writable path must be explicit before the first write, but the agent should help the user arrive at that path rather than requiring the user to know the workspace convention in advance.

On later use:

- Read `<control-root>/source-index.md` and `project-control.md`.
- Read `process-register.md` and `artifact-index.md` when the process system has been initialized.
- For a legacy root without those files, flag the gap and offer repair before a formal process run.
- Do not ask for the root again unless the active project or root is genuinely ambiguous.

Project control root shape:

```text
<control-root>/
├── project-control.md
├── source-index.md
├── process-register.md
├── artifact-index.md
├── artifacts/
├── registers/
├── runs/
├── status-reports/
├── governance-updates/
└── summaries/
```

External project documents are never copied into the control root by default.

## Task Routing

| User intent | Load instruction | Records | External source |
|---|---|---|---|
| Run a PMI process | `stages/01-select-and-tailor/CONTEXT.md`, then the next stage contracts in order; apply the Artifact Need Gate after Stage 02; pause after Stage 04 for PM approval | Process register, mapped artifact candidates, and affected records | Process-specific sources from `source-index.md` |
| Review project health | `instructions/health.md` | All registers | Project sources named in `source-index.md` |
| Capture, review, or update RAID | `instructions/raid.md` | Affected RAID register(s) | Relevant source or supplied record |
| Capture lessons learned | `instructions/intake.md` | `lessons-learned-register.md` and relevant related records | Supplied record or source |
| Review outstanding work | `instructions/actions.md` | `action-log.md` | None required |
| Initialize or repair a project control root | `setup/CONTEXT.md` | None required | User-provided project identity/source information |
| Process a meeting record or source document | `instructions/intake.md` | Affected registers | Supplied record or source |
| Refresh or verify project sources | `instructions/refresh.md` | `source-index.md` and affected registers | Indexed or user-provided source |
| Understand or record a decision | `instructions/decisions.md` | `decision-log.md` | Relevant source document |
| Capture or assess a change | `instructions/changes.md` | `change-log.md` | Relevant source document |
| Check project scope | `instructions/health.md` | None required | External scope documents |
| Prepare a status report | `instructions/reporting.md` | All registers | Project sources as needed |
| Prepare an escalation or governance update | `instructions/governance.md` | Relevant registers | Governance sources |
| `status` | `instructions/status.md` | Process register and all registers | None required |

Every formal PMI process run performs a process-level artifact prescription. It does not run a full-project baseline and it does not assess unrelated catalog entries.

## Bare Invocation

When the user invokes PM control without a substantive project-management task, show a short action menu instead of asking an open-ended question or reading project records:

**PM Control actions**

1. Set up project control: `Help me set up project control for [project].`
2. See status and attention items: `What needs my attention?`
3. Review project health: `Review this project.`
4. Check the RAID: `Check the RAID.`
5. Review outstanding work: `What is outstanding?`
6. Capture meeting or document items: `Capture control items from this document.`
7. Record a decision or assess a change: `Record this decision.` or `Assess this change request.`
8. Verify project sources: `Verify project sources.`
9. Prepare a status, governance, or escalation update: `Prepare my status report.`, `Prepare a governance update.`, or `What should I escalate?`
10. Run a PMI process: `Run a PMI process.` or `Run Identify Risks.`

Tell the user they can reply with a menu number or use any plain-English example. Do not show this menu when the invocation already contains a substantive task; route that task directly. Do not initialize a control root or inspect project records from the bare invocation alone.

## PMI Process Selection

When the user selects action 10 without naming a process:

1. Show the original 40-process list from `references/process-map.md`, grouped by focus area in this order: Initiating, Planning, Executing, Monitoring and Controlling, and Closing.
2. Use human-readable process names and performance-domain labels. Keep internal process IDs hidden unless the user asks for them.
3. Ask the user to select one process by name or list number. Do not require a process ID.
4. Do not read project records, initialize a control root, or start the five-stage process run until one process is selected.
5. Do not replace this selection list with the active, completed, attention-required, or decision-waiting process view.

When the user names a process in the initial request, skip the list and route directly to Stage 01. Keep process selection mechanics out of the normal response unless they affect the user's decision.

## Plain-English Routing

Prefer the user's intended outcome over exact command wording.

Examples:

| User says | Route as |
|---|---|
| `What needs my attention?` | Status / attention summary |
| `Our schedule is slipping. What should I look at?` | Project health with schedule focus |
| `What risks are we missing?` | Risk identification/review |
| `Capture the important items from this meeting.` | Intake and classification |
| `Capture a lesson learned from this retrospective.` | Intake and classification |
| `We received a change request. What is the impact?` | Change assessment |
| `What should I tell governance?` | Governance update preparation |

Do not force the user to restate a valid request using a formal trigger phrase or PMI process name.

## What to Load

Load the task route and `references/presentation-rules.md`, then only the other references, records, and external files that route requires. For a process run, load one stage contract, the selected process recipe, the mapped artifact candidates, and the relevant evidence. Do not load the full workspace, all process recipes, or unrelated sources.

PMI guidance loads through `references/pmi-source-map.md` and `references/process-map.md`, never by reading full PMI documents unless required.

## Authority

Advice, drafts, and proposed captures need no approval. Every process run must stop after Stage 04 and receive explicit post-review PM approval before Stage 05, including when the only proposed change is process metadata. Canonical changes are made only in Stage 05. Register changes that close, approve, assign, change scope, change a baseline, accept deliverables, or escalate need explicit PM direction. See `references/authority-rules.md`.

## Conversation Rules

- Ask only questions that block safe or correct action.
- Combine related required questions into one concise prompt whenever possible.
- Do not ask for optional configuration during first use unless it directly affects the requested task.
- When a sensible default can be safely represented as `Not configured`, `Unknown`, blank, or `Proposed`, use that state instead of stopping the workflow.
- Never invent project facts, owners, dates, approvals, baselines, source locations, or external paths.
- After the review checkpoint, show the result, the business decision needed, and the approved scope question, then stop. Do not proceed to reconciliation in the same turn. After an approved reconciliation, show the result, any remaining PM decision, and the most useful next action. Do not explain internal mechanics unless requested.
- For default responses, show the result, attention items, decision required, important risks or gaps, and next action. Omit empty sections. Translate internal records into plain English.
- Use Summary -> Detail -> Evidence. Show operational detail only when the user asks why or asks for more detail. Show audit and run evidence only when the user asks to see the evidence.
- Approval requests must describe the project decision, recommendation, important limits, and one clear question. Do not ask the PM to approve internal stages, process IDs, artifact IDs, or record paths.


## Presentation Routing

Use canonical records to generate the requested view. Do not create another permanent artifact unless the user asks for a durable report or the need is durable.

| Request | Default presentation |
|---|---|
| What is the project status? | Overall condition, material attention items, decisions, risks or gaps, and next action |
| What needs my attention? | Prioritized decisions, blockers, high risks, issues, dependencies, overdue actions, and stale evidence |
| What changed this week? | Delta-only changes, completed outcomes, new risks or issues, and next actions |
| What risks should I care about? | Material exposure, consequence, response, trigger, and decision needed |
| What decisions are waiting for me? | Decision question, timing, consequence of delay, and recommendation when requested |
| Prepare an update for the IT Director | Condition, decisions, exceptions, recommendation, and next action |
| What should I work on next? | Highest-value unblocked action and the reason it matters |

The complete process register, artifact index, run records, and validation records remain available as operational or evidence views. They are not the default answer.

## Triggers

| Keyword or intent | Action |
|---|---|
| `run <process>` or `run PMI process` | Execute the selected process through Stage 04 with the mapped Artifact Need Gate, pause for explicit PM approval, then reconcile through Stage 05 |
| `review this project`, `project health` | Health review |
| `check the RAID`, `what needs my attention` | RAID or attention review as appropriate |
| `add a risk`, `capture the risks from <document>` | RAID capture |
| `add a lesson learned`, `capture a lesson learned`, `record a lesson learned`, `capture lessons from <document>` | Intake and classification with the lessons learned register |
| `update the issue register`, `update the risk register` | RAID reconciliation from supplied input |
| `review outstanding work`, `what is outstanding` | Action log review |
| `initialize control root`, `set up project control`, `help me set up this project` | Setup workflow |
| `process meeting record`, `capture control items from this document` | Intake and classification workflow |
| `refresh sources`, `verify project sources`, `check stale evidence` | Source refresh workflow |
| `prepare my status report`, `status report` | Status report |
| `what should I escalate` | Escalation preparation |
| `status` | Attention summary from process and registers |
| `What changed this week?` | Status view with delta-only changes and completed outcomes |
| `What risks should I care about?` | Status view focused on material risk exposure |
| `What decisions are waiting for me?` | Status view focused on pending decisions |
| `What should I work on next?` | Status view focused on the highest-value next action |
| `Prepare an update for the IT Director.` | Reporting view tailored for an executive audience |

If no project control root exists, route through setup before a task that needs project records. Preserve the user's original intent and continue it after setup when enough information is available; do not make the user repeat the request.
