# What Now?

## Current Position

**Outcome:** Governance pending — recommendations passed the quality gate; decision maker has not yet responded.
**Quality gate:** Passed (96.9%, threshold Action-ready 28/32; no blocking failures; critical dimensions 4/4)
**Recommended next move:** Run the four carried evidence actions (comparison, spike, date ask, privacy ask), close the prescription gate, then decide the platform (DEC-01) within days.
**Confidence:** Medium

Basis: Delivery is still blocked on DEC-01 with no evidence any immediate action started since cycle 1; Sep 11, 2026 deadline fixed; all 7 risks and 7 issues open; three upstream runs governance pending. The one closed loop is ASR-01 (DEV-07 staged). The project is at risk but not off track: governance, scope, and registers are strong.

## Do Next

| # | Action | Why Now | Owner | Effort | Evidence | Target Stage |
|---|---|---|---|---|---|---|
| 1 | Compare website builder vs WordPress vs custom code (timeline, cost, access, customization, maintenance, YouTube embedding, hosting/domain) | DEC-01 blocked without it; unblocks DEC-02, DEC-05 | Requester | Small-Medium | ACT-01; NEED-01, 04, 06, 07, 08; R-02 | Decision brief, Immediate |
| 2 | Run a small AI-assisted build spike | Validates the unproven AI assumption behind custom code | Requester | Small | ACT-02; NEED-02; R-01 | Decision brief, Immediate |
| 3 | Ask LeadLab Director whether Sep 11, 2026 is a hard deadline | Sizes the timeline risk for the platform choice | Requester | Small | ACT-03; DEC-07 | Decision brief, Immediate |
| 4 | Confirm privacy rules for participant emails with IT Director | Unblocks DEC-02 basis and DEV-07 email content | Requester | Small | ACT-04; NEED-03 | Decision brief, Immediate |
| 5 | Accept the artifact prescription (governance gate) | Arms DEC-02 reassessment; prescription is the only run without a returned handoff | Requester (approver, inferred) | Small | ACT-07; ASR-01 | Artifact prescription, Immediate |
| 6 | Decide platform with requester + IT Director; final OK LeadLab Director | Gates all build work; must happen within days | Requester + IT Director + LeadLab Director | Small | ACT-05; DEC-01, DEC-05 | Decision, Immediate |
| 7 | Confirm post-launch maintenance owner with IT Director | Post-launch support gap closes before go-live | Requester | Small | ACT-06; DEC-06; D-03 | Current phase |

## Decisions Needed

| Decision | Readiness | Recommendation | Alternatives | Impact of Delay |
|---|---|---|---|---|
| Platform (DEC-01) | Blocked → ready after actions 1-2 | Not yet determinable until comparison exists | Website builder, WordPress, custom code | Build cannot start; Sep 11 deadline at risk |
| Access mechanism (DEC-02) | Blocked on DEC-01 + DEV-07 | Not yet determinable | M365 SSO, platform login, email-list gating | Access design delays build |
| Budget/hosting/domain (DEC-05) | Blocked on action 1 | Confirm after comparison | None defined | Cost risk unquantified |
| Date flexibility (DEC-07) | Needs confirmation | Hard date assumed until answered | Flexible date | Timeline risk stays unquantified |
| Maintenance owner (DEC-06) | Needs confirmation | IT team likely; confirm | External support | Post-launch support gap |
| Video hosting (DEC-03) | Conditionally ready | Keep YouTube for launch | Host on new platform | Low; reversible |
| Content transition (DEC-04) | Not yet due | Defer | Schedule migration | Low now |
| SharePoint decommission (DEC-08) | Not yet due | Consider read-only archive at go-live | Full decommission | Low now |
| Prescription acceptance | Ready | Accept; DEV-07 staged on DEC-01 | Revise and resubmit | DEC-02 reassessment stays unarmed |

## Conditions and Blockers

| Item | Type | Resolution | Owner |
|---|---|---|---|
| AI-acceleration assumption unproven | Assumption | Small spike before committing to custom code | Requester |
| No platform comparison exists | Evidence gap | Action 1 | Requester |
| No evidence ACT-01..04 started | Evidence gap | Actions 1-4; record outputs as completed | Requester |
| Privacy rules for participant emails unconfirmed | Evidence gap | Action 4; feeds DEV-07 basis | Requester |
| Sep 11 date flexibility unknown | Evidence gap | Action 3 | Requester |
| Maintenance owner unassigned | Authority gap | Action 7 | Requester |
| Governance responses outstanding (3 runs) | Governance gap | Decision maker responds; actions 5-6 | Requester + Directors |
| DEV-07 access record not created | Control gap | After DEC-01; return to decision readiness for DEC-02 | Requester + IT team |
| No build plan or milestones | Control gap | After DEC-01: short build plan before Sep 11 | Requester + team |

## Later

| Item | Trigger for Reconsideration |
|---|---|
| Content migration (DEC-04) | After Sep 11 go-live |
| Video hosting relocation (DEC-03 revisit) | Post-launch; if storage or analytics needs grow |
| SharePoint decommission vs archive (DEC-08) | After successful go-live |
| Next actions re-run | Actions 1-5 complete, DEC-01 decided, or 1 week without progress |

## Gate Status

- **Quality gate:** Passed — 31/32 (96.9%), no blocking failures, critical dimensions 4/4 (see `stages/05-measure/audit-findings.md`).
- **Governance gate:** Not passed — decision maker (requester; IT Director; LeadLab Director final OK) has not responded. Needed: review of the recommendations and decision on DEC-01; also prescription acceptance (ACT-07).
- **ASR monitor:** Closed at prescription level — ASR-01 returned as DEV-07 (Create later, gated on DEC-01/DEC-02). DEV-07 creation and DEC-02 reassessment are now watch items.

## Terminal State

**Governance pending** — quality gate passed, no decision maker response yet.
