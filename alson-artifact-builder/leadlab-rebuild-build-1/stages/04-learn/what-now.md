# What Now?

## Current Position

**Outcome:** Content pending (template gate passed 100%; content readiness 4.6/13 — all 10 shells built as deferred)
**Quality gate:** Passed (template gate; content gate pending by design)
**Recommended next move:** Resolve TBD-001 (DEC-01 platform) — it unlocks the activation of every shell and the ASR-01 record content.
**Confidence:** High

Basis: 10/10 prescription Create-later items built as structurally complete deferred shells; 16 controlled TBDs with owners and triggers; the only blocking information is the DEC-01 platform decision, which is an upstream decision-readiness item.

## Do Next

| # | Action | Why Now | Owner | Effort | Evidence | Target Stage |
|---|---|---|---|---|---|---|
| 1 | Complete ACT-01 comparison + ACT-02 spike | DEC-01 is the single blocking input (TBD-001) | Requester + IT Director | Medium | next-actions ACT-01/02 | decision readiness |
| 2 | Decide DEC-01 | Unblocks activation of PM-31, DEV-03, DEV-06, DEV-07, DEV-08, DEV-10; milestones | Requester + IT Director | Small | ACT-01/02 results | decision readiness |
| 3 | Confirm privacy basis (ACT-04 / NEED-03) | TBD-003 feeds DEV-06/DEV-07 email content | IT Director | Small | decision readiness NEED-03 | decision readiness |
| 4 | Decide DEC-02 access mechanism | TBD-002 completes DEV-07 access record (ASR-01) | Requester + IT Director | Small | DEC-01 + NEED-03 | decision readiness |
| 5 | Next build cycle: populate activated shells | Replace TBDs with facts as decisions land | Builder | Small | DEC-01/DEC-02 outcomes | project-artifact-builder |

## Decisions Needed

| Decision | Readiness | Recommendation | Alternatives | Impact of Delay |
|---|---|---|---|---|
| DEC-01 platform choice | Blocked | Decide after ACT-01/ACT-02 | Website builder / WordPress / custom code | Blocks all shell activation and the Sep 11 build window |
| DEC-02 access mechanism | Blocked | Decide after DEC-01 + NEED-03 | SSO / login / email-list gating | Blocks ASR-01 record content and access build (BL-09) |
| NEED-03 email privacy basis | Needs confirmation | Confirm with IT Director | Record consent basis | DEV-06/DEV-07 content incomplete |
| DEC-06 maintenance owner | Needs confirmation | IT Director names owner | IT team / external | BA-34 readiness item; BL-14 |

## Conditions and Blockers

| Item | Type | Resolution | Owner |
|---|---|---|---|
| TBD-001 DEC-01 undecided | Blocker (activation) | ACT-01 comparison + ACT-02 spike → decision | Requester + IT Director |
| TBD-003 NEED-03 unconfirmed | Blocker (content) | ACT-04 confirmation | IT Director |
| TBD-002 DEC-02 undecided | Blocker (ASR-01 content) | DEC-01 then DEC-02 | Requester + IT Director |
| TBD-005..TBD-015 | Content gaps | Resolution triggers documented per TBD | As per backlog |

## Later

| Item | Trigger for Reconsideration |
|---|---|
| DEV-10 shell activation | DEC-01 selects custom code (else Not needed) |
| BA-34 readiness | Build complete, before Sep 11 launch |
| BA-15 transition plan | Successful go-live (DEC-04) |
| PM-11 closure report | Project close after transition |
| ASR-01 closure (NEED-05) | DEV-07 access record created and acceptance test passed → decision readiness reassesses DEC-02 |
