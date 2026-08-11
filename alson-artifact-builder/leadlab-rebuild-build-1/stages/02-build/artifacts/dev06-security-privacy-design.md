# Security and Privacy Design (DEV-06)

> **Deferred - not yet activated**
> Prescription entry: DEV-06, Create later. Activation conditions: DEC-01 platform decision and NEED-03 privacy basis confirmation.

| Field | Value |
|-------|-------|
| Artifact ID | DEV-06 |
| Name | Security and Privacy Design |
| Domain | DEV |
| Version / date | 1.0 / 2026-08-11 |
| Owner | Requester + IT team |
| Status | Deferred (shell) |
| PMI reference | Workspace-defined (Security domain) |

## Purpose

Define the threats, controls, access model, and data protection for the portal, with emphasis on participant email handling.

## Design Decisions

| Decision | Status | Rationale |
|----------|--------|-----------|
| Access model (no public access) | Constraint confirmed (AL-06) | Participants only; risk R-03 |
| Access mechanism on platform | TBD-002: pending DEC-02 | Platform capability dependent |
| Email handling basis (org policy or consent) | TBD-003: pending NEED-03 (ACT-04) | No privacy policy found in project evidence (ASR-01) |
| Retention basis for participant emails | TBD-003 | Follows from email handling basis |

## Details

| Aspect | Detail |
|--------|--------|
| Threats | Public exposure of participant content (R-03); unconfirmed email data handling (R-04) |
| Controls | Restricted access gating (BL-09); access testing before launch (BL-11); grant/revoke procedure per program (DEV-07) |
| Access model | TBD-002: SSO / login / email-list gating after DEC-02 |
| Data protection | Participant email addresses are personal data; storage and use basis TBD-003 |
| Logging | TBD-001: platform capabilities after DEC-01 |
| Compliance | No regulatory obligation identified; org policy status TBD-003 |

## Dependencies

| Predecessor | ID | Type | Status |
|-------------|----|------|--------|
| DEC-01 platform decision | decision-log D-01 | Hard (external) | Pending |
| NEED-03 privacy basis | ACT-04 confirmation | Hard (external) | Pending |
| DEV-03 architecture | dev03-architecture.md | Soft | Shell |

## Security

Carrier for the access-control and privacy design that DEV-07 (operations) operates from. Product risks also tracked in risk-register.md (R-03, R-04).

## Version Control

| Date | Author | Version | Change |
|------|--------|---------|--------|
| 2026-08-11 | Alson (builder) | 1.0 | Shell created from prescription DEV-06; content pending TBD-002, TBD-003 |
