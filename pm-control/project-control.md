# Lead Lab (lead-lab) Control Dashboard

**Next action:** Start build on staging; confirm production DNS, SSL, backups, and uptime responsibility (D-05) and assign the maintenance owner (D-03) before launch.

This file is the project-level dashboard and configuration record.

**Source of truth:** The registers in `registers/` hold current item-level control state. Do not copy or maintain register rows in this file. Read the registers when a current decision, action, exception, or attention item is needed.

| Field | Current state |
|---|---|
| Project outcome | Rebuild of the LeadLab Portal on a new platform to replace SharePoint; same feature scope; restricted to participants; live before Sep 11, 2026 |
| Control root | /Users/agnojf/Documents/alson-workspace/projects/lead-lab/pm-control |
| Current phase | Build gated for access lifted (D-02 Made); ready to start on staging; production readiness pending (D-05) |
| Overall condition | Action |
| Evidence refresh period | Unconfigured threshold |
| Last verified | 2026-08-18 |
| Last status report | None |
| Next review trigger | Production readiness confirmation (D-05 close-out), before build start |

## Performance Domains

| Domain | Condition | Trend | Confidence | Source |
|---|---|---|---|---|
| Governance | Action | Stable | Medium | decision-log (3 pending), project-control registers |
| Scope | Watch | Stable | Medium | request brief, D-08 confirmed by PM 18-Aug-2026; LeadLab Director final OK pending (DEP-07) |
| Schedule | Action | Worsening | Medium | Sep 11 fixed deadline (D-06 confirmed), no test time, D-05 production readiness still open |
| Finance | Watch | Stable | Medium | D-09 baseline covered; R-11 optional costs unresolved |
| Stakeholders | Watch | Stable | Low | access confirmed (D-02) 18-Aug-2026; LeadLab Director approval outstanding (DEP-07) |
| Resources | Watch | Stable | Low | staging confirmed (D-05); production readiness unconfirmed; maintenance owner unassigned (D-03) |
| Risk | Action | Stable | Medium | 3 open high-exposure risks (R-01, R-08, R-09); RAID operational |

## Baseline and Change Control

| Baseline area | Current version or date | Source |
|---|---|---|
| Scope | Same feature scope; confirmed by PM 18-Aug-2026 (D-08); LeadLab Director final OK pending (DEP-07) | request brief, What is included or not |
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