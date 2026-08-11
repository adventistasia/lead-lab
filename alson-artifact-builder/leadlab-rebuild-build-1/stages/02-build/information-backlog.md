# Information Backlog

Run: `projects/lead-lab/alson-artifact-builder/leadlab-rebuild-build-1/`
Date: 2026-08-11

| TBD ID | Artifact | Section | Required info | Missing reason | Owner | Source expectation | Dependency impact | Resolution trigger | Status |
|--------|----------|---------|---------------|----------------|-------|--------------------|--------------------|--------------------|--------|
| TBD-001 | DEV-03, DEV-06, DEV-07, PM-31, DEV-10, PM-23/BA-19 | Activation / stack | DEC-01 platform choice (website builder / WordPress / custom code) | Decision blocked upstream | Requester + IT Director | ACT-01 comparison + ACT-02 spike → decision log D-01 | Gates activation of all shells; stack, hosting, test, ops content | DEC-01 decided | Open |
| TBD-002 | DEV-07, DEV-03, DEV-06, BA-34 | Access mechanism | DEC-02 access mechanism (SSO / login / email-list gating) | Decision blocked on DEC-01 | Requester + IT Director | Decision log D-02 after DEC-01 | Access procedure content; ASR-01 acceptance test | DEC-01 decided then DEC-02 | Open |
| TBD-003 | DEV-06, DEV-07 | Email-handling basis | Which privacy policy applies to participant emails, or consent basis to document | No privacy policy found in project evidence | IT Director | ACT-04 confirmation (NEED-03) | DEV-06 privacy content; DEV-07 ASR-01 section 3 | NEED-03 confirmed | Open |
| TBD-004 | DEV-03, DEV-07 | Hosting/domain | Hosting approach and domain availability | No budget figures; domain "possibly" available | IT Director | DEC-05 decision after DEC-01 comparison | Architecture and operations content | DEC-05 decided | Open |
| TBD-005 | PM-31 | Milestone dates | Build start, content load, test window, final OK dates | Dates depend on DEC-01 and DEC-07 | Requester | DEC-01 build plan; DEC-07 date flexibility answer | Milestone list activation | DEC-01 decided | Open |
| TBD-006 | PM-23/BA-19 | Criterion per BL item | Acceptance criterion text, verification method, acceptance level per backlog item | Not yet defined | Requester | Defined during build definition after DEC-01 | DEV-08 test cases | DEC-01 decided; before BL-11 | Open |
| TBD-007 | DEV-03 | Technology stack | Stack details per chosen platform | Platform undecided | Requester + IT team | DEC-01 outcome | Architecture content | DEC-01 decided | Open |
| TBD-008 | DEV-07, BA-34 | Access admins | Names/roles of admins who grant and revoke access | Not confirmed | Requester + IT team | IT team confirmation | ASR-01 sections 2 and 4 | DEC-02 chosen; before launch | Open |
| TBD-009 | BA-34, BA-15, PM-11 | Maintenance owner | Ongoing portal maintenance owner and support start | DEC-06 open | IT Director | DEC-06 decision | Readiness, transition, closure content | DEC-06 confirmed | Open |
| TBD-010 | DEV-08 | Test environments/data/coverage | Test environments, sample data, coverage targets, exit criteria, dates | Platform-dependent; acceptance criteria pending | Requester + IT team | DEV-03 + PM-23 content | Test plan activation | DEC-01 decided; PM-23 populated | Open |
| TBD-011 | DEV-10 | Repo structure and tools | Repository structure, setup commands, tool versions | Conditional on custom code | Requester + IT team | DEC-01 = custom code outcome | Repo guide activation | DEC-01 selects custom code | Open |
| TBD-012 | BA-34 | Readiness evidence | Content status, test results, access operation, readiness recommendations | Build not started | Requester + IT team | Build completion evidence (BL-10, BL-11, DEV-07) | Readiness assessment activation | Build complete, before launch | Open |
| TBD-013 | BA-15 | Migration details | Migration scope, steps, dates, cutover, support period | DEC-04 deferred until after go-live | Requester + IT team | DEC-04 + DEC-08 decisions post go-live | Transition plan activation | Successful go-live | Open |
| TBD-014 | PM-11 | Closure figures | Final outcomes, lessons, approvals, handover, dates | Project not closed | Requester | Post-transition evidence | Closure report activation | Project close | Open |
| TBD-015 | PM-31 | Date flexibility | Whether Sep 11, 2026 is a hard deadline and fallback | Not answered | LeadLab Director | ACT-03 confirmation (DEC-07) | Milestone risk sizing | DEC-07 answered | Open |
| TBD-016 | PM-31 | Actual milestone dates | Actual date recorded when each milestone is achieved | Future facts, not yet occurred | Requester + IT team | Milestone completion events | Milestone status accuracy | Each milestone achieved | Open |

## Summary

| Metric | Count |
|--------|-------|
| Open TBDs | 16 |
| Resolved | 0 |
| Blocking the next build cycle | 3 (TBD-001, TBD-002, TBD-003 — content cannot advance) |
