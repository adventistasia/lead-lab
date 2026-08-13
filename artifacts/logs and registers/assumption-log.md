# LeadLab Portal Rebuild Assumption Log

Project: LeadLab Portal Rebuild
Change ID: leadlab-rebuild-2026-08-11

## Register

| ID | Assumption / Constraint | Type | Owner | Status | Validation / Evidence | Impact if False |
|----|------------------------|------|-------|--------|-----------------------|-----------------|
| AL-01 | AI-assisted development ("vibe coding") makes a custom build feasible within the ~1 month timeline | Assumption | Requester + IT team | Active | Unproven; flagged in request brief. Validate with a scoped build spike during platform evaluation | Schedule slip; Sep 11 launch at risk |
| AL-02 | No new features are needed; the current feature scope is correct for the rebuild | Assumption | Requester + IT team | Active | Stated in request brief (same feature scope). Reconfirm with LeadLab Director at approval | Scope change or rework after launch |
| AL-03 | Existing content can stay on SharePoint and YouTube until after launch | Assumption | Requester + IT team | Active | Stated in request brief (start fresh; transition later). Confirm which content must be live on Sep 11 | Missing content at launch |
| AL-04 | No formal budget is available; the IT Department covers baseline third-party costs. Server is available; only the domain (~$25/yr) is a confirmed third-party cost | Constraint | Requester + IT team | Validated | Stated in request brief. IT Department funding confirmed by Requester on 13-Aug-2026 (D-09). Optional-cost coverage remains unresolved (R-11) | Platform cost or domain not covered |
| AL-05 | Sep 11, 2026 readiness date is fixed | Constraint | Requester + IT team | Active | Deadline stated; date flexibility unknown (not discussed) | No fallback date for program readiness |
| AL-06 | Access must be restricted to LeadLab participants, not public | Constraint | Requester + IT team | Active | Stated in request brief. Mechanism undecided | Public exposure of participant content |
| AL-07 | Current Microsoft 365 SSO and Outlook-group access model can be replaced or replicated on the new platform | Assumption | Requester + IT team | Active | Inferred from current-state description. Validate when access mechanism is chosen | Rebuild of access tooling; privacy review needed |
| AL-08 | The team operates its own server; IT will configure it for WordPress hosting | Assumption | Requester + IT team | Active | Stated by Requester on 13-Aug-2026. Confirm provisioning plan and timeline with IT | Hosting cost or schedule slip; Sep 11 launch at risk |
| AL-09 | Free tiers for backups and uptime monitoring are sufficient for the portal | Assumption | Requester + IT team | Active | Stated by Requester on 13-Aug-2026 | Backup or monitoring gaps; paid upgrade would need IT Department confirmation |

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

Assumptions and constraints taken from the accepted request brief (`alson-project-intake/leadlab-rebuild/stages/01-build/output/request-brief.md`, Constraints and Assumptions; Risks and Open Questions). AL-04, AL-08, and AL-09 updated 13-Aug-2026 from conversation with the Requester.
