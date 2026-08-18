# Lead Lab (lead-lab) Decision Log

Project: Lead Lab (lead-lab)

## Register

| ID | Decision or question | Owner | Status | Needed by | Decided | Outcome | Rationale | Related IDs | Source | Verified |
|---|---|---|---|---|---|---|---|---|---|---|
| D-01 | Which platform replaces SharePoint? (website builder, WordPress, custom code) | Requester + IT team; final OK from LeadLab Director | Made | 13-Aug-2026 | 13-Aug-2026 | Self-hosted WordPress (O-03) on the team's own server | Best balance of timeline fit, feature scope, customization, restricted access, and cost; subject to D-05 (server/domain) and D-02 (access) confirmations | R-02, ISS-01, DEP-01, DEP-06 | projects/lead-lab/artifacts/logs and registers/decision-log.md | 2026-08-18 |
| D-02 | How do participants get restricted access? (SSO, login, email-list gating) | Requester + IT team | Made | Before build start | 2026-08-18 | Approved email or password: only approved people, or people with the password, can enter. Password can still be shared | Client-stated 18-Aug-2026; confirmed by PM 18-Aug-2026. Implies an approved-email list and/or shared-password gate; password reuse is a residual risk (R-03) | R-03, R-04, ISS-02, DEP-02, AL-10 | Client response to PM questions, 18-Aug-2026 (conversation; no written record yet); PM confirmation 2026-08-18 | 2026-08-18 |
| D-03 | Who maintains WordPress and the server after the Sep 11 launch? | Requester + IT team | Pending | Before launch | | Not decided; IT mentioned as possible interim owner (tentative, not assigned) | No owner assigned for ongoing WordPress and server support; IT as interim owner is a possibility, not a commitment | R-05, ISS-05 | projects/lead-lab/artifacts/logs and registers/decision-log.md | 2026-08-18 |
| D-04 | Keep YouTube for video hosting or host on the new platform? | Requester + IT team | Made | During platform selection | 2026-08-18 | Keep YouTube for video hosting | Confirmed by PM 18-Aug-2026; YouTube remains the video hosting platform | R-07, ISS-06, DEP-04 | projects/lead-lab/artifacts/logs and registers/decision-log.md; PM confirmation 2026-08-18 | 2026-08-18 |
| D-05 | Is the team's server ready for WordPress, and is a domain name available? | Requester + IT team | Pending | During platform selection | | Not fully decided; staging confirmed available by PM 18-Aug-2026 | IT will configure the server; staging confirmed. Production DNS, SSL, backups, and uptime responsibility still unconfirmed | R-08, R-09, R-10, DEP-05, AL-08 | projects/lead-lab/artifacts/logs and registers/decision-log.md; PM confirmation 2026-08-18 | 2026-08-18 |
| D-06 | Is the Sep 11 readiness date flexible? | Requester + IT team; LeadLab Director | Made | Unknown | 2026-08-18 | Sep 11, 2026 readiness date is fixed; not flexible | Confirmed by PM 18-Aug-2026; program runs Sep 11-14, 2026 | AL-05, ISS-03 | projects/lead-lab/artifacts/logs and registers/decision-log.md; PM confirmation 2026-08-18 | 2026-08-18 |
| D-07 | Content migration plan after launch | Requester + IT team | Pending | After Sep 11 launch | | Deferred; start fresh | Existing content stays in place for now; transition later | R-06, ISS-07, AL-03 | projects/lead-lab/artifacts/logs and registers/decision-log.md | 2026-08-18 |
| D-08 | Rebuild scope: same features, no new features | Requester + IT team; LeadLab Director | Made | Before build start | 2026-08-18 | Same feature scope, no new features | Stated in request brief; confirmed by PM 18-Aug-2026. LeadLab Director final OK still required before launch (DEP-07) | AL-02, DEP-07 | projects/lead-lab/artifacts/logs and registers/decision-log.md; PM confirmation 2026-08-18 | 2026-08-18 |
| D-09 | Who shoulders the third-party costs (domain and any extras)? | IT Department (confirmed by Requester) | Made | 13-Aug-2026 | 13-Aug-2026 | IT Department covers baseline third-party costs (domain up to $25/yr); client approval not required | Optional costs (SSO, plugins, email, taxes, unexpected server/network) remain TBD | R-11, AL-04, DEP-08 | projects/lead-lab/artifacts/logs and registers/decision-log.md | 2026-08-18 |
| D-10 | Is the DEV-01 Prototype Build Brief accepted as the build input? | Requester + IT team; final OK from LeadLab Director | Made | Before build start | 2026-08-18 | Accepted as the build input; promote Draft v0.1 to Accepted v1.0 | The brief passed all 10 acceptance criteria and the 100% quality audit; it defines AC-01 to AC-12 for the staging build | DEP-07, AL-01, R-01, ACT-03 | projects/lead-lab/prototype-build-brief/2026-08-18-approval-cycle/stages/03-learn/what-now.md; PM confirmation 2026-08-18 (conversation) | 2026-08-18 |

## Status

| Status | Meaning |
|---|---|
| Proposed | Captured by the agent; not yet confirmed by the PM |
| Pending | PM has accepted the question; decision not yet made |
| Made | Outcome recorded with rationale and date |
| Superseded | Replaced by a newer decision |

## Derived Summary

Generated from the register rows. Do not manually maintain these counts.

| Metric | Count |
|---|---|
| Pending | 3 |
| Proposed | 0 |
| Due within 5 days | 0 (due dates not configured) |
| Overdue | 0 |
| Total decisions | 10 |
