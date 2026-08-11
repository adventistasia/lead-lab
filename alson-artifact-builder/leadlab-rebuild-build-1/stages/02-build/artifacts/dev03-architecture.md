# Software Architecture Description (DEV-03)

> **Deferred - not yet activated**
> Prescription entry: DEV-03, Create later. Activation condition: DEC-01 platform decision.

| Field | Value |
|-------|-------|
| Artifact ID | DEV-03 |
| Name | Software Architecture Description |
| Domain | DEV |
| Version / date | 1.0 / 2026-08-11 |
| Owner | Requester + IT team |
| Status | Deferred (shell) |
| PMI reference | Workspace-defined (Architecture domain) |

## Purpose

Describe the components, technology stack, system boundaries, and integrations of the rebuilt LeadLab Portal.

## Design Decisions

| Decision | Status | Rationale |
|----------|--------|-----------|
| Platform choice (website builder / WordPress / custom code) | TBD-001: pending DEC-01 | Decision readiness DEC-01; all other architecture decisions depend on it |
| Access mechanism (SSO / login / email-list gating) | TBD-002: pending DEC-02 | Restricted access requirement (AL-06); depends on platform capabilities |
| Hosting and domain | TBD-004: pending DEC-05 | No formal budget (AL-04); domain "possibly" available |
| Video hosting: keep YouTube embedding | Soft default | Current workflow documented (evidence base O-13); DEC-03 conditionally ready |

## Details

| Aspect | Detail |
|--------|--------|
| Components | Session videos by category/date; search over sessions and materials; downloadable supporting materials; multi-device layout; restricted access (backlog BL-05..BL-09) |
| Technology stack | TBD-001: platform-dependent; TBD-007: stack details pending platform |
| System boundaries | Replaces SharePoint portal (southernasiapacific.sharepoint.com/sites/leadlab-portal); participants only, not public (AL-06) |
| Integrations | YouTube embedding (current workflow, evidence base O-13); M365 SSO today, mechanism TBD-002 on new platform |
| Build and deploy approach | TBD-001: depends on DEC-01; AI-assisted development assumed (AL-01, ACT-02 spike validates) |

## Dependencies

| Predecessor | ID | Type | Status |
|-------------|----|------|--------|
| DEC-01 platform decision | decision-log D-01 | Hard (external) | Pending |
| DEC-02 access mechanism | decision-log D-02 | Soft | Pending |
| DEC-05 hosting/domain | decision-log D-05 | Soft | Pending |
| DEC-03 video hosting | decision-log D-04 | Soft | Conditionally ready |

Predecessor record: decision-log.md (D-01..D-08), backlog.md (BL-04..BL-09).

## Security

Security and access-control architecture is carried by DEV-06 (Security and Privacy Design); this record references it, not duplicates.

## Version Control

| Date | Author | Version | Change |
|------|--------|---------|--------|
| 2026-08-11 | Alson (builder) | 1.0 | Shell created from prescription DEV-03; content pending TBD-001, TBD-002, TBD-004 |
