# Lead Lab (lead-lab) Dependency Log

Project: Lead Lab (lead-lab)

## Register

| ID | Dependency | Owner | Priority | Status | Needed by | Impact if unmet | Action | Related IDs | Source | Verified |
|---|---|---|---|---|---|---|---|---|---|---|
| DEP-01 | Platform decision (D-01) | Requester + IT team | Critical | Met | Before build start (mid-Aug 2026) | All build work blocked | Decided 13-Aug-2026: self-hosted WordPress (O-03). Remaining confirmations: D-02 (access), D-05 (server/domain) | D-01, R-02, ISS-01 | projects/lead-lab/artifacts/logs and registers/dependencies-log.md | 2026-08-18 |
| DEP-02 | Access mechanism decision (D-02) | Requester + IT team | Critical | Open | Before build start | Build effort and participant email data handling unresolved | Client stated approved-email/password access 18-Aug-2026 (D-02 Proposed); confirm with PM and IT, then build gating | D-02, R-03, ISS-02, AL-10 | Client response to PM questions, 18-Aug-2026 (conversation; no written record yet); projects/lead-lab/artifacts/logs and registers/dependencies-log.md | 2026-08-18 |
| DEP-03 | Media team supplies session video links | Media team | High | Open | Before content population for Sep 11 | Portal missing session content at launch | Confirm link supply timing with media team | R-06, ISS-07 | projects/lead-lab/artifacts/logs and registers/dependencies-log.md | 2026-08-18 |
| DEP-04 | Existing YouTube videos stay in place | Existing platform (YouTube) | Low | Met | Ongoing | Videos unavailable during transition | None; current state, unchanged | D-04, R-07, ISS-06 | projects/lead-lab/artifacts/logs and registers/dependencies-log.md | 2026-08-18 |
| DEP-05 | Domain name availability and server readiness for WordPress | Requester + IT team | Critical | Open | During platform selection | Hosting choice constrained; build work blocked | IT will configure the server; confirm DNS, SSL, backups, and uptime responsibility | D-05, R-08, R-09, R-10, AL-08 | projects/lead-lab/artifacts/logs and registers/dependencies-log.md | 2026-08-18 |
| DEP-06 | IT Director agreement to proceed | IT Director | High | Met | Project start | Team work not sanctioned | None; stated as agreed in request brief | D-01 | projects/lead-lab/artifacts/logs and registers/dependencies-log.md | 2026-08-18 |
| DEP-07 | LeadLab Director final OK | LeadLab Director | High | Open | Before launch (before Sep 11, 2026) | Portal cannot be accepted as done | Present portal for final approval before launch | D-08 | projects/lead-lab/artifacts/logs and registers/dependencies-log.md | 2026-08-18 |
| DEP-08 | IT Department funding commitment for third-party costs (D-09) | IT Department | High | Met | Before domain purchase and build start | Third-party costs not covered | Baseline costs covered; no further action. Confirm IT coverage if optional costs (SSO, plugins, email) are selected | D-09, R-11, AL-04 | projects/lead-lab/artifacts/logs and registers/dependencies-log.md | 2026-08-18 |

## Priority

| Priority | Definition |
|---|---|
| Critical | Unmet dependency blocks delivery |
| High | Unmet dependency threatens a milestone |
| Medium | Unmet dependency causes rework or delay |
| Low | Unmet dependency causes minor friction |

## Status

| Status | Meaning |
|---|---|
| Proposed | Captured by the agent; not yet accepted by the PM |
| Open | Condition not yet satisfied; active monitoring required |
| At Risk | Likely to be unmet or delayed; escalation may be needed |
| Met | Condition satisfied; no further action needed |
| Closed | No longer relevant or dependency removed |

## Derived Summary

Generated from the register rows. Do not manually maintain these counts.

| Metric | Count |
|---|---|
| Critical or at risk | 3 |
| Open | 4 |
| Met | 4 |
| Total dependencies | 8 |

Note: priority values are agent assessments from the stated impact in the source log; the source does not assign priorities.