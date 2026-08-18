# LeadLab Portal Rebuild Assumption Log

Project: LeadLab Portal Rebuild
Change ID: leadlab-rebuild-2026-08-11

## Register

| ID | Assumption / Constraint | Type | Owner | Status | Validation / Evidence | Impact if False |
|----|------------------------|------|-------|--------|-----------------------|-----------------|
| AL-01 | AI-assisted development ("vibe coding") makes a custom build feasible within the ~1 month timeline | Assumption | Requester + IT team | Active | WordPress is deployed in staging; validate feature fit and timeline through theme configuration and prototype testing | Schedule slip; Sep 11 launch at risk |
| AL-02 | No new features are needed; the current feature scope is correct for the rebuild | Assumption | Requester + IT team | Active | Stated in request brief (same feature scope). Reconfirm with LeadLab Director at approval | Scope change or rework after launch |
| AL-03 | Existing content can stay on SharePoint and YouTube until after launch | Assumption | Requester + IT team | Active | Stated in request brief (start fresh; transition later). Confirm which content must be live on Sep 11 | Missing content at launch |
| AL-04 | No formal budget is available; the IT Department covers baseline third-party costs. Server is available; only the domain (~$25/yr) is a confirmed third-party cost | Constraint | Requester + IT team | Validated | Stated in request brief. IT Department funding confirmed by Requester on 13-Aug-2026 (D-09). Optional-cost coverage remains unresolved (R-11) | Platform cost or domain not covered |
| AL-05 | Sep 11, 2026 readiness date is fixed | Constraint | Requester + IT team | Active | Deadline stated; date flexibility unknown (not discussed) | No fallback date for program readiness |
| AL-06 | Access must be restricted to LeadLab participants, not public | Constraint | Requester + IT team | Active | Native WordPress login selected 18-Aug-2026; restricted-access behavior still needs staging validation | Public exposure of participant content |
| AL-07 | Current Microsoft 365 SSO and Outlook-group access model can be replaced or replicated on the new platform | Assumption | Requester + IT team | Superseded | Native WordPress login selected 18-Aug-2026; SSO and Outlook-group replication are not required for the current prototype | Revisit only if D-02 reopens |
| AL-08 | The team operates its own server; IT will configure it for WordPress hosting | Assumption | Requester + IT team | Validated | WordPress is deployed on the team's server in staging, confirmed by the Requester on 18-Aug-2026 | Production setup or schedule may still slip |
| AL-09 | Free tiers for backups and uptime monitoring are sufficient for the portal | Assumption | Requester + IT team | Active | Production backup and uptime setup intentionally deferred; no validation evidence yet | Backup or monitoring gaps; paid upgrade would need IT Department confirmation |
| AL-10 | The embedded-video configuration can meet the requirement that authenticated members cannot copy or discover the video URL | Assumption | Requester + IT team | Active | Prototype test not yet run; define acceptable protection before prototype acceptance | Video URLs may be copied or accessed outside the portal |

## Type

| Type | Meaning |
|------|---------|
| Assumption | Accepted as true without proof |
| Constraint | Externally imposed limitation |

## Status

| Status | Meaning |
|--------|---------|
| Active | Not yet validated |
| Validated | Confirmed true |
| Invalidated | Proven false (handled) |
| Superseded | Replaced by new assumption |

## Source

Assumptions and constraints taken from the accepted request brief (`alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md`, Constraints and Assumptions; Risks and Open Questions). AL-01, AL-06, AL-07, AL-08, AL-09, and AL-10 were updated or added from the PM update on 18-Aug-2026. AL-04, AL-08, and AL-09 were previously updated 13-Aug-2026 from conversation with the Requester.
