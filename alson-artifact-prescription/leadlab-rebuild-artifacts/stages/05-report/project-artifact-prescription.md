# Project Artifact Prescription: LeadLab Portal Rebuild

## Recommendation

The project already keeps the right core records. Keep the accepted brief and the five registers as-is, create eleven small artifacts in two waves, and treat six analysis outputs as AI-generated views. Only one new durable record matters before the Sep 11 launch: the participant access handling record (ASR-01), which is a Create-later action inside DEV-07, triggered by the DEC-01 platform decision. Everything else the project needs already exists.

| Treatment | PM | BA | DEV | Total |
|-----------|----|----|-----|-------|
| Use as-is | 5 | 0 | 0 | 5 |
| Create later | 3 | 3 | 5 | 11 |
| Generate on demand | 2 | 4 | 0 | 6 |
| **Total treated** | **10** | **7** | **5** | **22** |

| Need | Count |
|------|-------|
| Essential | 20 (14 maintained + 6 generated views) |
| Not needed | 82 |
| Optional | 0 |
| Needs confirmation | 0 |

## Essential Records Status

| # | Record | Status | Action |
|---|--------|--------|--------|
| 1 | Mandate and outcomes | Maintained | Use as-is (accepted request brief) |
| 2 | Scope and acceptance | Maintained + gap | Use as-is (brief, backlog); acceptance criteria Create later (PM-23/BA-19) |
| 3 | Ownership and governance | Maintained | Use as-is (brief People; decision log) |
| 4 | Delivery control | Maintained + gap | Use as-is (brief deadline, backlog); milestone list Create later (PM-31) |
| 5 | Decisions and changes | Maintained | Use as-is (decision log D-01..D-08) |
| 6 | RAID controls | Maintained | Use as-is (risk, issue, assumption, dependency registers) |
| 7 | Verification and acceptance | Missing | Create later (acceptance criteria + DEV-08 test plan; final OK = acceptance) |
| 8 | Transition and ownership | Missing | Create later (DEV-07 access record, BA-34 readiness, DEC-06 owner) |

## Information Handling

- **Maintained records:** accepted brief; decision log; risk register; assumption log; issue log; dependencies log; backlog. All at `projects/lead-lab/` (brief, `artifacts/logs and registers/`).
- **Generated views:** status/performance reports (from backlog + registers), risk reports (from risk register), option list / feasibility / ranking / recommendation for DEC-01 (from evidence base + spike). AI-generated; reviewed by IT Director before use.
- **Missing (to create):** milestone list, acceptance criteria, architecture description, security and privacy design, deployment and runtime operations plan (incl. access handling record), test strategy, dev guide (conditional), readiness assessment, closure report, transition planning.
- **AI assurance:** AI drafts views and artifacts; content becomes fact only after human confirmation. Validation points: IT Director reviews DEC-01 comparison and privacy basis; LeadLab Director gives final OK; requester approves this prescription. AI-generated content carries source records, generation date, and validation status. [investigation-brief.md Information and AI Context]

**Theme 1 - Existing records are strong:** the brief and five registers carry records 1-6; no new maintenance burden for the core.
**Theme 2 - All creates gate on DEC-01:** the platform decision blocks every Create-later action; nothing is built ahead of the decision.
**Theme 3 - One durable record answers the referral:** only ASR-01 (participant access handling) justifies a new maintained record in this project; the access procedure is Create later within DEV-07, on the DEC-01/DEC-02 path.

---

## Prioritized Action Plan

### Immediate (before or at DEC-01 decision)

No prescription action is actionable in this band. The items that unblock the plan are upstream decision-readiness interventions: ACT-01 platform comparison, ACT-02 build spike, ACT-03 date confirmation, ACT-04 privacy confirmation. [project-next-actions.md]

### Before Execution (after DEC-01 decided; before build start)

| # | Action | Artifact | Disposition | Need | Urgency | Effort | Owner | Trigger | Dependency |
|---|--------|----------|-------------|------|---------|--------|-------|---------|------------|
| 1 | Define build milestones (start, content load, testing, go-live, final OK) | PM-31 Milestone list | Create later | High | Now (post-DEC-01) | Small | Requester | DEC-01 decided | D-01 (Hard) |
| 2 | Record platform, hosting, components, YouTube integration, access approach | DEV-03 Software Architecture Description | Create later | High | Now (post-DEC-01) | Small | Requester | DEC-01 decided | D-01 (Hard) |
| 3 | Define access control + participant email handling basis | DEV-06 Security and Privacy Design | Create later | High | Now (post-DEC-01) | Small | Requester | DEC-01 decided + NEED-03 confirmed | D-01 (Hard), DEV-03 (Soft), NEED-03 (Hard) |
| 4 | Create access handling record: mechanism, who grants, email basis, per-program update (ASR-01) | DEV-07 Deployment and Runtime Operations Plan (access management section) | Create later | Critical | Now (post-DEC-01/DEC-02) | Small | Requester + IT team | DEC-02 mechanism chosen | D-01, D-02 (Hard), DEV-06 (Soft) |
| 5 | Define acceptance criteria per backlog item | PM-23 / BA-19 Acceptance criteria (in backlog) | Create later | High | Before test window | Small | Requester | DEC-01 decided | PM-48 (Hard) |
| 6 | Plan test levels: access restriction, devices, participant test, exit criteria | DEV-08 Test Strategy and Plan | Create later | High | Before BL-11 testing | Small | Requester | DEC-01 decided | PM-23 (Hard), PM-48 (Soft) |
| 7 | If custom code: document repo setup and dev conventions | DEV-10 Repository and Development Guide | Create later | Medium | Conditional | Small | Requester | DEC-01 = custom code | D-01 (Conditional) |

### During Delivery

No creates. Maintain the five registers (Use as-is) as decisions and risks land; test evidence and defects recorded in issues log and DEV-08 execution.

### Before Transition/Closure (post-launch)

| # | Action | Artifact | Disposition | Need | Urgency | Effort | Owner | Trigger | Dependency |
|---|--------|----------|-------------|------|---------|--------|-------|---------|------------|
| 8 | Run pre-launch readiness check: content loaded, tests passed, access operable, owner confirmed | BA-34 Readiness assessment | Create later | High | Before Sep 11 launch | Small | Requester | Build complete | DEV-07 (Soft), DEV-08 (Soft), BL-10 (Hard), DEC-06 (Soft) |
| 9 | Plan content migration and SharePoint decommission | BA-15 Transition planning information | Create later | Medium | After successful go-live | Small | Requester | DEC-04 trigger (post go-live) | DEC-04 (Hard), BA-34 (Soft) |
| 10 | Produce closure report at project close | PM-11 Closure report | Create later | Medium | After transition | Small | Requester | Project close | BA-15 (Soft), go-live evidence (Soft) |

## Key Decisions and Trade-offs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ASR-01 carrier | DEV-07 (access management section) | No catalog item fits better: DEV-07 is the production operations record; overlaps DOC-08 (Support and Operations Guide) per dev-crosswalk — reference, not duplicate. Old SharePoint procedure docx is the update basis. |
| Acceptance criteria placement | PM-23/BA-19 combined into backlog | Single source of truth; backlog items already carry feature scope; separate criteria document would duplicate. |
| Test record | DEV-08 only; PM-55 not created | PM-55 and DEV-08 overlap per dev-crosswalk; one test plan avoids two sources of truth. |
| PM-29 schedule | Not needed; PM-31 milestones only | One-month window; milestone list + backlog cover delivery control; a full schedule adds weight without value. |
| DEC-01 option analysis | BA-06..09 Generate on demand | Option comparison is a view (essential model: option analyses are regenerable views); decision readiness owns the comparison; IT Director validates. |
| DEV-05/DEV-10 | Not needed / conditional | Platform-managed data and builder workflows need no custom schema or dev guide; both return if DEC-01 = custom code. |

## Decision Support Traceability (ASR-01)

| ASR ID | Evidence Need | Decision ID | Supporting Artifact | Disposition | Evidence Acceptance Test |
|--------|---------------|-------------|---------------------|-------------|--------------------------|
| ASR-01 | Durable access handling record incl. email-handling basis (NEED-05) | DEC-02 | DEV-07 access management section | Create later | Record exists, names mechanism on chosen platform, states email-handling basis; admins can operate access grants from it — then decision readiness reassesses DEC-02 |

## Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|----------------|
| Create the access record now (before DEC-01) | Mechanism content cannot be final before platform/access decisions; premature content would be wrong or reworked |
| Update the old SharePoint procedure docx instead of a new-platform record | The old procedure describes Outlook groups; it cannot carry the new-platform mechanism; it serves as the basis, not the carrier |
| DEV-06 as the ASR-01 carrier | Security/privacy design is a design record; the ASR acceptance test requires an operable admin procedure — that belongs in DEV-07 (operations) |
| Tailored artifact TAIL-01 for the access record | DEV-07 with an explicit access-management minimum-content contract fits without inventing a new catalog entry |
| Full decision-linked revision mode | No accepted baseline exists; contract requires full baseline (fallback rule) |

---

## Decision Record

| Field | Detail |
|-------|--------|
| **Prescription author** | Alson (AI-assisted pipeline) |
| **Date** | 2026-08-11 |
| **Project manager** | Requester (IT team; responsible person per accepted brief) |
| **Prescription approver** | Requester (project manager per accepted brief, People section; flag: named role, confirm at governance gate) |
| **Intended users** | Requester + IT team, IT Director, LeadLab Director, project-decision-readiness |
| **Basis** | PMBOK Guide 8th Ed. tailoring; PMI Guide to Business Analysis; workspace essential artifact model, catalog, crosswalks |
| **Run mode** | Full baseline (fallback rule) with ASR-01 response |
| **Open decisions** | 1. DEC-01 platform choice (upstream, blocked) 2. DEC-02 access mechanism (upstream, blocked on DEC-01) 3. NEED-03 privacy basis confirmation (ACT-04) 4. Prescription acceptance by project manager |
| **ASRs addressed** | ASR-01 (Create later — DEV-07) |
| **Return workspace** | project-decision-readiness |
| **Next review trigger** | DEC-01 decided, or project manager requests review, or 1 week without decision progress |
