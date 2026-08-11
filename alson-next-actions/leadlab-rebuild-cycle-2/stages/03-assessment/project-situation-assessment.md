# Project Situation Assessment

## Overall Position

**Position:** At risk
**Confidence:** Medium
**Basis:** Objective, scope, and governance remain strong (accepted brief; decision makers named for all 8 decisions). The platform decision (DEC-01) still blocks all build work, and there is no evidence any of the four immediate actions from cycle 1 (comparison, spike, date ask, privacy ask) has started. The ASR-01 loop is the one closed gap: it returned as DEV-07 Create later, gated on the same decisions. With the Sep 11, 2026 deadline unchanged and all registers fully open, delay is now measurable: every day without DEC-01 shrinks the build window.

## Dimension Scores

| Dimension | Score | Max | Assessment | Basis |
|-----------|-------|-----|------------|-------|
| Objective clarity | 4 | 4 | Fact | Rebuild off SharePoint, same feature scope, restricted access, live before Sep 11, 2026; done-when stated (O-1, O-29) |
| Governance and authority | 3 | 4 | Fact | Decision makers named with escalation path (O-5); register assigns states to DEC-01..08. But three runs (cycle 1, decision readiness, prescription) sit governance pending with no response (O-6, O-7) |
| Scope and delivery | 2 | 4 | Inference | Scope clearly defined (O-2, O-3) but delivery blocked and unstarted: no platform choice, no comparison, no build plan (O-4, O-9, O-10) |
| Risk and issue management | 3 | 4 | Fact | 7 risks and 7 issues logged with owners, triggers, and responses, all Open (O-11, O-14, O-18); option-specific risks still not assessed (O-10) |
| Stakeholder engagement | 2 | 4 | Inference | Stakeholders named (O-20) but no engagement or communication plan (O-21) |
| Schedule and milestones | 2 | 4 | Inference | Single hard deadline Sep 11, 2026 (O-22); flexibility unknown (O-16); no milestone list or build schedule (O-24); decision due dates mid-Aug (O-23) |
| Resource and capacity | 2 | 4 | Inference | No formal budget, team resources, possible domain (O-26); no cost estimates (O-27); domain unconfirmed (O-28) |
| Quality approach | 2 | 4 | Gap | Done-when defined (O-29) and DEV-07 acceptance test defined (O-31), but no test plan or acceptance criteria for the portal (O-30) |
| Evidence sufficiency | 3 | 4 | Fact | Ten sources; ASR-01 return closes the access-record gap at prescription level; remaining gaps are specific: comparison, spike, privacy basis, date, maintenance, budget (evidence base, Gaps) |

## Scored Below 2

None. All dimensions score 2+; the risk concentration is in delivery and schedule, where no progress evidence exists.

## Existing Controls

| Control | Evidence | Effective? |
|---------|----------|------------|
| Accepted intake brief with documented scope | request-brief.md, audit 100% | Yes |
| Decision readiness register with owners and states | decision register, DEC-01..08 | Yes |
| Risk register, issue log, decision log maintained | artifacts/logs and registers, all items Open | Yes |
| Material risk table with mitigations | decision readiness brief, Material Risks | Yes |
| Named decision path to LeadLab Director | request-brief.md, People | Yes |
| ASR-01 closed at prescription level | artifact-support-handoff.md, DEV-07 | Yes (staged, not fulfilled) |
| Escalation trigger for no progress | cycle 1 next actions, Escalation (1 week) | Partial (trigger date not yet reached) |

## Control Gaps

| Gap | Concern | What Is Missing | Impact |
|-----|---------|-----------------|--------|
| No platform comparison | Delivery | Options never compared on cost, effort, timeline, access, maintenance (NEED-01) | DEC-01 undecidable; build blocked; R-02 high |
| AI-acceleration assumption unvalidated | Risk | No spike or proof of concept (NEED-02) | Custom-code option may be infeasible in ~1 month; R-01 high |
| No evidence of ACT-01..04 execution | Delivery | No record any immediate action started | Critical path stalled; cannot verify progress |
| Governance responses outstanding | Governance | No decision maker response to three completed runs | All recommendation chains pending; approval boundaries inactive |
| No build schedule or milestones | Schedule | No plan from DEC-01 to Sep 11 | Deadline risk unquantified; no tracking |
| No maintenance owner | Governance | No confirmed post-launch support (DEC-06) | Portal degrades after go-live |
| No test plan or acceptance criteria | Quality | No verification approach for rebuilt portal | Launch quality unverifiable |
| No engagement plan | Stakeholders | No communication approach for requester, IT Director, media team, LeadLab Director | Decision and build coordination ad hoc |
| DEV-07 record not created | Delivery | Access handling record pending DEC-01/DEC-02 | DEC-02 cannot close; NEED-05 stays open |

## Evidence-Light Mode

Not applicable — evidence-based mode.
