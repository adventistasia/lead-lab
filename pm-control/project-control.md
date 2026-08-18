# Lead Lab (lead-lab) Control Dashboard

**Next action:** Confirm access decision (D-02) and server/domain readiness (D-05) so build can start for the Sep 11, 2026 deadline.

This file is the project-level dashboard and configuration record.

**Source of truth:** The registers in `registers/` hold current item-level control state. Do not copy or maintain register rows in this file. Read the registers when a current decision, action, exception, or attention item is needed.

| Field | Current state |
|---|---|
| Project outcome | Rebuild of the LeadLab Portal on a new platform to replace SharePoint; same feature scope; restricted to participants; live before Sep 11, 2026 |
| Control root | /Users/agnojf/Documents/alson-workspace/projects/lead-lab/pm-control |
| Current phase | Build not started; gated by D-02 (access) and D-05 (server/domain) |
| Overall condition | Action |
| Evidence refresh period | Unconfigured threshold |
| Last verified | 2026-08-18 |
| Last status report | None |
| Next review trigger | D-02 stakeholder response, before build start |

## Performance Domains

| Domain | Condition | Trend | Confidence | Source |
|---|---|---|---|---|
| Governance | Action | Stable | Medium | decision-log (7 pending), project-control registers |
| Scope | Watch | Stable | Medium | request brief, D-08 pending formal approval |
| Schedule | Action | Worsening | Medium | Sep 11 fixed deadline, no test time, D-02/D-05 gate build |
| Finance | Watch | Stable | Medium | D-09 baseline covered; R-11 optional costs unresolved |
| Stakeholders | Watch | Stable | Low | access-response pending, LeadLab Director approval outstanding |
| Resources | Watch | Stable | Low | server/domain unconfirmed (AL-08), maintenance owner unassigned |
| Risk | Action | Stable | Medium | 4 high-exposure open risks; RAID operational |

## Baseline and Change Control

| Baseline area | Current version or date | Source |
|---|---|---|
| Scope | Same feature scope; not formally approved (D-08) | request brief, What is included or not |
| Schedule | Before Sep 11, 2026 | request brief, Timing |
| Cost | IT baseline third-party costs covered (domain up to $25/yr) | decision-log D-09 |
| Quality | Restricted access gate; no formal acceptance criteria documented | unconfigured |
| Last approved change | None recorded | change-log |

## Register Index

| Register | Location | Last verified |
|---|---|---|
| Risks | `registers/risk-register.md` | 2026-08-18 |
| Assumptions | `registers/assumption-log.md` | 2026-08-18 |
| Issues | `registers/issues-log.md` | 2026-08-18 |
| Dependencies | `registers/dependencies-log.md` | 2026-08-18 |
| Actions | `registers/action-log.md` | 2026-08-18 |
| Decisions | `registers/decision-log.md` | 2026-08-18 |
| Changes | `registers/change-log.md` | 2026-08-18 |

## Project Preferences

| Setting | Value |
|---|---|
| Status report audience and cadence | Unconfigured |
| RAG tolerance thresholds | Unconfigured |
| Decision attention window (days) | Unconfigured |
| Proposed change escalation window (days) | Unconfigured |
| Escalation thresholds | Unconfigured |

## Dashboard Rules

- Keep project-level condition, trend, confidence, preferences, and next-action fields here.
- Keep item-level state, owners, dates, evidence, and relationships in the registers.
- Treat any dashboard value derived from a register as a view, not a second record.
- Do not mark a register item closed, approved, assigned, scoped, or escalated without PM direction.
- Keep the control-root path and project identity stable so the agent does not mix projects.