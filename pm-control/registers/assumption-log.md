# Lead Lab (lead-lab) Assumption Log

Project: Lead Lab (lead-lab)

## Register

| ID | Assumption or constraint | Type | Owner | Status | Risk if false | Validation evidence | Validation due | Related IDs | Source | Verified |
|---|---|---|---|---|---|---|---|---|---|---|
| AL-01 | AI-assisted development ("vibe coding") makes a custom build feasible within the ~1 month timeline | Assumption | Requester + IT team | Active | Schedule slip; Sep 11 launch at risk | Unproven; flagged in request brief. Validate with a scoped build spike during platform evaluation | | R-01, ISS-03 | projects/lead-lab/artifacts/logs and registers/assumption-log.md | 2026-08-18 |
| AL-02 | No new features are needed; the current feature scope is correct for the rebuild | Assumption | Requester + IT team | Active | Scope change or rework after launch | Stated in request brief (same feature scope). Reconfirm with LeadLab Director at approval | | D-08, DEP-07 | projects/lead-lab/artifacts/logs and registers/assumption-log.md | 2026-08-18 |
| AL-03 | Existing content can stay on SharePoint and YouTube until after launch | Assumption | Requester + IT team | Active | Missing content at launch | Stated in request brief (start fresh; transition later). Confirm which content must be live on Sep 11 | | D-07, R-06, ISS-07 | projects/lead-lab/artifacts/logs and registers/assumption-log.md | 2026-08-18 |
| AL-04 | No formal budget is available; IT Department covers baseline third-party costs. Server is available; only the domain (~$25/yr) is a confirmed third-party cost | Constraint | Requester + IT team | Validated | Platform cost or domain not covered | Stated in request brief. IT Department funding confirmed by Requester on 13-Aug-2026 (D-09). Optional-cost coverage remains unresolved (R-11) | | D-09, R-11, DEP-08 | projects/lead-lab/artifacts/logs and registers/assumption-log.md | 2026-08-18 |
| AL-05 | Sep 11, 2026 readiness date is fixed | Constraint | Requester + IT team | Validated | No fallback date for program readiness | Deadline stated; confirmed by PM 18-Aug-2026 (D-06 Made): not flexible | | D-06, ISS-03 | projects/lead-lab/artifacts/logs and registers/assumption-log.md; PM confirmation 2026-08-18 | 2026-08-18 |
| AL-06 | Access must be restricted to LeadLab participants, not public | Constraint | Requester + IT team | Active | Public exposure of participant content | Stated in request brief. Mechanism undecided | | D-02, R-03, ISS-02 | projects/lead-lab/artifacts/logs and registers/assumption-log.md | 2026-08-18 |
| AL-07 | Current Microsoft 365 SSO and Outlook-group access model can be replaced or replicated on the new platform | Assumption | Requester + IT team | Validated | Rebuild of access tooling; privacy review needed | Inferred from current-state description. Validated 18-Aug-2026: approved-email/password access confirmed (D-02 Made) replaces the SSO/Outlook-group model | | D-02 | projects/lead-lab/artifacts/logs and registers/assumption-log.md; PM confirmation 2026-08-18 | 2026-08-18 |
| AL-08 | The team operates its own server; IT will configure it for WordPress hosting | Assumption | Requester + IT team | Active | Hosting cost or schedule slip; Sep 11 launch at risk | Stated by Requester on 13-Aug-2026. Staging availability confirmed by PM 18-Aug-2026 (D-05); production provisioning plan, DNS, SSL, backups, and uptime responsibility still to be confirmed with IT | | D-05, DEP-05 | projects/lead-lab/artifacts/logs and registers/assumption-log.md; PM confirmation 2026-08-18 | 2026-08-18 |
| AL-09 | Free tiers for backups and uptime monitoring are sufficient for the portal | Assumption | Requester + IT team | Active | Backup or monitoring gaps; paid upgrade would need IT Department confirmation | Stated by Requester on 13-Aug-2026 | | R-09, R-10 | projects/lead-lab/artifacts/logs and registers/assumption-log.md | 2026-08-18 |
| AL-10 | Video recordings and downloadable materials must not be shared with, or distributed to, non-registered participants | Constraint | Requester + IT team | Active | Exposure of participant content; breaches client rule | Client-stated 18-Aug-2026. Confirm enforcement at build (download controls, watermarks or stated policy) | | D-02, R-03, R-04, ISS-02 | Client response to PM questions, 18-Aug-2026 (conversation; no written record yet) | 2026-08-18 |

## Type

| Type | Meaning |
|---|---|
| Assumption | Accepted as true without proof |
| Constraint | Externally imposed limitation |

## Status

| Status | Meaning |
|---|---|
| Proposed | Captured by the agent; not yet accepted by the PM |
| Active | Not yet validated |
| At Risk | Unlikely to be validated in time; escalation may be needed |
| Validated | Confirmed true |
| Invalidated | Proven false and handled |
| Superseded | Replaced by a new assumption |
| Closed | Validation outcome handled and record archived |

## Derived Summary

Generated from the register rows. Do not manually maintain these counts.

| Metric | Count |
|---|---|
| Active assumptions | 7 |
| Validated | 3 |
| Invalidated | 0 |
| Overdue validation | 0 (no validation due dates set) |