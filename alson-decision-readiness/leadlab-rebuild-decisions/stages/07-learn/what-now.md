# What Now?

## Current Position

**Outcome:** Governance pending — assessment passed the quality gate; the decision maker has not yet responded.
**Quality gate:** Passed (95.7%, threshold 95%; no blocking failures; critical dimensions 13/13)
**Recommended next move:** Run the four immediate actions, then make the platform decision (DEC-01) within days.
**Confidence:** Medium

Basis: The platform decision blocks all build work. The brief is decision-ready, but no responsible platform choice can be made until the options are compared and the AI-acceleration assumption is validated. Audit found no failures; the only score below 13 (Option quality, 8) reflects a real evidence gap that the immediate actions close.

## Do Next

| # | Action | Why Now | Owner | Effort | Evidence | Target Stage |
|---|---|---|---|---|---|---|
| 1 | Compare website builder vs WordPress vs custom code (timeline, cost, access support, customization, maintenance) incl. YouTube embedding and domain/hosting facts | DEC-01 is blocked without it; unblocks DEC-02, DEC-05 | Requester | Small-Medium | NEED-01, 06, 07, 08 | Decision brief, Immediate |
| 2 | Run a small AI-assisted build spike | Validates the unproven assumption that drives the custom-code option | Requester | Small | NEED-02 | Decision brief, Immediate |
| 3 | Ask LeadLab Director whether Sep 11, 2026 is a hard deadline | Sizes the timeline risk for the platform choice | Requester | Small | DEC-07 | Decision brief, Immediate |
| 4 | Confirm privacy policy for participant emails with IT Director | Unblocks the access decision and the ASR-01 basis | Requester | Small | NEED-03 | Decision brief, Immediate |
| 5 | Route ASR-01 to `project-artifact-prescription` | Quality gate passed; referral is justified and needed for DEC-02 | Alson OS | Small | ASR-01 | Artifact prescription |

## Decisions Needed

| Decision | Readiness | Recommendation | Alternatives | Impact of Delay |
|---|---|---|---|---|
| Platform (DEC-01) | Blocked → ready after actions 1-2 | Not yet determinable until comparison exists | Website builder, WordPress, custom code | Build cannot start; Sep 11 deadline at risk |
| Access mechanism (DEC-02) | Blocked on DEC-01 | Not yet determinable | M365 SSO, platform login, email-list gating | Access design delays build |
| Date flexibility (DEC-07) | Needs confirmation | Hard date assumed until answered | Flexible date | Timeline risk stays unquantified |
| Maintenance owner (DEC-06) | Needs confirmation | IT team likely; confirm | External support | Post-launch support gap |
| Budget/hosting/domain (DEC-05) | Blocked on DEC-01 | Confirm after comparison | None defined | Cost risk unquantified |

## Conditions and Blockers

| Item | Type | Resolution | Owner |
|---|---|---|---|
| AI-acceleration assumption unproven | Assumption | Small spike before committing to custom code | Requester |
| No platform comparison exists | Evidence gap | Action 1 | Requester |
| Privacy rules for participant emails unconfirmed | Evidence gap | Action 4; ASR-01 records the basis | Requester |
| Sep 11 date flexibility unknown | Evidence gap | Action 3 | Requester |
| Maintenance owner unassigned | Authority gap | Conversation with IT Director before go-live | Requester |

## Later

| Item | Trigger for Reconsideration |
|---|---|
| Content migration (DEC-04) | After Sep 11 go-live |
| Video hosting relocation (DEC-03 revisit) | Post-launch; if storage or analytics needs grow |
| SharePoint decommission vs archive (DEC-08) | After successful go-live |
| Decision readiness re-run | When immediate actions complete or DM requests review |

## Gate Status

- **Quality gate:** Passed — 95.7%, no blocking failures, critical dimensions 13/13 (see `stages/06-measure/audit-findings.md`).
- **Governance gate:** Not passed — decision maker (requester + IT Director; final OK LeadLab Director) has not accepted. Needed: review of the brief and decision on DEC-01.
- **ASR routing:** ASR-01 issued (1 request) to `project-artifact-prescription`; expected return `artifact-support-handoff.md`; evidence need NEED-05 currently Referred.

## Terminal State

**Governance pending** — quality gate passed, no decision maker response yet.
