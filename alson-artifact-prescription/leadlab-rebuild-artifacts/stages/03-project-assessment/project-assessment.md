# Project Assessment: LeadLab Portal Rebuild

## Assessment Confidence

- Overall confidence: Medium-High
- Evidence quality: Strong mandate/scope evidence (accepted brief, 100% quality); strong decision-set evidence (register, evidence base, both quality-passed); key delivery facts (platform, hosting, privacy basis, date flexibility) still unknown pending DEC-01 and confirmations

## Assessment by Dimension

| # | Dimension | Finding | Type | Sources | Confidence |
|---|-----------|---------|------|---------|------------|
| 1 | Problem or Opportunity | SharePoint limits customization and analytics; chosen only because custom build was previously infeasible; AI-assisted development now assumed feasible; rebuild needed before Sep 11, 2026 program | Fact | request-brief.md Situation; decision-evidence-base.md O-2, O-27 | High |
| 2 | Current State | SharePoint portal with M365 SSO, Outlook-group access, YouTube-embedded session videos, filter by category/date, search, downloadable materials, multi-device; documented in old procedures | Fact | request-brief.md Situation; access procedure docx; video procedure docx; decision-evidence-base.md O-10, O-13, O-21 | High |
| 3 | Desired Future State | Same feature scope on a more customizable platform, restricted to participants, live before Sep 11, 2026; success = portal works for the program + final OK from LeadLab Director; content migration deferred | Fact | request-brief.md Request Details, What success looks like | High |
| 4 | Project Profile | See table below | - | - | - |
| 5 | BA Planning and Approach | No formal BA function; requirements carried in backlog (BL-01..18); elicitation = current portal features + closed-project records; BA work embedded in the IT team build | Fact | backlog.md Source; request-brief.md People | Medium |
| 6 | Stakeholders and Engagement | Small set: requester + IT team, IT Director, LeadLab Director, media team, participants; all named in brief; no engagement plan needed | Fact | request-brief.md People; decision-evidence-base.md O-18, O-19 | High |
| 7 | Scope and Requirements | Scope explicit: same features, no new features; out of scope: content migration; requirements = 18 backlog items; stability: fixed by brief, subject to Director confirmation (AL-02) | Fact | request-brief.md Request Details; backlog.md | High |
| 8 | Schedule and Delivery | ~1 month to launch; no milestone list or schedule exists; delivery control currently = brief deadline + backlog effort sizes; DEC-01 blocks build start | Fact | request-brief.md Timing; backlog.md; project-next-actions.md Evidence Gaps | High |
| 9 | Finance and Benefits | No formal budget (AL-04); old project had no expenses (O-26); cost/hosting figures pending DEC-01 comparison (NEED-07); no benefits program beyond program readiness | Fact | request-brief.md Constraints; decision-evidence-base.md O-5, O-26 | High |
| 10 | Resources and Organization | Requester + IT team build; IT Director sanctioned; media team supplies links; ongoing maintenance owner unassigned (DEC-06) | Fact | request-brief.md People; decision-evidence-base.md O-16, O-19, O-30 | High |
| 11 | Risk, Controls, and Compliance | Risk register current (R-01..R-07, responses defined); 2 high-exposure risks; participant email privacy rules unconfirmed (NEED-03); no regulatory obligation identified | Fact | risk-register.md; decision-readiness-register.md NEED-03 | Medium |
| 12 | Software Delivery | Production portal rebuild; platform undecided (DEC-01); access mechanism undecided (DEC-02); integration: YouTube embedding; data: participant emails (personal data); users: restricted participant group | Fact | request-brief.md Situation; decision-readiness-register.md DEC-01, DEC-02 | High |
| 13 | Solution Evaluation | Success criteria in brief (portal works for program; final OK); no formal evaluation plan; closure-report lessons flag analytics value | Fact | request-brief.md How to know it is done; decision-evidence-base.md O-27 | Medium |
| 14 | Information and AI Environment | Authoritative: brief + 6 canonical registers + decision evidence base; AI used for drafting (assist + generate views); human validation at IT Director decisions and LeadLab Director final OK; participant email handling basis undocumented (ASR-01) | Fact | investigation-brief.md Information and AI Context; artifact-support-request.md | Medium |

### Dimension 4: Project Profile

| Factor | Value | Source | Confidence |
|--------|-------|--------|------------|
| Size | Small | backlog.md (18 items, XS-L efforts); request-brief.md People | High |
| Development approach | Adaptive (backlog-driven, AI-assisted) | backlog.md; request-brief.md Constraints (AL-01) | Medium |
| Industry | Education / leadership program (nonprofit-style) | request-brief.md Problem | High |
| Organizational culture | Flat, small team; Director-level approvals | request-brief.md People | Medium |
| Team distribution | Small, likely colocated team | request-brief.md People | Medium |
| Risk level | Medium (2 high-exposure items R-01, R-02; overall small project) | risk-register.md Summary | Medium |
| Stakeholder complexity | Low (few, aligned) | request-brief.md People | High |
| Regulatory environment | None confirmed; participant email privacy basis unconfirmed (NEED-03) | decision-readiness-register.md NEED-03 | Medium |
| Technology maturity | Proven (builder/WordPress) to Emerging (custom code + AI) — undecided | decision-readiness-register.md DEC-01 | Medium |
| Duration | Weeks (~1 month) | request-brief.md Timing | High |
| AI integration level | Assisting/Delegated (AI-assisted build assumed; AI-generated views in pipeline) | request-brief.md Constraints (AL-01) | Medium |

Tailoring factors referenced: PMBOK Guide 8th Ed. Tailoring section (deliberate adaptation by scale, duration, criticality, and stakeholder count; project-level tailoring on product and team factors) and PMI BA Guide §1.3.4 (deliverable and product-information tailoring by consumer needs and risk). Application: small size, short duration, and low stakeholder complexity justify lightweight tailoring; production software and personal data justify security, operations, and test records despite small size. [Source: _core/pmi-pmbok-guide-8-dd.md, Tailoring overview and Project-level tailoring; _core/the-pmi-guide-to-business-analysis-raw.md, §1.3.4]

## Gaps and Unknowns

| Dimension | What is Missing | Impact on Prescription |
|-----------|----------------|----------------------|
| Schedule and Delivery | No milestone list or schedule after DEC-01 | PM-31 Milestone list Create later, gated on DEC-01 |
| Verification and Acceptance | No acceptance criteria per feature; no test plan; no test evidence | PM-23/BA-19 and DEV-08 Create later, before build testing |
| Software Delivery | Platform, hosting, access mechanism undecided | DEV-03, DEV-06, DEV-07, DEV-10 Create later, gated on DEC-01/DEC-02; DEV-05/DEV-10 conditional on custom code |
| Risk and Compliance | Participant email privacy basis unconfirmed (NEED-03) | DEV-06/DEV-07 minimum contents include email-handling basis; NEED-03 is an upstream direct confirmation (ACT-04), not a prescription item |
| Information and AI Environment | No durable access handling record for the new platform (NEED-05 → ASR-01) | DEV-07 Create later carrying the access management procedure; ASR-01 answered |
| Resources and Organization | Maintenance owner unassigned (DEC-06) | BA-34 Readiness assessment Create later includes owner confirmation check; DEC-06 is a decision-readiness item |

## Conflicts and Assumptions

| Issue | Detail | Resolution Needed |
|-------|--------|-------------------|
| AI-acceleration assumption (AL-01) | Custom build feasibility assumed, unproven; if false, custom-code option falls away | ACT-02 build spike (next-actions) before DEC-01 |
| Privacy basis unknown (NEED-03) | Whether an org policy covers participant emails is unconfirmed; record must state the basis | ACT-04 confirmation with IT Director |
| Date flexibility unknown (DEC-07) | Whether Sep 11, 2026 is hard or flexible changes risk sizing | ACT-03 confirmation with LeadLab Director |
| No material conflicts in evidence | Decision evidence base reports no conflicts | None |

## Evidence-Sufficiency Gate

Gate result: **PASS — proceed to Stage 04.** All required minimum evidence dimensions pass with at least Medium confidence: problem identified; prescription approver named (requester, responsible person per accepted brief); intended use clear (DEC-01/DEC-02 support and ASR-01 return); project phase known (pre-execution); scope boundaries defined (brief in/out of scope); constraints identified (privacy basis pending, no budget); project profile complete (small, adaptive, medium risk, low stakeholder complexity); every observation carries a source citation (source-inventory.md).
