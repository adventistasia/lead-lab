# What Now?

## Current Position

**Outcome:** Governance pending — recommendations passed the quality gate; decision maker has not yet responded.
**Quality gate:** Passed (96.9%, threshold Action-ready 28/32; no blocking failures; critical dimensions 4/4)
**Recommended next move:** Run the four immediate evidence actions (comparison, spike, date ask, privacy ask), then decide the platform (DEC-01) within days.
**Confidence:** Medium

Basis: Delivery is blocked on DEC-01 and the Sep 11, 2026 deadline is ~1 month out. All five blocking gaps close through small actions already defined upstream (NEED-01..08). The project is at risk but not off track: governance, scope, and risk awareness are strong.

## Do Next

| # | Action | Why Now | Owner | Effort | Evidence | Target Stage |
|---|---|---|---|---|---|---|
| 1 | Compare website builder vs WordPress vs custom code (timeline, cost, access, customization, maintenance, YouTube embedding, hosting/domain) | DEC-01 is blocked without it; unblocks DEC-02, DEC-05 | Requester | Small-Medium | ACT-01; NEED-01, 04, 06, 07, 08 | Decision brief, Immediate |
| 2 | Run a small AI-assisted build spike | Validates the unproven assumption behind the custom-code option | Requester | Small | ACT-02; NEED-02 | Decision brief, Immediate |
| 3 | Ask LeadLab Director whether Sep 11, 2026 is a hard deadline | Sizes the timeline risk for the platform choice | Requester | Small | ACT-03; DEC-07 | Decision brief, Immediate |
| 4 | Confirm privacy rules for participant emails with IT Director | Unblocks DEC-02 and the ASR-01 basis | Requester | Small | ACT-04; NEED-03 | Decision brief, Immediate |
| 5 | Decide platform with requester + IT Director; final OK LeadLab Director | Gates all build work; must happen within days | Requester + IT Director + LeadLab Director | Small | ACT-05; DEC-01, DEC-05 | Decision, Immediate |
| 6 | Confirm post-launch maintenance owner with IT Director | Post-launch support gap closes before go-live | Requester | Small | ACT-06; DEC-06 | Current phase |

## Decisions Needed

| Decision | Readiness | Recommendation | Alternatives | Impact of Delay |
|---|---|---|---|---|
| Platform (DEC-01) | Blocked → ready after actions 1-2 | Not yet determinable until comparison exists | Website builder, WordPress, custom code | Build cannot start; Sep 11 deadline at risk |
| Access mechanism (DEC-02) | Blocked on DEC-01 + privacy basis | Not yet determinable | M365 SSO, platform login, email-list gating | Access design delays build |
| Budget/hosting/domain (DEC-05) | Blocked on action 1 | Confirm after comparison | None defined | Cost risk unquantified |
| Date flexibility (DEC-07) | Needs confirmation | Hard date assumed until answered | Flexible date | Timeline risk stays unquantified |
| Maintenance owner (DEC-06) | Needs confirmation | IT team likely; confirm | External support | Post-launch support gap |
| Video hosting (DEC-03) | Conditionally ready | Keep YouTube for launch | Host on new platform | Low; reversible |
| Content transition (DEC-04) | Not yet due | Defer | Schedule migration | Low now |
| SharePoint decommission (DEC-08) | Not yet due | Consider read-only archive at go-live | Full decommission | Low now |

## Conditions and Blockers

| Item | Type | Resolution | Owner |
|---|---|---|---|
| AI-acceleration assumption unproven | Assumption | Small spike before committing to custom code | Requester |
| No platform comparison exists | Evidence gap | Action 1 | Requester |
| Privacy rules for participant emails unconfirmed | Evidence gap | Action 4; ASR-01 records the basis | Requester |
| Sep 11 date flexibility unknown | Evidence gap | Action 3 | Requester |
| Maintenance owner unassigned | Authority gap | Action 6 | Requester |
| No build plan or milestones | Control gap | After DEC-01: short build plan before Sep 11 | Requester + team |

## Later

| Item | Trigger for Reconsideration |
|---|---|
| Content migration (DEC-04) | After Sep 11 go-live |
| Video hosting relocation (DEC-03 revisit) | Post-launch; if storage or analytics needs grow |
| SharePoint decommission vs archive (DEC-08) | After successful go-live |
| Next actions re-run | Actions 1-4 complete, DEC-01 decided, or 1 week without progress |

## Gate Status

- **Quality gate:** Passed — 31/32 (96.9%), no blocking failures, critical dimensions 4/4 (see `stages/05-measure/audit-findings.md`).
- **Governance gate:** Not passed — decision maker (requester; IT Director; LeadLab Director final OK) has not responded. Needed: review of the recommendations and decision on DEC-01.
- **ASR monitor:** ASR-01 already referred upstream (HND-01) to `project-artifact-prescription`; expected return `artifact-support-handoff.md`; return feeds DEC-02.

## Terminal State

**Governance pending** — quality gate passed, no decision maker response yet.
