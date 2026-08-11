# LeadLab Portal Rebuild Risk Register

Project: LeadLab Portal Rebuild
Change ID: leadlab-rebuild-2026-08-11

## Rating Scale

| Rating | Probability | Impact |
|--------|------------|--------|
| 1 - Very Low | < 10% | Minimal disruption |
| 2 - Low | 10-30% | Minor delay or rework |
| 3 - Medium | 30-50% | Moderate delay or partial loss of capability |
| 4 - High | 50-70% | Major delay or significant capability loss |
| 5 - Very High | > 70% | Project failure or unrecoverable data loss |

## Register

| ID | Risk | Owner | Status | P x I | Trigger | Response |
|----|------|-------|--------|-------|---------|----------|
| R-01 | Timeline slip: ~1 month to design, build, and test; AI-acceleration assumption unproven | Requester + IT team | Open | 12 | Platform decision delayed; build overruns; no test time left | Decide platform early; validate AI-acceleration assumption with a scoped build spike; fix a fallback date for review |
| R-02 | Platform choice undecided, blocking all build work | Requester + IT team | Open | 12 | No shortlist by mid-Aug 2026; build cannot start | Shortlist 2-3 platforms against timeline and restricted-access needs; decide before build starts |
| R-03 | Access design undecided; participants must not get public access | Requester + IT team | Open | 9 | Public access possible if gating not implemented | Decide access mechanism (SSO, login, email-list gating) before build; test restricted access explicitly |
| R-04 | Participant email data handling unclear; privacy rules not confirmed | Requester + IT team | Open | 9 | Email addresses collected or stored on new platform without privacy confirmation | Confirm data-handling and privacy rules before collecting any participant data |
| R-05 | Ongoing ownership after Sep 11 launch unassigned | Requester + IT team | Open | 6 | Portal live with no assigned maintainer | Confirm owner and maintenance responsibility before launch |
| R-06 | Content transition deferred; existing videos and materials stay in place | Requester + IT team | Open | 4 | New portal goes live without needed content | Confirm which content must be live on Sep 11; plan transition after launch |
| R-07 | YouTube hosting dependency undecided for the new platform | Requester + IT team | Open | 4 | Platform chosen that cannot embed or host videos | Confirm video hosting approach during platform selection |

## Status

| Status | Meaning |
|--------|---------|
| Open | Active risk to monitor |
| Occurred | Risk event happened (move to Issue Log) |
| Closed | No longer relevant or mitigated |

## Summary

| Metric | Count |
|--------|-------|
| High exposure (P x I >= 12) | 2 |
| Medium exposure (P x I 6-11) | 3 |
| Low exposure (P x I 1-5) | 2 |
| **Total identified risks** | **7** |

## Source

Initial ratings and responses derived from the accepted request brief (`alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md`, Risks and Open Questions). Ratings are starting estimates, not measured values.
