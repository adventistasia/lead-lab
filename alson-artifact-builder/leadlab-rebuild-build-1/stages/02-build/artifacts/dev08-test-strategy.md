# Test Strategy and Plan (DEV-08)

> **Deferred - not yet activated**
> Prescription entry: DEV-08, Create later. Activation condition: DEC-01 platform decision; test cases trace to acceptance criteria (PM-23/BA-19).

| Field | Value |
|-------|-------|
| Artifact ID | DEV-08 |
| Name | Test Strategy and Plan |
| Domain | DEV |
| Version / date | 1.0 / 2026-08-11 |
| Owner | Requester + IT team |
| Status | Deferred (shell) |
| PMI reference | Workspace-defined (Quality domain) |

## Purpose

Define how the portal is tested before the Sep 11 launch so launch quality is verifiable (BL-11).

## Approach

| Aspect | Content | Status |
|--------|---------|--------|
| Test levels | Feature checks per backlog item; access restriction testing; device matrix; participant acceptance test | Levels confirmed from backlog (BL-08, BL-09, BL-11) |
| Responsibilities | Requester + IT team build and test; participants in BL-11 window; LeadLab Director final OK (BL-12) | Available |
| Environments | TBD-010: platform-dependent (DEC-01) | Pending |
| Test data | TBD-010: sample sessions/materials; participant test accounts | Pending |
| Coverage targets | Access restriction (R-03); devices (desktop/tablet/mobile, BL-08); participant flows | TBD-010: targets |
| Exit criteria | TBD-010: pending acceptance criteria (PM-23/BA-19) | Pending |
| Defect handling | Defects tracked in issues-log.md during build/testing | Available |

## Roles

| Role | Who |
|------|-----|
| Build and test execution | Requester + IT team |
| Participant test | LeadLab participants (BL-11) |
| Final acceptance | LeadLab Director (BL-12) |

## Inputs

| Source | Role |
|--------|------|
| Backlog BL-08, BL-09, BL-11 | Test scope |
| PM-23/BA-19 acceptance criteria | Test cases (hard dependency) |
| Risk register R-03 | Access restriction testing |
| Charter lesson (evidence base O-28) | Stress testing with expected user volumes |
| DEV-03 architecture | Test levels and environments (soft) |

## Outputs

Test evidence feeding verification and acceptance (essential record 7) and BA-34 readiness assessment.

## Schedule

TBD-010: test window dates (feeds PM-31 MS-03).

## Tailoring

Small 1-month build: lightweight test plan; participant test window is the acceptance gate. No separate quality plan (PM-06) — quality is acceptance criteria + this plan.

## Version Control

| Date | Author | Version | Change |
|------|--------|---------|--------|
| 2026-08-11 | Alson (builder) | 1.0 | Shell created from prescription DEV-08; content pending TBD-010 |
