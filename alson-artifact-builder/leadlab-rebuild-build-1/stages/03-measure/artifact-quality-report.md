# Artifact Quality Report

**Run:** `projects/lead-lab/alson-artifact-builder/leadlab-rebuild-build-1/`
**Date:** 2026-08-11

## Template Quality Scores (T-01..T-12, scale 1-13)

Template quality measures what the builder controls: structure, PMI alignment, traceability, placeholder compliance, consistency, and labeling. All 10 artifacts are deferred shells; scores reflect structural compliance, not content (content is assessed separately).

| Artifact | T-01 | T-02 | T-03 | T-04 | T-05 | T-06 | T-07 | T-08 | T-09 | T-10 | T-11 | T-12 | Total /156 | % |
|----------|------|------|------|------|------|------|------|------|------|------|------|------|-----------|-----|
| PM-23/BA-19 Acceptance criteria | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| PM-31 Milestone list | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| DEV-03 Architecture | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| DEV-06 Security and Privacy | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| DEV-07 Ops + access record | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| DEV-08 Test Strategy | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| DEV-10 Repo Guide | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| BA-34 Readiness assessment | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| BA-15 Transition planning | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |
| PM-11 Closure report | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 13 | 156 | 100 |

Scoring notes:

- T-01: all pattern-required sections present per artifact profile (list-register, dev-specification, plan, report, statement-definition).
- T-03: every shell has title, artifact ID, domain, version/date, owner, status (Deferred).
- T-04: PM/BA shells align to PMBOK Section 4 and BA Guide references in profiles; DEV shells align to workspace-defined profiles (noted as such).
- T-05: all gaps use TBD-NNN (16 IDs); two bare-TBD violations found in review (DEV-06 logging row, PM-31 actual-date cells) were corrected before this report; all TBDs have backlog records.
- T-06: deferred shells carry the "Deferred - not yet activated" label per deferred-shell rule (build stage 2e); content-pending state is also visible via metadata.
- T-08: predecessor references point to canonical records (decision log D-01/D-02, backlog.md, old access procedure docx) and built shells (dev03/dev06 referenced by DEV-07, BA-34, BA-15).
- T-09: every shell cites its prescription entry ID and disposition.
- T-10: available inputs cited (backlog.md, risk-register.md, decision-log.md, Old artifacts); missing inputs registered in the information backlog.
- T-11: shells are lean; the 18-row TBD table in PM-23/BA-19 is required visibility per placeholder rule 5, not filler.
- T-12: sections follow the pattern order; activation conditions precede Items per deferred-shell requirement.

## Content Readiness Scores (C-01..C-07, scale 1-13)

| Artifact | C-01 | C-02 | C-03 | C-04 | C-05 | C-06 | C-07 | Composite | Status |
|----------|------|------|------|------|------|------|------|-----------|--------|
| PM-23/BA-19 Acceptance criteria | 3 | 2 | 10 | 3 | 4 | 9 | 2 | 4.7 | Pending |
| PM-31 Milestone list | 4 | 2 | 10 | 2 | 4 | 9 | 2 | 4.7 | Pending |
| DEV-03 Architecture | 4 | 3 | 10 | 2 | 4 | 9 | 2 | 4.9 | Pending |
| DEV-06 Security and Privacy | 3 | 2 | 10 | 2 | 4 | 9 | 2 | 4.6 | Pending |
| DEV-07 Ops + access record | 4 | 2 | 10 | 2 | 5 | 9 | 2 | 4.9 | Pending |
| DEV-08 Test Strategy | 4 | 2 | 10 | 2 | 4 | 9 | 2 | 4.7 | Pending |
| DEV-10 Repo Guide | 1 | 1 | 8 | 1 | 3 | 8 | 1 | 3.3 | Pending |
| BA-34 Readiness assessment | 3 | 2 | 10 | 2 | 4 | 9 | 2 | 4.6 | Pending |
| BA-15 Transition planning | 3 | 2 | 10 | 2 | 4 | 9 | 2 | 4.6 | Pending |
| PM-11 Closure report | 2 | 1 | 10 | 1 | 3 | 9 | 1 | 3.9 | Pending |

Readiness notes:

- C-01 (facts) and C-03 (owner) are critical. C-03 passes on all shells (owners named: requester + IT team, IT Director, LeadLab Director). C-01 is below 5 on every shell because the platform decision (TBD-001) and its dependents are unresolved — by design for deferred shells.
- Composite below 5 everywhere → all artifacts **Pending**. No artifact is Fail (structure and partial facts exist; no section is entirely empty).
- DEV-07 is structurally complete for the ASR-01 acceptance test (all five required sections mapped) but content requires DEC-01/DEC-02/NEED-03.

## Package Measures

| Measure | Value |
|---------|-------|
| Package template quality | 1560/1560 = 100% |
| Package content readiness | 45.9/10 = 4.6 (Pending) |
| Template gate | **PASS** (average 100% >= 5; no blocking template failures; critical items T-01/T-04/T-05 all 13) |
| Content gate | Pending — reported, not blocking |

## Package-Level Checks

| Check | Result |
|-------|--------|
| Coverage | PASS — all 10 prescription Create-later items have outputs (package index) |
| Dependency compliance | PASS — build order respected; DEV-08 built after its hard predecessor PM-23/BA-19; no circular dependencies |
| Consistency | PASS — consistent IDs (BL, MS, D, R, TBD), role names, project name, and scope boundaries across artifacts |
| TBD management | PASS — 16 TBDs, all with backlog records, owners, and resolution triggers |
| Provisional marking | PASS — all 10 shells labeled Deferred; content-pending state visible |

## Findings

| # | Finding | Category | Severity | Correction |
|---|---------|----------|----------|------------|
| 1 | Two bare TBDs without IDs (DEV-06 logging, PM-31 actual dates) | Placeholder rule violation | Important | **Applied.** Replaced with TBD-001 and TBD-016; backlog updated |
| 2 | All content readiness Pending (by design) | Content readiness gap | None (expected) | Resolve TBD-001/TBD-002/TBD-003 to advance; tracked in information backlog |
| 3 | DEV-07 access record is the only shell whose completion unblocks an upstream decision (DEC-02 reassessment) | Cross-artifact dependency | Watch | Track ASR-01 status in decision-artifact-handoff closure states |

## Gate Determination

- Template gate: **Passed** (100%, no blocking failures).
- Content gate: **Pending** (4.6 average; C-01 below threshold on all shells) — does not block this cycle.
