# LeadLab Portal Rebuild Dependency Log

Project: LeadLab Portal Rebuild
Change ID: leadlab-rebuild-2026-08-11

## Register

| ID | Dependency | Owner | Status | Needed By | Impact if Unmet | Action |
|----|------------|-------|--------|-----------|-----------------|--------|
| DEP-01 | Platform decision (D-01) | Requester + IT team | Met | Before build start (mid-Aug 2026) | All build work blocked | Decided 13-Aug-2026: self-hosted WordPress (O-03). Remaining confirmations: D-02 (access), D-05 (server/domain) |
| DEP-02 | Access mechanism decision (D-02) | Requester + IT team | Open | Before build start | Build effort and participant email data handling unresolved | Decide SSO, login, or email-list gating |
| DEP-03 | Media team supplies session video links | Media team | Open | Before content population for Sep 11 | Portal missing session content at launch | Confirm link supply timing with media team |
| DEP-04 | Existing YouTube videos stay in place | Existing platform (YouTube) | Met | Ongoing | Videos unavailable during transition | None; current state, unchanged |
| DEP-05 | Domain name availability | Requester + IT team | Open | During platform selection | Hosting choice constrained | Confirm whether a domain name is available |
| DEP-06 | IT Director agreement to proceed | IT Director | Met | Project start | Team work not sanctioned | None; stated as agreed in request brief |
| DEP-07 | LeadLab Director final OK | LeadLab Director | Open | Before launch (before Sep 11, 2026) | Portal cannot be accepted as done | Present portal for final approval before launch |
| DEP-08 | IT Department funding commitment for third-party costs (D-09) | IT Department | Met | Before domain purchase and build start | Third-party costs not covered | Baseline costs covered; no further action. Confirm IT coverage if optional costs (SSO, plugins, email) are selected |

## Status

| Status | Meaning |
|--------|---------|
| Met | Condition satisfied. No further action needed. |
| Open | Condition not yet satisfied. Active monitoring required. |
| At Risk | Likely to be unmet or delayed. Escalation may be needed. |
| Closed | No longer relevant or dependency removed. |

## Source

Dependencies derived from the accepted request brief (`alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md`): people, timing, and current-state facts. DEP-01 updated 13-Aug-2026 (D-01 decided: self-hosted WordPress). DEP-08 updated 13-Aug-2026 from conversation with the Requester.
