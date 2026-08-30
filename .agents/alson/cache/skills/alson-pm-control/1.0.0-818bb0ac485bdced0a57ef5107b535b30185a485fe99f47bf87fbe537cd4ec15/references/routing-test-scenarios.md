# Routing Test Scenarios

Use these scenarios to verify routing and behavior. Each scenario states the expected route, load set, and boundary.

## Success Test Scenarios

| ID | User request | Expected route | Boundary |
|---|---|---|---|
| RS-01 | "Review this project." | health instruction, all registers | Condition per domain with citations; Insufficient evidence where gaps |
| RS-02 | "Check the RAID." | raid instruction, four RAID registers | Attention list by priority; no register edits without direction |
| RS-03 | "What needs my attention?" | status instruction, all registers | Attention rules applied; PM decisions listed first |
| RS-04 | "Capture the risks from this document." | raid instruction, risk register | Items captured as Proposed with Source; duplicates detected |
| RS-05 | "Review the requirements for possible dependencies." | raid instruction, dependency register | Only source requirements sections loaded; dependencies Proposed |
| RS-06 | "Prepare my status report." | reporting instruction, all registers | Report from registers only; no new facts invented |
| RS-07 | "What should I escalate?" | governance instruction, relevant registers | Escalation prepared as output; never sent |
| RS-08 | "Update the issue register based on this meeting record." | raid instruction, issue register | Changes applied only after PM direction |
| RS-09 | "Initialize the control root at this path." | setup instruction | Required structure created or repaired; existing records preserved |
| RS-10 | "Process this meeting record for project-control items." | intake instruction | Candidates classified across affected registers as Proposed |
| RS-11 | "status" | status instruction | All registers checked; attention list returned without edits |
| RS-12 | "Refresh the project sources." | refresh instruction | Source access and freshness checked; affected register items identified |
| RS-13 | "Run Identify Risks for this project." | Stage 01 through Stage 04, pause for explicit post-review PM approval, then Stage 05; Risk recipe PM-36 | Draft risks are traceable; no reconciliation occurs before the checkpoint |
| RS-14 | "Run Monitor and Control Schedule." | Stage 01 through Stage 04, pause for explicit post-review PM approval, then Stage 05; Schedule recipe PM-18 | Schedule evidence is scoped and variance response is not approved silently |
| RS-15 | "Plan Scope Management." | Stage 01 through Stage 04, pause for explicit post-review PM approval, then Stage 05; Scope recipe PM-10 | Scope approach draft is reviewed before canonical update |
| RS-16 | "Run a process and skip it if not needed." | Stage 01 through Stage 04, pause for explicit post-review PM approval, then Stage 05; tailoring rules | Disposition and reason are recorded; process is not forced or reconciled without approval |
| RS-17 | "Run Assess and Implement Changes." | Stage 01 through Stage 04, pause for explicit post-review PM approval, then Stage 05; Governance recipe PM-08 | Change impact is prepared; approval and baseline update require PM direction |
| RS-18 | "Run Close Project or Phase." | Stage 01 through Stage 04, pause for explicit post-review PM approval, then Stage 05; Governance recipe PM-09 | Closure evidence is prepared; closure remains pending until authorized |
| RS-19 | "Run Identify Risks" with a current risk register | Stage 01 through Stage 04 with the Artifact Need Gate | Risk register is Essential and Use as-is or Update; no duplicate risk document is created |
| RS-20 | "Run Identify Risks" with risk information spread across sources | Stage 01 through Stage 04 with the Artifact Need Gate | Risk information is Essential and Combine targets the canonical risk register |
| RS-21 | "Run Identify Risks" with no usable risk carrier | Stage 01 through Stage 04 with the Artifact Need Gate | Create is proposed only when durable risk control is essential and regeneration is unsafe |
| RS-22 | "Prepare a governance risk summary." | Reporting route with generated-view rules | The summary is View and Generate on demand from named durable records |
| RS-23 | "Run a process" after a prototype becomes production | Selected process with change-trigger delta assessment | Only affected architecture, security, testing, deployment, operations, transition, and acceptance candidates are reassessed |
| RS-24 | "pm control" | Bare-invocation action menu | No project records are loaded; setup and common actions are shown; the user can reply with a number or plain English |
| RS-25 | User selects action "10" from the PM Control menu | Canonical process selection view | The original 40-process list is shown grouped by focus area; the user selects by process name or list number; no project records or process stages are loaded before selection |
| RS-26 | "What is the project status?" | Status instruction | A concise PM-facing summary is returned with condition, attention items, decisions, risks or gaps, and next action; no internal IDs or run mechanics by default |
| RS-27 | A process has passed validation and needs approval | Stage 04 approval request | The request describes the project decision, recommendation, important limits, and one clear question; Approve, Revise, or Reject maps internally to the required control actions |
| RS-28 | User asks "Why?" after a concise summary | Relevant operational detail view | Relevant operational records and reasoning are shown without dumping the complete audit trail |
| RS-29 | User asks "Show me the evidence." | Relevant evidence view | Supporting source, validation, review, run, and traceability records are shown for the result requested |
| RS-30 | User opens project-control.md | Layer 1 project dashboard | The PM can understand condition, attention, decisions, completed outcomes, and next actions without reading full registers |
| RS-31 | User-facing outputs are simplified | All routes and process engine | Canonical registers, validation, approval, reconciliation, and audit evidence remain available and unchanged in purpose |
| RS-32 | "Capture a lesson learned from this retrospective." | intake instruction, lessons learned register | Lesson is captured as Proposed with date, category, description, impact, recommendation, Related IDs, and source traceability |

## First-Use Experience Scenarios

| ID | User request or situation | Expected behavior |
|---|---|---|
| FU-01 | "Help me set up project control for Lead Lab. My files are in `/projects/lead-lab`." | Propose project `Lead Lab`, source `/projects/lead-lab`, and control root `/projects/lead-lab-control` in one confirmation |
| FU-02 | User supplies project name, source, and exact control-root path | Initialize at the supplied path without asking for the path again when the request authorizes setup |
| FU-03 | User supplies a clear local project folder but no project name | Propose the folder-derived project name and sibling control-root path together; do not silently finalize an ambiguous name |
| FU-04 | User supplies a SharePoint, repository, URL, or cloud source but no writable control-root path | Ask only where project-control records should be stored; do not invent a local or cloud path |
| FU-05 | User has not supplied phase, RAG thresholds, reporting cadence, or escalation thresholds | Setup proceeds; optional values remain `Not configured`, `Unknown`, or blank as appropriate |
| FU-06 | "Review this project" is requested before the project has a control root | Route through setup, preserve the review intent, then continue the review after setup when enough information is available |
| FU-07 | Setup completes | Return project, source count, control-root location, and 3-5 plain-English next actions; do not explain internal PMI stages unless asked |
| FU-08 | User says "Our schedule is slipping. What should I look at?" | Route by outcome to project health with schedule focus; do not require `Run Monitor and Control Schedule` wording |
| FU-09 | User says "Capture the important items from this meeting." | Route to intake and classification; do not require the user to name RAID, action, decision, or change registers |
| FU-10 | User already answered a setup fact earlier in the active project context | Reuse it; do not ask the same question again unless it became ambiguous or conflicting |
| FU-11 | Setup completes for a new project | Create `registers/lessons-learned-register.md` with the other missing register templates; do not create a separate lessons log |

## Boundary Scenarios

| ID | Situation | Expected behavior |
|---|---|---|
| RB-01 | A task requires external evidence and no source location is known | Ask only for the needed source location; do not invent evidence |
| RB-02 | Remote source inaccessible | Flag it; ask for an accessible link or export |
| RB-03 | Conflicting evidence in two sources | Report both citations; ask the PM to reconcile |
| RB-04 | Duplicate item found in a register | Link or update; flag near-duplicates to the PM |
| RB-05 | Owner unknown for a new item | Owner = Unassigned; flag it |
| RB-06 | PM asks to close an issue without evidence | Ask for evidence or explicit direction as required; do not close silently |
| RB-07 | Escalation requested | Prepare the escalation output; do not send it |
| RB-08 | Report needed but evidence missing | State Insufficient evidence; never assume Healthy |
| RB-09 | Switching projects | Read the new project's source-index; never mix registers from the prior project |
| RB-10 | Source document offered for copying | Record its location in source-index; do not copy it in |
| RB-11 | Report repeats register content | Replace with links; registers stay the single source of truth |
| RB-12 | Control root does not exist yet and a safe local suggestion can be derived | Propose one control-root path and request one confirmation before writing |
| RB-13 | PMI section and workspace rule conflict | Workspace rule wins; conflict flagged to the PM |
| RB-14 | PM does not respond to a Proposed item | Item stays Proposed; never moved to a final state |
| RB-15 | Control root already contains records | Preserve existing records; add only missing structure after confirmation |
| RB-16 | Meeting record contains multiple control-item types | Classify each item and route it to the correct register |
| RB-17 | Control-root path is missing and no safe writable suggestion can be derived | Ask only for the project-control storage location; never reuse another project's root |
| RB-18 | Process recipe is not needed for the project | Record Not needed with reason and review trigger; do not execute it |
| RB-19 | Process run has a quality pass but no post-review PM direction | Set Governance pending; do not start Stage 05 or reconcile any changes |
| RB-20 | Draft conflicts with a canonical artifact | Report conflict and stop reconciliation until authority resolves it |
| RB-21 | Optional project preferences are missing during setup | Do not block initialization or ask a preference questionnaire |
| RB-22 | User asks for a valid outcome without formal workspace terminology | Route by intent; do not force command or PMI vocabulary |
| RB-23 | User invokes PM control with a substantive task | Route directly to that task; do not show the generic action menu |
| RB-24 | Stage 04 quality pass exists but no post-review PM response exists | Stop at Stage 04 with `Governance pending`; do not create Stage 05 output or write canonical records, including process metadata |
| RB-25 | A catalog artifact is missing but no process need or trigger applies | Artifact Need Gate | Record Not needed or do not assess; never create it only because it is in the catalog |
| RB-26 | Evidence is missing for an artifact decision | Artifact Need Gate | Use Needs confirmation or record a gap; missing evidence is not evidence that creation is justified |
| RB-27 | Existing PM and BA catalog entries describe the same carrier | Artifact Need Gate | Use the canonical overlap and avoid duplicate sources of truth |
| RB-28 | Legacy artifact index lacks Need and Treatment columns | Stage 04 and Stage 05 | Propose a schema migration, preserve existing values, and apply only after PM approval |
| RB-29 | Setup completes for a new project | Setup route | The catalog is not assessed and no artifact baseline is created |
| RB-30 | Default status is generated from detailed registers and process evidence | Presentation rules | Only the Layer 1 result is shown; internal process IDs, artifact IDs, run IDs, and implementation paths remain hidden by default |
| RB-31 | Stage 04 is ready for PM review | Presentation and authority rules | The PM receives a business-language decision brief; the internal change map remains in the review or proposed-record files |
| RB-32 | User asks why after a summary | Progressive disclosure | Relevant operational detail is shown; unrelated audit records are not dumped |
| RB-33 | User asks to show evidence | Progressive disclosure | Relevant evidence and traceability are shown for the requested finding |
| RB-34 | Artifact Need Gate returns an internal treatment code | Artifact presentation | The PM sees the human artifact name, treatment, reason, and decision needed; IDs and codes remain internal unless requested |

## Pass Conditions

1. One primary route per request.
2. Only the needed instruction, references, registers, and sources are loaded.
3. No external source is copied into the workspace.
4. Every register row carries source traceability.
5. PM-only actions stay Proposed until direction.
6. Reports derive from registers and sources; no second source of truth.
7. Missing evidence produces Insufficient evidence, never Healthy.
8. No item is closed, approved, assigned, scoped, or escalated without PM direction.
9. Every process run pauses after Stage 04 and requires explicit post-review PM approval before Stage 05, including metadata-only reconciliation.
10. No canonical process or artifact change is written before Stage 05.
11. First-use setup uses one confirmation whenever the available information permits it.
12. Optional setup preferences never block initialization.
13. Valid plain-English requests route by intended outcome without requiring formal PMI or workspace terminology.
14. If setup interrupts a valid original task, that task is preserved and resumed without asking the user to repeat it.
15. A bare PM control invocation shows the action menu without loading project records; a substantive task bypasses the menu.
16. Every formal process run filters the catalog through the process-artifact map and applies the Artifact Need Gate after evidence assembly.
17. Process-level artifact prescription does not run the standalone seven-stage full-baseline workflow.
18. Artifact index changes remain blocked until the mandatory post-review PM approval checkpoint.
19. Default PM responses follow Result, What needs attention, Decision required, Important risks or gaps, and Next action.
20. User-facing views are generated from canonical records and do not create permanent artifacts without a durable need.
21. The complete process register is not shown by default; the human-facing process view is used instead.
22. Approval requests describe the project decision and do not require internal identifiers.
23. Detail and evidence are revealed progressively only when requested or necessary for a safe decision.
