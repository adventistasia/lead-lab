# Project Decision Readiness Brief
LeadLab Portal Rebuild

## Decision Required

Choose the platform for the rebuilt LeadLab Portal (website builder vs WordPress vs custom code) before build work can start.

## Recommended Direction

Not yet determinable. Evidence is insufficient: the three options are named but never compared, and the AI-acceleration assumption that makes a custom build feasible is unproven.

**Assessment confidence:** Medium
**Decision maker:** Requester + IT Director; final OK from LeadLab Director
**Decision deadline or trigger:** Within days; portal live before Sep 11, 2026 (program runs Sep 11-14, 2026)

---

## Key Findings

- The platform decision blocks all build work. Nothing else can start until it is made.
- Three options exist (website builder, WordPress, custom code) but no comparison has been done on cost, effort, timeline, access support, or maintenance.
- The core assumption — that AI-assisted development makes a custom build feasible in ~1 month — is unproven and is the highest-risk item.
- Two cheap facts would sharpen every downstream decision: whether Sep 11, 2026 is a hard deadline, and which privacy rules apply to participant email addresses.
- One recommendation is safe now: keep YouTube for video hosting at launch, regardless of platform.

---

## Decisions Ready Now

None. No decision in this set is fully ready today.

---

## Conditionally Ready Decisions

| ID | Decision | Condition | Decision Maker | Recommendation |
|----|----------|-----------|----------------|----------------|
| DEC-03 | Video hosting dependency (keep YouTube vs host on platform) | Chosen platform supports YouTube embedding or equivalent streaming | Requester | Keep YouTube for the Sep 11 launch; revisit hosting after go-live |

---

## Blocked Decisions

| ID | Decision | Blocker | Needed to Unblock | Who Can Resolve |
|----|----------|---------|-------------------|-----------------|
| DEC-01 | Platform selection (primary) | No option comparison; AI-acceleration assumption unproven; no cost/hosting data | Structured comparison of the three options incl. a small spike to test the AI-assumption | Requester; IT Director confirms budget/domain; LeadLab Director final OK |
| DEC-02 | Participant access mechanism | Depends on DEC-01; privacy rules for participant emails unconfirmed | DEC-01 decided; confirm privacy basis; access handling record (ASR-01) | Requester + IT Director |
| DEC-05 | Budget, hosting, domain confirmation | Cost figures are platform-specific | Cost estimates from the DEC-01 comparison; domain availability check | IT Director |

---

## Decisions Not Yet Due

| ID | Decision | Expected Trigger | Current Assessment |
|----|----------|------------------|-------------------|
| DEC-04 | Content transition timing | After Sep 11 go-live | Deferral is the existing, correct decision |
| DEC-08 | Decommission SharePoint | Successful go-live on new platform | Consider read-only archive option when due |

---

## Options and Trade-offs

### Primary Decision (DEC-01)

The three candidate options from the request brief are shown below. No systematic comparison exists yet; pros, cons, and risks below are preliminary observations from project evidence and should be validated by the NEED-01 comparison.

| Option | Description | Pros | Cons | Key Risks | Recommendation |
|--------|-------------|------|------|-----------|----------------|
| Website builder | Low-code portal with hosting included | Fast to launch; no hosting to manage; fits no-budget constraint | Limited customization (the original complaint about SharePoint); access control options vary by vendor | Feature parity with current portal; vendor lock-in; access gating may not match M365 SSO | Not yet determinable |
| WordPress | Self-hosted or managed CMS with plugins | High customization; large ecosystem; YouTube embedding mature; access plugins exist | Needs hosting and maintenance; plugin sprawl risk; requires some technical upkeep | Build effort in ~1 month; security and maintenance ownership | Not yet determinable |
| Custom code | AI-assisted custom build | Full customization; directly addresses the SharePoint limitation | The AI-acceleration assumption is unproven for a ~1 month build-test-launch cycle | Timeline miss; ongoing maintenance burden; largest effort | Not yet determinable; depends on NEED-02 validation |

Decision criteria to apply (from evidence): ~1 month launch timeline (O-4), restricted participant-only access (O-9), no formal budget (O-5), customization gap that motivated the rebuild (O-2, O-8), ongoing maintenance effort (O-16).

---

## Material Risks and Unknowns

| Risk or Unknown | Impact if Realised | Likelihood | Mitigation |
|-----------------|-------------------|------------|------------|
| AI-acceleration assumption fails | Custom build misses Sep 11 deadline; event readiness affected (O-24) | Unknown; unproven (O-3) | Small spike before committing; fallback to builder/WordPress |
| Timeline slip (~1 month total) | Portal not live for program | Medium (O-24) | Confirm date flexibility (DEC-07); choose lower-effort platform if needed |
| Participant emails stored on new platform | Privacy/compliance issue (O-12) | Low-Medium | Confirm privacy policy (NEED-03); record handling basis (ASR-01) |
| No maintenance owner after launch | Portal degrades post-go-live (O-16) | Medium | Confirm owner with IT Director before go-live (DEC-06) |
| No cost data for chosen platform | Budget surprise; no formal budget exists (O-5) | Medium | Cost estimates in NEED-01; IT Director confirms before commit |

---

## Prioritized Action Plan

### Immediate (before the platform decision gate)

| # | Action | Intervention Type | Owner | Effort | Dependency |
|---|--------|-------------------|-------|--------|------------|
| 1 | Compare website builder vs WordPress vs custom code on timeline, cost, access support, customization, maintenance; include YouTube embedding check and hosting/domain facts | Compare options (NEED-01, NEED-06, NEED-07, NEED-08) | Requester | Small-Medium | None |
| 2 | Run a small spike to test whether AI-assisted development can deliver a working portal feature in the available time | Validate assumption (NEED-02) | Requester | Small | None |
| 3 | Ask LeadLab Director whether Sep 11, 2026 is a hard deadline | Obtain evidence (DEC-07) | Requester | Small | None |
| 4 | Confirm with IT Director which privacy policy applies to participant email addresses | Obtain evidence (NEED-03) | Requester | Small | None |

### Before Target Decision

| # | Action | Intervention Type | Owner | Effort | Dependency |
|---|--------|-------------------|-------|--------|------------|
| 1 | Review comparison results with IT Director; confirm budget and domain availability | Obtain approval / Obtain evidence (DEC-05) | IT Director | Small | Action 1 (Immediate) |
| 2 | Decide platform with requester + IT Director; obtain LeadLab Director final OK | Hold decision session / Obtain approval (DEC-01) | Requester + IT Director + LeadLab Director | Small | Action 1, 4 |

### Current Phase (after DEC-01)

| # | Action | Intervention Type | Owner | Effort | Dependency |
|---|--------|-------------------|-------|--------|------------|
| 1 | Choose participant access mechanism; refer access handling record to artifact prescription | Decision + Referral (DEC-02, ASR-01) | Requester + IT Director | Small | DEC-01 |
| 2 | Confirm maintenance ownership with IT Director | Clarify authority (DEC-06) | Requester | Small | None |
| 3 | Record keep-YouTube decision for launch | Accept or mitigate risk (DEC-03) | Requester | Small | DEC-01 |

### Review Later

| # | Action | Intervention Type | Owner | Notes |
|---|--------|-------------------|-------|-------|
| 1 | Revisit content migration | Decision | Requester + stakeholders | After go-live (DEC-04) |
| 2 | Revisit video hosting location | Decision | Requester | After go-live; per storage growth (O-7) |
| 3 | Decide SharePoint decommission vs read-only archive | Decision | Requester + IT Director | After successful go-live (DEC-08) |

---

## Artifact Support Requests

| ASR ID | Evidence Need | Decision ID | Target Artifact | Owner | Needed By | Status |
|--------|---------------|-------------|-----------------|-------|-----------|--------|
| ASR-01 | Participant access handling record (mechanism + email privacy basis), maintained across programs | DEC-02 | TBD (artifact prescription) | Requester (IT team) | Before DEC-02 finalization (build start) | Referred |

---

## Supporting Mechanisms Considered

| Mechanism | Considered For | Why Not Primary |
|-----------|---------------|-----------------|
| Platform decision record document | DEC-01 | Lighter: a comparison memo plus the decision itself satisfies the need; no durable record justified (referral test conditions 4 and 6 fail) |
| Formal access privacy policy | DEC-02 | Check whether an organizational policy already exists before creating one (NEED-03); the access handling record (ASR-01) carries the basis |
| Decision workshop | DEC-01 | Premature until the comparison exists; a two-person review + director OK is lighter |
| Full requirements document | DEC-01 | Scope is fixed (no new features, O-20); feature list already documented in the request brief |

---

## Decision Record

| Field | Detail |
|-------|--------|
| **Assessment author** | Alson (project decision readiness run `leadlab-rebuild-decisions`) |
| **Date** | 2026-08-11 |
| **Intended decision maker** | Requester + IT Director (final OK: LeadLab Director) |
| **Intended users** | Requester and IT team, IT Director, LeadLab Director |
| **Basis** | Project decision readiness model; evidence base of 8 sources; intake brief accepted at 100% quality |
| **Run mode** | First run |
| **Open decisions** | 1. Platform (DEC-01) — requester + IT Director, final OK LeadLab Director |
| | 2. Access mechanism (DEC-02) — after DEC-01 |
| | 3. Budget/hosting/domain (DEC-05) — IT Director |
| | 4. Maintenance owner (DEC-06) — IT Director |
| | 5. Date flexibility (DEC-07) — LeadLab Director |
| **Next review trigger** | When the immediate actions complete (comparison + spike + two confirmations), or when the decision maker requests review |

Full readiness register: `stages/04-readiness-assessment/decision-readiness-register.md`
