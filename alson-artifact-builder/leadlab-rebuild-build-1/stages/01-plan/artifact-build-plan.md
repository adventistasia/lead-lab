# Artifact Build Plan

**Prescription run:** `projects/lead-lab/alson-artifact-prescription/leadlab-rebuild-artifacts/`
**Date:** 2026-08-11
**Source request:** Build provisional artifacts for the accepted LeadLab portal rebuild prescription

## Prescription Validation

| Check | Result |
|-------|--------|
| Terminal state | Accepted (recorded 2026-08-11) |
| Total actionable | 10 |
| Create | 0 |
| Update | 0 |
| Create later / deferred | 10 |
| Hard dependency chains | 1 intra-package (PM-23/BA-19 → DEV-08); others gated on external decisions (D-01, D-02, NEED-03, DEC-04) |
| Parallel-ready streams | 3 (planning records; test records; closure/transition records) |

## Build Sequence

| Order | Artifact ID | Artifact Name | Disposition | Profile | Pattern | Predecessors | Dependency Strength |
|-------|-------------|---------------|-------------|---------|---------|--------------|---------------------|
| 1 | PM-23/BA-19 | Acceptance criteria | Create later (deferred shell) | acceptance-criteria | list-register | PM-48 backlog (available) | Hard |
| 2 | PM-31 | Milestone list | Create later (deferred shell) | milestone-list | list-register | D-01 decision log | Hard (external) |
| 3 | DEV-03 | Software Architecture Description | Create later (deferred shell) | architecture | dev-specification | D-01 decision log | Hard (external) |
| 4 | DEV-06 | Security and Privacy Design | Create later (deferred shell) | security-design | dev-specification | D-01 (Hard); DEV-03 (Soft); NEED-03 (Hard) | Hard (external) |
| 5 | DEV-07 | Deployment and Runtime Operations Plan | Create later (deferred shell) | deployment-plan | dev-specification | D-01, D-02 (Hard); DEV-03, DEV-06 (Soft); old access procedure (reference) | Hard (external) |
| 6 | DEV-08 | Test Strategy and Plan | Create later (deferred shell) | test-strategy | plan | PM-23/BA-19 (Hard); PM-48 (Soft); DEV-03 (Soft) | Hard (PM-23) |
| 7 | DEV-10 | Repository and Development Guide | Create later (conditional shell) | repo-guide | statement-definition | D-01 = custom code (Conditional) | Conditional |
| 8 | BA-34 | Readiness assessment | Create later (deferred shell) | readiness-assessment | report | DEV-07 (Soft); DEV-08 (Soft); BL-10 (Hard); DEC-06 (Soft) | Hard (BL-10) |
| 9 | BA-15 | Transition planning information | Create later (deferred shell) | transition-plan | plan | DEC-04 (Hard, external); BA-34 (Soft) | Hard (external) |
| 10 | PM-11 | Closure report | Create later (deferred shell) | closure-report | report | BA-15 (Soft); go-live evidence (Soft) | Soft |

Sequence validated: no circular hard dependencies; intra-package hard chain (PM-23 → DEV-08) ordered correctly; all other hard dependencies root at external decisions that gate activation, not build order.

## Artifact Quality Profiles

### PM-23/BA-19: Acceptance criteria (combined)

| Attribute | Value |
|-----------|-------|
| Domain | PM / BA (combined) |
| Disposition | Create later (deferred shell) |
| Profile | acceptance-criteria from artifact-profiles.md |
| Pattern | list-register from generic-patterns.md |
| Predecessors | PM-48 backlog |
| Dependency strength | Hard |
| PMI reference | PMBOK Section 4 -- Planning | BA Guide Elicitation and Analysis |

**Purpose:** Define pass/fail conditions each portal deliverable must meet before acceptance.

**Required minimum contents:** Acceptance criteria per backlog item (BL-01..BL-18), verification method, acceptance level, status.

**Required fields (from profile):** Deliverable/requirement ID, criterion, verification method, acceptance level, status.

**Available inputs:** Backlog BL-01..BL-18 (feature scope, priority, effort).

**Missing inputs:** Criterion text per item; verification methods; DEC-01 build approach affects verification.

**Artifact-specific acceptance criteria:**
- AC-01: Criteria linked to deliverables
- AC-02: Verification method defined
- AC-03: Acceptance level specified
- AC-04: Status tracked

**Content readiness conditions:** Criterion text per BL item populated; verification methods named.

---

### PM-31: Milestone list

| Attribute | Value |
|-----------|-------|
| Domain | PM |
| Disposition | Create later (deferred shell) |
| Profile | milestone-list from artifact-profiles.md |
| Pattern | list-register from generic-patterns.md |
| Predecessors | D-01 decision log |
| Dependency strength | Hard (external) |
| PMI reference | PMBOK Section 4 -- Initiating |

**Purpose:** Track key events and decision points to the Sep 11, 2026 launch.

**Required minimum contents:** Build start, content load (BL-10), participant testing (BL-11), LeadLab Director final OK (BL-12), launch before Sep 11 (BL-13), maintenance handover (BL-14).

**Required fields (from profile):** Milestone ID, name, target date, actual date, status, category, owner, dependencies.

**Available inputs:** Backlog milestones (BL-10..BL-14); deadline Sep 11, 2026; decision log D-01 timing (before build start, mid-Aug).

**Missing inputs:** Dates after DEC-01; actual dates; DEC-07 date flexibility.

**Artifact-specific acceptance criteria:**
- AC-01: Every milestone has target date
- AC-02: Status tracked
- AC-03: Owner assigned
- AC-04: Dependencies noted

**Content readiness conditions:** Milestone dates populated from DEC-01 build plan.

---

### DEV-03: Software Architecture Description

| Attribute | Value |
|-----------|-------|
| Domain | DEV |
| Disposition | Create later (deferred shell) |
| Profile | architecture from artifact-profiles.md |
| Pattern | dev-specification from generic-patterns.md |
| Predecessors | D-01 decision log |
| Dependency strength | Hard (external) |
| PMI reference | Workspace-defined (Architecture domain) |

**Purpose:** Define components, technology stack, system boundaries, and integrations for the rebuilt portal.

**Required minimum contents:** Platform; hosting/domain (DEC-05); components (session videos by category/date, search, downloads, multi-device); YouTube embedding integration; access mechanism (from DEC-02); build/deploy approach.

**Required fields (from profile):** Components, technology stack, system boundaries, integrations, key decisions, architecture principles.

**Available inputs:** Feature scope (brief); backlog BL-04..BL-09; YouTube dependency (evidence base O-13); current M365 SSO (O-10).

**Missing inputs:** Platform choice (DEC-01); hosting/domain (DEC-05); access mechanism (DEC-02).

**Artifact-specific acceptance criteria:**
- AC-01: Components identified
- AC-02: Stack specified
- AC-03: Boundaries defined
- AC-04: Decisions recorded

**Content readiness conditions:** Technology names and platform facts populated after DEC-01.

---

### DEV-06: Security and Privacy Design

| Attribute | Value |
|-----------|-------|
| Domain | DEV |
| Disposition | Create later (deferred shell) |
| Profile | security-design from artifact-profiles.md |
| Pattern | dev-specification from generic-patterns.md |
| Predecessors | D-01 (Hard); DEV-03 (Soft); NEED-03 (Hard) |
| Dependency strength | Hard (external) |
| PMI reference | Workspace-defined (Security domain) |

**Purpose:** Define threats, controls, access model, and data protection for participant email handling.

**Required minimum contents:** Access control design (no public access, R-03); participant email handling + privacy basis (NEED-03/ACT-04); retention basis; logging; compliance notes.

**Required fields (from profile):** Threats, controls, access model, data protection, logging, compliance requirements.

**Available inputs:** Risk register R-03 (public access), R-04 (email handling); charter privacy context; current SSO model.

**Missing inputs:** Email privacy basis (NEED-03); platform security capabilities (DEC-01).

**Artifact-specific acceptance criteria:**
- AC-01: Threats identified
- AC-02: Controls mapped
- AC-03: Access defined
- AC-04: Compliance referenced

**Content readiness conditions:** Privacy basis documented; access model matched to chosen platform.

---

### DEV-07: Deployment and Runtime Operations Plan (ASR-01 carrier)

| Attribute | Value |
|-----------|-------|
| Domain | DEV |
| Disposition | Create later (deferred shell) |
| Profile | deployment-plan from artifact-profiles.md |
| Pattern | dev-specification from generic-patterns.md |
| Predecessors | D-01, D-02 (Hard); DEV-03, DEV-06 (Soft); old access procedure (reference) |
| Dependency strength | Hard (external) |
| PMI reference | Workspace-defined (Operations domain) |

**Purpose:** Define environments, deployment, monitoring, backup, and runtime operations — including the participant access management procedure (ASR-01/NEED-05).

**Required minimum contents:** Environment/hosting setup; deployment + rollback; monitoring; backup; participant access management procedure: mechanism per chosen platform (DEC-02), who grants/revokes (admins), email-handling basis (policy or consent), per-program update procedure; DOC-08 reference.

**Required fields (from profile):** Environments, configuration, deployment process, monitoring, backup, rollback, recovery.

**Available inputs:** Old access procedure docx (update basis, SharePoint/Outlook-specific); risk register R-03/R-04; ASR-01 acceptance test.

**Missing inputs:** Platform (DEC-01); access mechanism (DEC-02); email basis (NEED-03); admin names (DEC-06 related).

**Artifact-specific acceptance criteria:**
- AC-01: Environments listed
- AC-02: Process steps clear
- AC-03: Monitoring configured
- AC-04: Recovery tested

**Content readiness conditions (ASR-01 acceptance test):** Record names mechanism on chosen platform; states email-handling basis; admins can operate access grants from it.

---

### DEV-08: Test Strategy and Plan

| Attribute | Value |
|-----------|-------|
| Domain | DEV |
| Disposition | Create later (deferred shell) |
| Profile | test-strategy from artifact-profiles.md |
| Pattern | plan from generic-patterns.md |
| Predecessors | PM-23/BA-19 (Hard); PM-48 (Soft); DEV-03 (Soft) |
| Dependency strength | Hard (PM-23) |
| PMI reference | Workspace-defined (Quality domain) |

**Purpose:** Define test levels, responsibilities, environments, and exit criteria for launch quality.

**Required minimum contents:** Access restriction testing (R-03); device matrix (BL-08); participant test with participants (BL-11); acceptance criteria linkage; defect handling; exit criteria.

**Required fields (from profile):** Test levels, responsibilities, environments, test data, coverage targets, exit criteria.

**Available inputs:** Backlog test items (BL-08, BL-09, BL-11); charter lesson (stress testing, evidence base O-28); risk register R-03.

**Missing inputs:** Acceptance criteria content (PM-23); test environments/tools; coverage targets.

**Artifact-specific acceptance criteria:**
- AC-01: Levels defined
- AC-02: Responsibilities assigned
- AC-03: Environment described
- AC-04: Coverage targets set

**Content readiness conditions:** Test cases traceable to acceptance criteria; environments named.

---

### DEV-10: Repository and Development Guide (conditional)

| Attribute | Value |
|-----------|-------|
| Domain | DEV |
| Disposition | Create later (conditional shell) |
| Profile | repo-guide from artifact-profiles.md |
| Pattern | statement-definition from generic-patterns.md |
| Predecessors | D-01 = custom code (Conditional) |
| Dependency strength | Conditional |
| PMI reference | Workspace-defined (Setup domain) |

**Purpose:** Document repository setup and development conventions for the AI-assisted build — only if custom code is chosen.

**Required minimum contents:** Repo structure, local setup, coding rules, contribution process, tool versions.

**Required fields (from profile):** Repository structure, setup instructions, coding rules, contribution process, review process, tool versions.

**Available inputs:** None beyond activation condition (DEC-01).

**Missing inputs:** Everything; gated on DEC-01 = custom code.

**Artifact-specific acceptance criteria:**
- AC-01: Structure documented
- AC-02: Setup verified
- AC-03: Rules explicit
- AC-04: Process complete

**Content readiness conditions:** Repo exists; tool versions confirmed.

---

### BA-34: Readiness assessment

| Attribute | Value |
|-----------|-------|
| Domain | BA |
| Disposition | Create later (deferred shell) |
| Profile | readiness-assessment from artifact-profiles.md |
| Pattern | report from generic-patterns.md |
| Predecessors | DEV-07 (Soft); DEV-08 (Soft); BL-10 (Hard); DEC-06 (Soft) |
| Dependency strength | Hard (BL-10) |
| PMI reference | BA Guide Solution Evaluation |

**Purpose:** Assess pre-launch readiness: content loaded, tests passed, access operable, owner confirmed.

**Required minimum contents:** Content load check (BL-10); test completion (BL-11); access operable from DEV-07 record; maintenance owner (DEC-06).

**Required fields (from profile):** Assessment area, current readiness, target readiness, gaps, actions, owner, timeline.

**Available inputs:** Backlog BL-10..BL-14; deadline Sep 11; DEC-06 open item.

**Missing inputs:** Readiness results; owner confirmation (DEC-06).

**Artifact-specific acceptance criteria:**
- AC-01: Areas assessed against target
- AC-02: Gaps identified
- AC-03: Actions assigned
- AC-04: Timeline realistic

**Content readiness conditions:** Evidence of content load, tests, and access operation.

---

### BA-15: Transition planning information

| Attribute | Value |
|-----------|-------|
| Domain | BA |
| Disposition | Create later (deferred shell) |
| Profile | transition-plan from artifact-profiles.md |
| Pattern | plan from generic-patterns.md |
| Predecessors | DEC-04 (Hard, external); BA-34 (Soft) |
| Dependency strength | Hard (external) |
| PMI reference | BA Guide Solution Evaluation |

**Purpose:** Plan the move from current to future state: content migration and SharePoint decommission after go-live.

**Required minimum contents:** Content migration approach (DEC-04); SharePoint decommission plan (DEC-08); cutover/support period.

**Required fields (from profile):** Transition approach, current-to-future state steps, training, data migration, cutover plan, support period.

**Available inputs:** DEC-04 (defer until after go-live); DEC-08 (decommission intent); existing content locations (SharePoint, YouTube).

**Missing inputs:** Migration details; decommission decision outcome; dates.

**Artifact-specific acceptance criteria:**
- AC-01: Approach defined
- AC-02: Steps sequenced
- AC-03: Training addressed
- AC-04: Support planned

**Content readiness conditions:** Migration scope and dates populated post go-live.

---

### PM-11: Closure report

| Attribute | Value |
|-----------|-------|
| Domain | PM |
| Disposition | Create later (deferred shell) |
| Profile | closure-report from artifact-profiles.md |
| Pattern | report from generic-patterns.md |
| Predecessors | BA-15 (Soft); go-live evidence (Soft) |
| Dependency strength | Soft |
| PMI reference | PMBOK Section 4 -- Closing |

**Purpose:** Final project summary and performance evaluation at close.

**Required minimum contents:** Scope/schedule outcome vs Sep 11 launch; final OK evidence; lessons learned; open items; handover.

**Required fields (from profile):** Project summary, final scope/schedule/cost, objectives achievement, benefits realization, lessons learned, open items, handover record, final approval.

**Available inputs:** Closure precedent (Old artifacts closure report); brief success criteria; register history.

**Missing inputs:** Final figures, approvals, dates.

**Artifact-specific acceptance criteria:**
- AC-01: Final metrics reported
- AC-02: Objectives evaluated
- AC-03: Benefits assessed
- AC-04: Approval documented

**Content readiness conditions:** Post-launch evidence and approvals.
