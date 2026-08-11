# Decision Readiness Register

## Summary

| Readiness State | Count |
|-----------------|-------|
| Ready | 0 |
| Conditionally ready | 1 |
| Blocked | 3 |
| Not yet due | 2 |
| Needs confirmation | 2 |
| Superseded | 0 |
| **Total** | **8** |

## Decision Assessments

### DEC-01: Choose the rebuild platform (website builder vs WordPress vs custom code)

| Field | Detail |
|-------|--------|
| Decision maker | Requester + IT Director; final OK LeadLab Director |
| Deadline or trigger | Within days; portal live before Sep 11, 2026 |
| Options | Website builder; WordPress; custom code; (stay on SharePoint not under consideration) |
| Recommendation | Not yet determinable |
| Readiness state | Blocked |
| Confidence | Medium |
| Rationale | The three candidate options are named but never compared (O-1). The AI-acceleration assumption that makes custom code feasible is unproven (O-3), and cost/hosting facts are missing (O-5). No responsible choice can be made until options are compared against the ~1-month deadline (O-4) and restricted-access requirement (O-9). |

#### Assessment Dimensions

| Dimension | Finding | Source |
|-----------|---------|--------|
| Authority clarity | Identified | O-18, O-19: requester + IT Director named; LeadLab Director final OK; willingness unconfirmed |
| Option clarity | Partial | O-1: three options named, not compared |
| Evidence sufficiency | Insufficient | O-1, O-3, O-5: no comparison, assumption unproven, budget/hosting unknown |
| Assumption exposure | High | O-3: AI-acceleration assumption could invalidate the custom-code option |
| Risk visibility | Partial | O-24: timeline risk flagged; option-specific risks not assessed |
| Dependency status | Clear | No predecessor decisions; first in sequence |
| Timing fit | Current | O-4: ~1 month to launch; decision needed now |
| Reversibility | Reversible | Platform can be changed later at cost |
| Compliance impact | Informational | O-12: participant email privacy rules relevant but unconfirmed |

#### Evidence Needs

| NEED ID | Evidence Gap | Readiness Dimension | Referral Classification | ASR ID (if referred) |
|---------|--------------|---------------------|------------------------|----------------------|
| NEED-01 | Platform comparison: cost, effort, timeline, access support, customization, maintenance per option | Evidence / Options | Direct intervention | None |
| NEED-02 | Validation that a custom build is feasible in ~1 month with AI assistance | Evidence | Direct intervention | None |

#### Recommended Intervention

| Field | Detail |
|-------|--------|
| Intervention type | Compare options |
| Description | Produce a structured comparison of website builder vs WordPress vs custom code against: ~1 month timeline, restricted access needs, cost (no formal budget), customization gap that motivated the rebuild, and maintenance effort. Include a small spike or proof of concept to validate the AI-acceleration assumption (NEED-02). |
| Owner | Requester |
| Trigger | Immediately; before any build work |
| Effort | Small to Medium |

**Unblock:** Comparison + assumption validation complete → present options with recommendation to IT Director; final OK from LeadLab Director (DEC-05 budget confirmation feeds this).

### DEC-02: Choose participant access mechanism (SSO, login, email-list gating)

| Field | Detail |
|-------|--------|
| Decision maker | Requester + IT Director; final OK LeadLab Director |
| Deadline or trigger | Before build starts (after DEC-01) |
| Options | Microsoft 365 SSO (current); platform-native login; email-list gating |
| Recommendation | Not yet determinable |
| Readiness state | Blocked |
| Confidence | Medium |
| Rationale | Access options depend on platform capabilities (DEC-01 dependency, O-11). Privacy rules for participant emails are unconfirmed (O-12). Current mechanism (Outlook group + M365 SSO, O-10) is the fallback but may not fit every platform option. |

#### Assessment Dimensions

| Dimension | Finding | Source |
|-----------|---------|--------|
| Authority clarity | Identified | O-18, O-19 |
| Option clarity | Partial | O-11: three mechanisms named, not matched to platforms |
| Evidence sufficiency | Insufficient | O-12: privacy rules missing; platform access capabilities unknown |
| Assumption exposure | Medium | Assumes M365 SSO is available or replicable on the new platform |
| Risk visibility | Partial | O-9: public-access risk flagged; email data handling risk partially visible |
| Dependency status | Blocked | Depends on DEC-01 |
| Timing fit | Current | O-11: needed before build starts |
| Reversibility | Reversible | Access mechanism can be changed post-launch |
| Compliance impact | Constrained | O-12: participant email data handling rules unconfirmed |

#### Evidence Needs

| NEED ID | Evidence Gap | Readiness Dimension | Referral Classification | ASR ID (if referred) |
|---------|--------------|---------------------|------------------------|----------------------|
| NEED-03 | Privacy rules/basis for storing and using participant email addresses on the new platform | Control / Evidence | Direct intervention (confirm with IT Director whether an org policy exists) | None |
| NEED-04 | Access capabilities per candidate platform (SSO support, email gating) | Evidence | Direct intervention (part of NEED-01 comparison) | None |
| NEED-05 | Durable participant access handling record for the new platform (mechanism + email privacy basis), maintained across programs | Control | Artifact review | ASR-01 |

#### Recommended Intervention

| Field | Detail |
|-------|--------|
| Intervention type | Obtain evidence (NEED-03, NEED-04); Create or update supporting material (NEED-05 via ASR-01) |
| Description | Confirm with IT Director whether an organizational privacy policy covers participant emails. Fold access-capability checks into the DEC-01 platform comparison. Refer the durable access handling record to artifact prescription (ASR-01). |
| Owner | Requester |
| Trigger | After DEC-01 decision |
| Effort | Small |

**Unblock:** DEC-01 decided → confirm privacy basis → choose mechanism → record in access handling artifact.

### DEC-03: Decide video hosting dependency (keep YouTube vs host on platform)

| Field | Detail |
|-------|--------|
| Decision maker | Requester |
| Deadline or trigger | Before build completes |
| Options | Keep YouTube embedding (current); host videos on new platform |
| Recommendation | Keep YouTube for the Sep 11 launch; revisit hosting later |
| Readiness state | Conditionally ready |
| Confidence | Medium |
| Rationale | Current workflow (YouTube share links embedded, O-13) works and the original storage risk was already mitigated by YouTube (O-25). Keeping YouTube is safe on any candidate platform that supports embedding. Condition: the chosen platform must support YouTube embedding or equivalent streaming. |

#### Assessment Dimensions

| Dimension | Finding | Source |
|-----------|---------|--------|
| Authority clarity | Identified | Requester owns this decision |
| Option clarity | Partial | O-14: two options named, not compared |
| Evidence sufficiency | Partial | O-13: current workflow documented; platform storage capabilities unknown |
| Assumption exposure | Low | Keeping YouTube is a low-risk default |
| Risk visibility | Partial | O-25: storage risk known with existing mitigation |
| Dependency status | Partial | Soft dependency on DEC-01 (embedding support) |
| Timing fit | Current | Needed before build completes |
| Reversibility | Reversible | Can move hosting later |
| Compliance impact | None | No external obligation identified |

#### Evidence Needs

| NEED ID | Evidence Gap | Readiness Dimension | Referral Classification | ASR ID (if referred) |
|---------|--------------|---------------------|------------------------|----------------------|
| NEED-06 | Confirm candidate platform supports YouTube embedding or streaming | Evidence | Direct intervention (part of NEED-01 comparison) | None |

#### Recommended Intervention

| Field | Detail |
|-------|--------|
| Intervention type | None beyond DEC-01 comparison (condition check) |
| Description | Confirm embedding support in the NEED-01 comparison. No separate work: keep-YouTube is the default until the platform comparison says otherwise. |
| Owner | Requester |
| Trigger | During DEC-01 comparison |
| Effort | Small |

### DEC-04: Decide when/how to transition existing content (migration)

| Field | Detail |
|-------|--------|
| Decision maker | Requester with stakeholders |
| Deadline or trigger | After Sep 11 go-live |
| Options | Defer (current); schedule per-program migration |
| Recommendation | Keep the existing decision: defer migration until after go-live |
| Readiness state | Not yet due |
| Confidence | High |
| Rationale | Migration is explicitly out of scope now (O-15); existing content stays in place. The decision only becomes due after a successful go-live and after DEC-03 settles video location. |

#### Assessment Dimensions

| Dimension | Finding | Source |
|-----------|---------|--------|
| Authority clarity | Identified | O-18, O-19 |
| Option clarity | Defined | Defer vs migrate; defer already chosen (O-15) |
| Evidence sufficiency | Sufficient | O-15: scope decision documented |
| Assumption exposure | Low | No material assumption |
| Risk visibility | Explicit | Content remains available in the interim |
| Dependency status | Clear | Soft dependency on DEC-03 |
| Timing fit | Deferred | Trigger: post go-live |
| Reversibility | Reversible | Decision can be revisited |
| Compliance impact | None | None identified |

#### Recommended Intervention

None. Not yet due; revisit after go-live. This determination changes if content availability is threatened during the transition.

### DEC-05: Confirm budget, hosting, and domain availability

| Field | Detail |
|-------|--------|
| Decision maker | IT Director |
| Deadline or trigger | Before DEC-01 finalization |
| Options | None defined (no formal budget; resources + possible domain, O-5) |
| Recommendation | Not yet determinable |
| Readiness state | Blocked |
| Confidence | Medium |
| Rationale | Cost and hosting requirements are platform-specific; without the DEC-01 comparison there are no figures to approve (O-5). The domain name availability is stated as "possibly" available and needs confirmation. |

#### Assessment Dimensions

| Dimension | Finding | Source |
|-----------|---------|--------|
| Authority clarity | Identified | IT Director (O-19) |
| Option clarity | None | O-5: no budget options defined |
| Evidence sufficiency | Insufficient | O-5: no platform cost data |
| Assumption exposure | Medium | Assumes team resources cover build; hosting cost unquantified |
| Risk visibility | Partial | No cost-risk assessment |
| Dependency status | Blocked | Depends on DEC-01 |
| Timing fit | Current | Needed to finalize DEC-01 |
| Reversibility | Reversible | Budget can adjust |
| Compliance impact | None | None identified |

#### Evidence Needs

| NEED ID | Evidence Gap | Readiness Dimension | Referral Classification | ASR ID (if referred) |
|---------|--------------|---------------------|------------------------|----------------------|
| NEED-07 | Operating and hosting cost estimates per candidate platform | Evidence | Direct intervention (covered by NEED-01 comparison) | None |
| NEED-08 | Confirmation of domain name availability | Evidence | Direct intervention | None |

#### Recommended Intervention

| Field | Detail |
|-------|--------|
| Intervention type | Obtain evidence |
| Description | Include cost estimates in the NEED-01 comparison; requester confirms domain availability with IT Director. |
| Owner | Requester; IT Director |
| Trigger | With DEC-01 comparison |
| Effort | Small |

**Unblock:** DEC-01 comparison produces cost figures → IT Director confirms budget and domain.

### DEC-06: Assign ongoing portal maintenance ownership

| Field | Detail |
|-------|--------|
| Decision maker | IT Director |
| Deadline or trigger | Before go-live (Sep 11) |
| Options | Single option visible (requester's team, unconfirmed); external support not considered |
| Recommendation | Not yet determinable |
| Readiness state | Needs confirmation |
| Confidence | Medium |
| Rationale | No maintenance owner is assigned (O-16). The requester's team does the build (O-19), so the likely owner is the IT team, but no one has confirmed ongoing responsibility. |

#### Assessment Dimensions

| Dimension | Finding | Source |
|-----------|---------|--------|
| Authority clarity | Identified | IT Director (O-19) |
| Option clarity | Single option | O-16, O-19: only the IT team is visible |
| Evidence sufficiency | Partial | O-16: gap known; no owner confirmed |
| Assumption exposure | Medium | Assumes IT team can absorb ongoing support |
| Risk visibility | Partial | Post-launch support risk not assessed |
| Dependency status | Clear | Can be decided in parallel with DEC-01 |
| Timing fit | Current | Needed before go-live |
| Reversibility | Reversible | Owner can change |
| Compliance impact | None | None identified |

#### Recommended Intervention

| Field | Detail |
|-------|--------|
| Intervention type | Clarify authority |
| Description | One conversation with the IT Director to confirm who maintains the portal after Sep 11 and when support starts. No document needed. |
| Owner | Requester |
| Trigger | Before build completes |
| Effort | Small |

### DEC-07: Confirm whether Sep 11, 2026 date is flexible

| Field | Detail |
|-------|--------|
| Decision maker | LeadLab Director |
| Deadline or trigger | Immediately; affects timeline risk sizing for DEC-01 |
| Options | Hard deadline; flexible |
| Recommendation | Not yet determinable |
| Readiness state | Needs confirmation |
| Confidence | High |
| Rationale | Date flexibility is explicitly unknown (O-17). This single fact determines how much timeline risk the platform choice must absorb (O-24). |

#### Assessment Dimensions

| Dimension | Finding | Source |
|-----------|---------|--------|
| Authority clarity | Identified | LeadLab Director (O-18) |
| Option clarity | Defined | Hard vs flexible (O-17) |
| Evidence sufficiency | Insufficient | O-17: no response recorded |
| Assumption exposure | Medium | Timeline risk acceptance depends on this |
| Risk visibility | Partial | O-24: slip risk known; flexibility unknown |
| Dependency status | Clear | Independent |
| Timing fit | Current | Needed now |
| Reversibility | Reversible | N/A for an information decision |
| Compliance impact | None | None identified |

#### Recommended Intervention

| Field | Detail |
|-------|--------|
| Intervention type | Obtain evidence |
| Description | Ask the LeadLab Director whether Sep 11, 2026 is a hard deadline and what the acceptable fallback is. |
| Owner | Requester |
| Trigger | Immediately |
| Effort | Small |

### DEC-08: Decommission SharePoint after rebuild

| Field | Detail |
|-------|--------|
| Decision maker | Requester + IT Director |
| Deadline or trigger | After successful go-live on new platform |
| Options | Decommission fully; keep read-only archive |
| Recommendation | Not yet due; recommendation determinable at go-live |
| Readiness state | Not yet due |
| Confidence | High |
| Rationale | Decommission is already the stated intent (O-15 context; request brief "decommission SharePoint afterward"). It becomes due only after DEC-01 go-live. |

#### Assessment Dimensions

| Dimension | Finding | Source |
|-----------|---------|--------|
| Authority clarity | Identified | Requester + IT Director |
| Option clarity | Partial | Decommission vs archive not compared |
| Evidence sufficiency | Partial | Intent documented; no execution plan needed yet |
| Assumption exposure | Low | No material assumption at this stage |
| Risk visibility | Partial | Content loss risk exists if decommission is careless |
| Dependency status | Blocked (future) | Depends on DEC-01 go-live |
| Timing fit | Deferred | Trigger: successful go-live |
| Reversibility | Costly to reverse | Decommissioning removes the fallback portal |
| Compliance impact | None | None identified |

#### Recommended Intervention

None. Not yet due. Revisit after go-live; consider read-only archive option at that point.

## Key Patterns

- One primary decision (DEC-01) blocks three others (DEC-02, DEC-05) and gates two more (DEC-03, DEC-08). Its readiness is the critical path.
- Two cheap facts (DEC-07 date flexibility, NEED-03 privacy rules) reduce risk exposure for the whole set.
- Most evidence gaps resolve through a single platform comparison (NEED-01), not documents. One durable record (ASR-01) is justified for recurring access control.
- No decision is Ready today. Three are Blocked, two need confirmation, one is conditionally ready, two are not yet due.
