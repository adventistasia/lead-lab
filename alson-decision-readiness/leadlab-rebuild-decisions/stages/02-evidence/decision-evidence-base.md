# Decision Evidence Base

## Overview

- Target decision: Which platform should the LeadLab Portal be rebuilt on to replace SharePoint (same feature scope, restricted access, live before Sep 11, 2026)?
- Total sources found: 8 (plus 2 video files excluded)
- Sources read successfully: 8
- Sources unreadable: 2 (`LeadLab Portal - Process Part 1.webm`, `Leadlab Portal - Process Part 2.webm` — video walkthroughs, no transcript; the two text procedures cover the same content)
- Date inventoried: 2026-08-11

## Source Index

| Source | Location | Type | Role | Content Summary |
|--------|----------|------|------|-----------------|
| request-brief.md | `projects/lead-lab/alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md` | Document | Accepted intake brief | Rebuild off SharePoint, same features, restricted access, live before Sep 11, 2026; 7 open risks; no formal budget |
| audit-findings.md | `.../stages/02-measure/output/audit-findings.md` | Document | Quality audit | Accepts brief; AI-acceleration assumption is the highest-risk item; access affects data handling and build effort |
| what-now.md | `.../stages/03-learn/output/what-now.md` | Document | Handoff | Platform decision first; four human decisions: platform, access, maintenance, video hosting |
| run-manifest.md (intake) | `.../run-manifest.md` | Document | Run record | Content starts fresh; restricted access; requester + IT Director; possible domain name |
| Project Charter.docx | `projects/lead-lab/Old artifacts/` | Document | Charter (closed project) | Original mandate: SharePoint portal, M365 SSO, filter by category/date, downloads, multi-device; roles; no-custom-development constraint |
| Project Closure Report.docx | `projects/lead-lab/Old artifacts/` | Document | Closure report | Dec 10, 2024 - Jan 16, 2025; no budget; lessons: use advanced features, scalability limits of SharePoint; recommendations incl. external hosting |
| How to add videos in the portal.docx | `.../Procedures/` | Document | Operating procedure | YouTube share links embedded in news posts; materials via Quick Links; optional participant email on publish |
| How to give participants access.docx | `.../Procedures/` | Document | Operating procedure | Participant emails added to LeadLab Portal Access Outlook group; M365 SSO gates access |

## Observations by Decision Relevance

### Directly Relevant to Target Decision

| # | Observation | Type | Source | Confidence |
|---|-------------|------|--------|------------|
| 1 | Platform choice open; no leading option (website builder, WordPress, custom code all open) | Unknown | request-brief.md, Risks | High |
| 2 | SharePoint chosen originally only because a custom build was not feasible in the original timeline | Fact | request-brief.md, Situation; Charter, Description | High |
| 3 | AI-assisted development ("vibe coding") assumed to make a custom build feasible; assumed, not proven | Assumption | request-brief.md, Constraints; audit-findings.md, Notes | Medium |
| 4 | Timeline: ready before Sep 11, 2026 (~1 month) | Fact | request-brief.md, Timing | High |
| 5 | No formal budget; team resources and possibly a domain name available | Fact | request-brief.md, Constraints; run-manifest.md | High |
| 6 | Platform decision blocks all build work | Fact | what-now.md; lead-lab CONTEXT.md | High |
| 7 | Closure report recommends evaluating external hosting as content grows | Fact | Closure Report.docx, Recommendations | Medium |
| 8 | Original constraint: no custom development within SharePoint; some requirements infeasible under it | Fact | Charter.docx, Constraints | High |

### Relevant to Supporting Decisions

| # | Observation | Type | Source | Confidence |
|---|-------------|------|--------|------------|
| 9 | Access restricted to LeadLab participants, not public | Fact | request-brief.md, Request Details | High |
| 10 | Current access: participant emails added to Outlook group; access via M365 SSO | Fact | Access procedure; request-brief.md, Situation | High |
| 11 | Access mechanism for new platform (SSO, login, email-list) not decided | Unknown | request-brief.md, Risks | High |
| 12 | Privacy rules for participant emails not confirmed | Unknown | request-brief.md, Risks | Medium |
| 13 | Current video workflow: YouTube share links embedded in news posts | Fact | Video procedure; request-brief.md, Situation | High |
| 14 | Whether new platform keeps YouTube dependency undecided | Unknown | request-brief.md, Risks | High |
| 15 | Content migration out of scope now; existing content stays in place | Existing decision | request-brief.md, Request Details | High |
| 16 | Post-launch maintenance owner not assigned | Unknown | request-brief.md, Risks | High |
| 17 | Whether Sep 11, 2026 date is flexible unknown | Unknown | request-brief.md, Timing | Medium |
| 18 | Final OK from LeadLab Director | Fact | request-brief.md, People | High |
| 19 | Requester + team do the work; agreed with IT Director | Fact | request-brief.md, People | High |
| 20 | Feature scope: same as current portal, no new features | Existing decision | request-brief.md, Request Details | High |
| 21 | Current features: filter by category/date, search, downloads, desktop/tablet/mobile | Fact | request-brief.md, Situation; Charter.docx | High |
| 22 | Original stakeholder requirements included M365 SSO | Fact | Charter.docx, Stakeholder Requirements | High |
| 23 | Original roles: Carmen Sarmiento (Owner), Stephen Salainti (Sponsor), Ryann Micua (Tech Adviser), Joven Agno (Lead Dev/PM) | Fact | Charter.docx, Stakeholders | High |
| 24 | Timeline slip risk would affect event readiness | Fact | Charter.docx, Risks | High |
| 25 | Storage overload risk; original mitigation: upload to YouTube | Fact | Charter.docx, Risks; Closure.docx, Lessons | High |
| 26 | Original project completed earlier than expected, no budget, no expenses | Fact | Closure.docx, Performance | High |
| 27 | Lesson: advanced analytics/engagement insights limited by SharePoint | Fact | Closure.docx, Lessons | Medium |
| 28 | Lesson: stress testing and clear communication managed performance/adoption risks | Fact | Closure.docx, Lessons | Medium |

### Tangential

| # | Observation | Type | Source | Confidence |
|---|-------------|------|--------|------------|
| 29 | Portal posts can optionally email participants on publish | Fact | Video procedure | Medium |
| 30 | Media team supplies YouTube links | Fact | request-brief.md, People | High |

## Conflicts

No material conflicts. The original "no custom development" charter constraint is superseded by the rebuild intent, not contradicted by it.

## Gaps

| Gap | Relevance | What Is Missing |
|-----|-----------|-----------------|
| Platform options not compared | Direct | No comparison of website builder vs WordPress vs custom code on cost, effort, timeline, access support, customization, maintenance |
| AI-acceleration assumption unvalidated | Direct | No evidence a custom build can be completed and tested in ~1 month |
| Hosting and domain status | Direct | Whether a domain name is confirmed and where the portal would be hosted |
| Access options per platform | Supporting | How each candidate platform supports restricted access and SSO |
| Privacy rules for participant emails | Supporting | Which data-protection rules apply to storing participant emails on the new platform |
| Date flexibility | Supporting | Whether Sep 11, 2026 is a hard deadline |
| Maintenance ownership | Supporting | Who maintains the portal after launch |
| Budget detail | Direct | What a platform choice would cost to operate |

## Unreadable Sources

- `LeadLab Portal - Process Part 1.webm`: video file, no transcript; content covered by text procedures
- `Leadlab Portal - Process Part 2.webm`: video file, no transcript; content covered by text procedures
