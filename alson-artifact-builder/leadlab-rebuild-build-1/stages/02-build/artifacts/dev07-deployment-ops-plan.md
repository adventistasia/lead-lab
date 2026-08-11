# Deployment and Runtime Operations Plan (DEV-07)

> **Deferred - not yet activated**
> Prescription entry: DEV-07, Create later. Activation conditions: DEC-01 platform decision and DEC-02 access mechanism choice.
> ASR-01 (NEED-05): this record is the participant access handling record for the new platform.

| Field | Value |
|-------|-------|
| Artifact ID | DEV-07 |
| Name | Deployment and Runtime Operations Plan |
| Domain | DEV |
| Version / date | 1.0 / 2026-08-11 |
| Owner | Requester + IT team |
| Status | Deferred (shell) |
| PMI reference | Workspace-defined (Operations domain) |

## Purpose

Define how the portal is deployed, monitored, backed up, and operated — including how participant access is granted, revoked, and recorded per program (ASR-01).

## Design Decisions

| Decision | Status | Rationale |
|----------|--------|-----------|
| Hosting environment | TBD-004: pending DEC-05 | No formal budget (AL-04); domain availability unconfirmed |
| Access mechanism on platform | TBD-002: pending DEC-02 | Choose among SSO, login, email-list gating |
| Email handling basis | TBD-003: pending NEED-03 | Which policy applies, or documented consent basis |
| Access admin roles | TBD-008: pending admin confirmation | Old procedure names no specific admins |

## Details

| Aspect | Detail |
|--------|--------|
| Environments | TBD-004: hosting after DEC-01/DEC-05 |
| Configuration | TBD-001: platform-dependent |
| Deployment process | TBD-001: platform-dependent; rollback plan required |
| Monitoring | TBD-001: platform capabilities; charter lesson: analytics limits motivated rebuild (evidence base O-27) |
| Backup | TBD-001: platform capabilities; storage risk R-07 context |
| Rollback / recovery | TBD-001: platform-dependent |

### Participant Access Management Procedure (ASR-01 / NEED-05)

Required content per ASR-01 acceptance test:

| # | Section | Content | Status |
|---|---------|---------|--------|
| 1 | Access mechanism | The mechanism on the chosen platform (SSO / login / email-list gating) | TBD-002: pending DEC-02 |
| 2 | Who grants and revokes access | Admin roles and names | TBD-008: pending admin confirmation |
| 3 | Email-handling basis | Which org policy applies, or the documented consent basis for storing and using participant emails | TBD-003: pending NEED-03 |
| 4 | Per-program update procedure | Step-by-step add/remove of participants for each LeadLab program, including timing (per program run) | TBD-002, TBD-008 |
| 5 | Reference basis | Old procedure `How to give Lead Lab participants access to the portal.docx` (SharePoint/Outlook-specific) | Available — reference, not duplicate |

## Dependencies

| Predecessor | ID | Type | Status |
|-------------|----|------|--------|
| DEC-01 platform decision | decision-log D-01 | Hard (external) | Pending |
| DEC-02 access mechanism | decision-log D-02 | Hard (external) | Pending |
| NEED-03 privacy basis | ACT-04 confirmation | Hard (external) | Pending |
| DEV-03 architecture | dev03-architecture.md | Soft | Shell |
| DEV-06 security design | dev06-security-privacy-design.md | Soft | Shell |
| Old access procedure | Old artifacts/Procedures/ | Reference | Available |

Overlap: business support procedures are referenced in DOC-08 (Support and Operations Guide), not duplicated.

## Security

Access control and privacy design live in DEV-06; this record is the operable procedure admins run from. Public-access risk tracked in risk-register.md R-03.

## Version Control

| Date | Author | Version | Change |
|------|--------|---------|--------|
| 2026-08-11 | Alson (builder) | 1.0 | Shell created from prescription DEV-07 + ASR-01 minimum contents; content pending TBD-001..TBD-004, TBD-008 |
