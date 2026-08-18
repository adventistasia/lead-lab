# What Now?

## Current Position

**Outcome:** Conditionally ready
**Quality gate:** Passed (100%)
**Recommended next move:** Approve the DEV-01 brief as the build input, then start the scoped build spike on staging to validate the WordPress timeline (AL-01, R-01).
**Confidence:** High

Basis: All 10 acceptance criteria pass; quality 130/130 (100%). The brief reflects current project state (D-01 WordPress, D-02 approved email/password, D-04 YouTube kept, staging confirmed). It remains conditionally ready because it is a Draft pending owner approval, and TBD-01 to TBD-06 must be resolved before production content load.

## Do Next

| # | Action | Why Now | Owner | Effort | Evidence | Target Stage |
|---|---|---|---|---|---|---|
| 1 | Review and approve the brief (Draft → Accepted, v0.1 → v1.0) | Build start requires an agreed delivery definition | Requester + IT team | XS | AC-01 to AC-12; audit 100% | Build |
| 2 | Start the scoped build spike on staging: install WordPress, access gate (approved email/password), YouTube embed, category/date filter, search, downloads, responsive theme | Validates the timeline assumption that gated platform selection (AL-01, R-01); staging is available (D-05) | IT team | M | D-01, D-02, D-05; AC-01 to AC-12 | Build |
| 3 | Resolve TBD-02 (portal URL), TBD-04 (categories), TBD-05 (material file types) with the media team | Blocks finalizing content structure and the production domain | Requester + IT team | S | Data Requirements table | Build |
| 4 | Resolve TBD-01 (participant count) and TBD-03 (email handling rules) | Access gate and privacy compliance (R-04, BL-15) | Requester + IT team | S | Data Requirements table; R-04 | Build |
| 5 | Feed the accepted brief into the next DEV artifacts (DEV-03 architecture, DEV-06 security, DEV-08 test plan) | Prescription plan 18-Aug-2026 sequences them after DEV-01 | IT team | S | Prescription register; audit finding 3 | Build |

## Decisions Needed

| Decision | Readiness | Recommendation | Alternatives | Impact of Delay |
|---|---|---|---|---|
| Approve brief as build input (DEP-07 pre-step) | Ready | Accept as drafted; TBDs resolve during the build, not before | Revise brief first | Build start slips; Sep 11 deadline at risk (R-01) |
| D-05 production readiness (DNS, SSL, backups, uptime responsibility) | Pending | Confirm with IT before production load; staging is enough for the spike | Defer to post-spike | Production launch slips; R-08 to R-10 |
| D-03 maintenance owner after launch | Pending | Assign IT as interim owner before launch | Defer | Portal live with no maintainer (R-05) |

## Conditions and Blockers

| Item | Type | Resolution | Owner |
|---|---|---|---|
| Brief is Draft, not Accepted | Process gate | Owner review and approval (Do Next #1) | Requester + IT team |
| TBD-01 to TBD-06 unresolved | Evidence gap | Resolve during spike and content load (Do Next #3, #4) | Requester + IT team |
| Production server/domain unconfirmed (D-05) | Dependency | Confirm before production deployment | IT team |
| Maintenance owner unassigned (D-03) | Decision | Assign before launch | Requester + IT team |
| LeadLab Director final OK (DEP-07) | Gate | Obtain before launch (BL-12) | Requester |

## Later

| Item | Trigger for Reconsideration |
|---|---|
| Mark brief Accepted after independent builder review | Builder starts the spike and confirms the brief is sufficient |
| Re-audit brief (acceptance criteria + rubric) | If the spike changes scope, behavior, or acceptance scenarios |
| Content migration and SharePoint decommission (D-07, BL-17, BL-18) | After Sep 11 program |
