# Decision Landscape

## Primary Decision

- Statement: Which platform should the LeadLab Portal be rebuilt on to replace SharePoint?
- Decision maker: Requester and IT team, with IT Director agreement; LeadLab Director gives final OK
- Deadline or trigger: Decision is needed within days; hard deadline is portal live before Sep 11, 2026 (program runs Sep 11-14, 2026)

## Identified Decisions

| ID | Decision | Type | Decision Maker | Deadline or Trigger | Status | Depends On | Precedes |
|----|----------|------|----------------|---------------------|--------|------------|----------|
| DEC-01 | Choose the rebuild platform (website builder vs WordPress vs custom code) | Solution | Requester + IT Director; final OK LeadLab Director | Within days; portal live before Sep 11, 2026 | Pending | None | DEC-02, DEC-03, DEC-05, DEC-08 |
| DEC-02 | Choose participant access mechanism (SSO, login, email-list gating) | Solution | Requester + IT Director; final OK LeadLab Director | Before build starts (after DEC-01) | Pending | DEC-01 | None |
| DEC-03 | Decide video hosting dependency (keep YouTube vs host on platform) | Solution | Requester | Before build completes (after DEC-01) | Pending | DEC-01 | DEC-04 |
| DEC-04 | Decide when/how to transition existing content (migration) | Transition or closure | Requester with stakeholders | After Sep 11 go-live | Existing (deferred) | DEC-01, DEC-03 | None |
| DEC-05 | Confirm budget, hosting, and domain availability for chosen platform | Investment | IT Director | Before DEC-01 finalization | Implied | DEC-01 | None |
| DEC-06 | Assign ongoing portal maintenance ownership | Governance | IT Director | Before go-live | Pending | None | None |
| DEC-07 | Confirm whether Sep 11, 2026 date is flexible | Authorization | LeadLab Director | Immediately; affects timeline risk | Pending | None | None |
| DEC-08 | Decommission SharePoint after rebuild | Transition or closure | Requester + IT Director | After successful go-live | Existing (triggered) | DEC-01 | None |

## Existing Decisions (Already Made)

| ID | Decision | Made By | Date or Trigger | Evidence Citation |
|----|----------|---------|-----------------|-------------------|
| DEC-09 | Rebuild the portal off SharePoint on a more customizable platform | Requester (accepted intake) | 2026-08-11 | request-brief.md, Summary |
| DEC-10 | Same feature scope as current portal; no new features | Requester | 2026-08-11 | request-brief.md, Request Details; evidence O-20 |
| DEC-11 | Start fresh; do not migrate existing content now | Requester | 2026-08-11 | request-brief.md, Request Details; run-manifest.md; evidence O-15 |
| DEC-12 | Access restricted to LeadLab participants, not public | Requester | 2026-08-11 | request-brief.md, Request Details; evidence O-9 |
| DEC-13 | Decommission SharePoint after rebuild | Requester | 2026-08-11 | request-brief.md, Request Details; run-manifest.md |

## Non-Decisions (Excluded)

| Item | Type | Reason for Exclusion |
|------|------|----------------------|
| Shortlist 2-3 platforms | Task | Execution step supporting DEC-01, not a decision itself |
| Build plan / design | Task | Deliverable work; requires DEC-01 first |
| Stress testing at expected volumes | Task | Operating practice from closure report, not a pending choice |
| Leverage advanced analytics / Stream | Recommendation | Out of scope (no new features); closure-report suggestion |
| Media team supplies YouTube links | Task | Operating workflow, already assigned |
| Email participants on publish | Task | Operating workflow detail, not a decision |
| Estimate build effort per platform | Task | Input to DEC-01, not a decision |

## Decision Relationships

| Decision A | Relationship | Decision B | Detail |
|------------|--------------|------------|--------|
| DEC-01 | Precedes | DEC-02 | Access options (SSO, email gating) depend on platform capabilities |
| DEC-01 | Precedes | DEC-03 | Video hosting cost/effort depends on platform storage and embedding |
| DEC-01 | Precedes | DEC-05 | Budget and hosting confirmation depends on chosen platform |
| DEC-01 | Precedes | DEC-08 | SharePoint decommission follows platform go-live |
| DEC-03 | Precedes | DEC-04 | Content transition approach depends on where videos live |
| DEC-02 | Depends on | DEC-01 | Access mechanism must fit the platform |
| DEC-03 | Depends on | DEC-01 | Platform determines hosting/embedding options |
| DEC-05 | Depends on | DEC-01 | Cost figures are platform-specific |
| DEC-08 | Depends on | DEC-01 | Cannot decommission until replacement is live |
| DEC-04 | Depends on | DEC-01, DEC-03 | Transition targets depend on platform and video location |
| DEC-06 | Conflicts with | none | Independent; can be decided in parallel with DEC-01 |
| DEC-07 | Conflicts with | none | Independent; informs timeline risk for DEC-01 |

No decision conflicts identified.
