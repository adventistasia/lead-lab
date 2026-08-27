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
| R-01 | Timeline slip: ~1 month to design, build, and test; AI-acceleration assumption unproven | Requester + IT team | Open | 12 | Theme or prototype work overruns; no test time left | WordPress staging is deployed; configure the theme and run the scoped prototype to validate feature fit and timeline; escalate if the prototype slips |
| R-02 | Platform choice undecided, blocking all build work | Requester + IT team | Closed | 12 | No shortlist by mid-Aug 2026; build cannot start | Shortlist 2-3 platforms against timeline and restricted-access needs; decide before build starts. Resolved 13-Aug-2026: self-hosted WordPress (O-03) decided (D-01) |
| R-03 | Native WordPress login selected; credential sharing or a weak gate could still expose participant content | Requester + IT team | Open | 9 | Unauthenticated or unapproved visitors can reach content | Use native WordPress login; test unauthenticated and unapproved access explicitly in staging |
| R-04 | Participant email data handling unclear; privacy rules not confirmed | Requester + IT team | Open | 9 | Email addresses collected or stored on new platform without privacy confirmation | Confirm data-handling and privacy rules before collecting any participant data |
| R-05 | Ongoing WordPress and server operating procedures are not yet defined | IT team | Open | 6 | Portal live without a patch, backup, uptime, or incident procedure | IT team is assigned as owner; define patch, backup, uptime, and incident procedures before launch |
| R-06 | Content transition deferred; existing videos and materials stay in place | Requester + IT team | Open | 4 | New portal goes live without needed content | Confirm which content must be live on Sep 11; plan transition after launch |
| R-07 | YouTube hosting dependency undecided for the new platform | Requester + IT team | Open | 4 | Platform chosen that cannot embed or host videos | Confirm video hosting approach during platform selection |
| R-08 | Server or WordPress security compromised (patches not applied) | IT team | Open | 12 | No update schedule; admin credentials shared | Set IT patch schedule; restrict admin access; apply WordPress and OS updates |
| R-09 | Backups not configured; content loss on server failure | IT team | Open | 12 | Server fails with no backup | Configure automated backups before launch; test restore |
| R-10 | Server availability not guaranteed; portal offline | IT team | Open | 9 | Server down; no monitoring or recovery plan | Monitor uptime; define recovery procedure; confirm outage communication |
| R-11 | IT Department funding does not cover unexpected third-party costs (SSO, plugins, email, taxes, server/network) | IT Department | Open | TBD | Optional costs exceed IT funding scope (D-09) | Confirm IT cost authority before any purchase; escalate within IT; keep SharePoint as fallback if unresolved |
| R-12 | Authenticated members may copy or discover the URL of an embedded video | IT team | Open | TBD | A member can inspect, copy, or access the embedded video URL outside the portal | Test the embedded-video configuration in the prototype; define acceptable protection and do not claim absolute prevention without evidence |

## Status

| Status | Meaning |
|--------|---------|
| Open | Active risk to monitor |
| Occurred | Risk event happened (move to Issue Log) |
| Closed | No longer relevant or mitigated |

## Summary

| Metric | Count |
|--------|-------|
| High exposure (P x I >= 12) | 3 |
| Medium exposure (P x I 6-11) | 4 |
| Low exposure (P x I 1-5) | 2 |
| Unscored (P x I pending evidence) | 2 |
| **Total identified risks** | **11** |

## Source

Initial ratings and responses derived from the accepted request brief (`alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md`, Risks and Open Questions). R-01, R-03, R-05, and R-12 were updated or added from the PM update on 18-Aug-2026. Ratings are starting estimates, not measured values.
