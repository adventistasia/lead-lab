# LeadLab Portal Rebuild Decision Log

Project: LeadLab Portal Rebuild
Change ID: leadlab-rebuild-2026-08-11

| ID | Decision / Question | Owner | Status | Due / Decided | Outcome | Rationale | Reference |
|----|-------------------|-------|--------|--------------|---------|-----------|-----------|
| D-01 | Which platform replaces SharePoint? (website builder, WordPress, custom code) | Requester + IT team; final OK from LeadLab Director | Decided | 13-Aug-2026 | Self-hosted WordPress (O-03) on the team's own server | Best balance of timeline fit, feature scope, customization, restricted access, and cost; subject to D-05 (server/domain) and D-02 (access) confirmations | platform-selection-decision.md, Recommendation |
| D-02 | How do participants get restricted access? (SSO, login, email-list gating) | Requester + IT team | Open | Before build start | Not decided; access options emailed to stakeholders 13-Aug-2026; response pending | Affects build effort and participant email data handling | request brief, Risks and Open Questions |
| D-03 | Who maintains WordPress and the server after the Sep 11 launch? | Requester + IT team | Open | Before launch | Not decided | No owner assigned for ongoing WordPress and server support | request brief, Risks and Open Questions |
| D-04 | Keep YouTube for video hosting or host on the new platform? | Requester + IT team | Open | During platform selection | Not decided | Affects platform choice and storage | request brief, Risks and Open Questions |
| D-05 | Is the team's server ready for WordPress, and is a domain name available? | Requester + IT team | Open | During platform selection | Not decided | IT will configure the server; confirm DNS, SSL, backups, and uptime responsibility | request brief, Constraints and Assumptions |
| D-06 | Is the Sep 11 readiness date flexible? | Requester + IT team; LeadLab Director | Open | Unknown | Not discussed | Program runs Sep 11-14, 2026; date flexibility not discussed | request brief, Timing and Priority |
| D-07 | Content migration plan after launch | Requester + IT team | Open | After Sep 11 launch | Deferred; start fresh | Existing content stays in place for now; transition later | request brief, What is included or not |
| D-08 | Rebuild scope: same features, no new features | Requester + IT team; LeadLab Director | Open | Before build start | Agreed in principle | Stated in request brief; not yet formally approved by LeadLab Director | request brief, What is included or not |
| D-09 | Who shoulders the third-party costs (domain and any extras)? | IT Department (confirmed by Requester) | Decided | 13-Aug-2026 | IT Department covers baseline third-party costs (domain up to $25/yr); client approval not required | Optional costs (SSO, plugins, email, taxes, unexpected server/network) remain TBD | platform-selection-decision.md, Cost Baseline and Funding Responsibility |

## Source

Open decisions and stated positions from the accepted request brief (`alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md`). D-09 outcome recorded 13-Aug-2026 from conversation with the Requester.

## Changes

- 13-Aug-2026: D-01 decided: self-hosted WordPress (O-03) on the team's own server. Remaining confirmations: D-05 (server/domain) and D-02 (access approach).
- 13-Aug-2026: WordPress will run on the team's own server, not managed hosting. IT will configure the server (D-03, D-05 updated; risk register R-08 to R-10 added).
- 13-Aug-2026: Cost baseline recorded: known third-party cost is up to `$25`/year for the domain; WordPress, SSL, DNS, backups, and uptime monitoring at `$0` on free tiers. Funding gate D-09 added.
- 13-Aug-2026: Funding decision updated (D-09): the IT Department will shoulder the third-party costs. Client funding approval is no longer required.
- 13-Aug-2026: Access options emailed to all stakeholders; D-02 remains open pending response.
