# Lead Lab (lead-lab) Risk Register

Project: Lead Lab (lead-lab)

## Rating Scale

| Rating | Probability | Impact |
|---|---|---|
| 1 Very Low | < 10% | Minimal disruption |
| 2 Low | 10-30% | Minor delay or rework |
| 3 Medium | 30-50% | Moderate delay or partial capability loss |
| 4 High | 50-70% | Major delay or significant capability loss |
| 5 Very High | > 70% | Project failure or unrecoverable data loss |

## Register

| ID | Risk | Owner | Status | P x I | Trigger | Response | Related IDs | Source | Verified |
|---|---|---|---|---|---|---|---|---|---|
| R-01 | Timeline slip: ~1 month to design, build, and test; AI-acceleration assumption unproven | Requester + IT team | Open | 12 | Platform decision delayed; build overruns; no test time left | Decide platform early; validate AI-acceleration assumption with a scoped build spike; fix a fallback date for review | AL-01, ISS-03 | projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-02 | Platform choice undecided, blocking all build work | Requester + IT team | Closed | 12 | No shortlist by mid-Aug 2026; build cannot start | Shortlist 2-3 platforms; decide before build starts. Resolved 13-Aug-2026: self-hosted WordPress (O-03) decided (D-01) | D-01, ISS-01, DEP-01 | projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-03 | Access design undecided; participants must not get public access | Requester + IT team | Open | 9 | Public access possible if gating not implemented | Approved-email/password mechanism confirmed by PM 18-Aug-2026 (D-02 Made). Implement gating pre-build and test restricted access. Residual risk: password may be shared (AL-10, client-stated no-go). Status: keep Open until gating is implemented and tested; candidate for Mitigated after implementation | D-02, ISS-02, DEP-02, AL-10 | Client response to PM questions, 18-Aug-2026 (conversation; no written record yet); PM confirmation 2026-08-18; projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-04 | Participant email data handling unclear; privacy rules not confirmed | Requester + IT team | Open | 9 | Email addresses collected or stored on new platform without privacy confirmation | Approved-email approach confirmed by PM 18-Aug-2026 (D-02 Made); confirms participant emails will be stored. Confirm privacy and data-handling rules before collecting data. Content-sharing rule stated by client (AL-10) | D-02, ISS-04, AL-10 | Client response to PM questions, 18-Aug-2026 (conversation; no written record yet); PM confirmation 2026-08-18; projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-05 | Ongoing ownership after Sep 11 launch unassigned (WordPress + server) | Requester + IT team | Open | 6 | Portal live with no assigned maintainer | Confirm WordPress and server maintenance owner before launch; IT mentioned as possible interim owner (D-03, tentative, not assigned) | D-03, ISS-05 | projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-06 | Content transition deferred; existing videos and materials stay in place | Requester + IT team | Open | 4 | New portal goes live without needed content | Confirm which content must be live on Sep 11; plan transition after launch | D-07, ISS-07 | projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-07 | YouTube hosting dependency undecided for the new platform | Requester + IT team | Open | 4 | Platform chosen that cannot embed or host videos | Resolved 18-Aug-2026: keep YouTube for video hosting (D-04 Made). Candidate for Closed on PM review | D-04, ISS-06, DEP-04 | projects/lead-lab/artifacts/logs and registers/risk-register.md; PM confirmation 2026-08-18 | 2026-08-18 |
| R-08 | Server or WordPress security compromised (patches not applied) | IT team | Open | 12 | No update schedule; admin credentials shared | Set IT patch schedule; restrict admin access; apply WordPress and OS updates. Staging confirmed 18-Aug-2026 (D-05); production patch schedule still to be set | D-05, DEP-05 | projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-09 | Backups not configured; content loss on server failure | IT team | Open | 12 | Server fails with no backup | Configure automated backups before launch; test restore. Staging confirmed 18-Aug-2026 (D-05); production backup configuration still to be confirmed | D-05, DEP-05, AL-09 | projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-10 | Server availability not guaranteed; portal offline | IT team | Open | 9 | Server down; no monitoring or recovery plan | Monitor uptime; define recovery procedure; confirm outage communication. Staging confirmed 18-Aug-2026 (D-05); production uptime and monitoring responsibility still to be confirmed | D-05, DEP-05 | projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |
| R-11 | IT Department funding does not cover unexpected third-party costs (SSO, plugins, email, taxes, server/network) | IT Department | Open | TBD | Optional costs exceed IT funding scope (D-09) | Confirm IT cost authority before any purchase; escalate within IT; keep SharePoint as fallback if unresolved | D-09, AL-04 | projects/lead-lab/artifacts/logs and registers/risk-register.md | 2026-08-18 |

## Status

| Status | Meaning |
|---|---|
| Proposed | Captured by the agent; not yet accepted by the PM |
| Open | Active risk to monitor |
| Mitigated | Controls in place; residual risk accepted |
| Occurred | Risk event happened; move to the issue register |
| Closed | No longer relevant or fully mitigated |

## Derived Summary

Generated from the register rows. Do not manually maintain these counts.

| Metric | Count |
|---|---|
| High exposure (P x I 12-25) | 4 |
| Medium exposure (P x I 6-11) | 4 |
| Low exposure (P x I 1-5) | 2 |
| Total identified risks | 11 (10 scored, 1 unscored) |

Note: source register summary reports 3 high exposure (likely excluding closed R-02); this register counts 4. Discrepancy flagged for reconciliation.