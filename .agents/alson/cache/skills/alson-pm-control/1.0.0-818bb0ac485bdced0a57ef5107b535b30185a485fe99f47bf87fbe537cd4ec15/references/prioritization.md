# Prioritization

Rules for ranking risks, issues, dependencies, assumptions, and actions. Derives from PMBOK risk analysis and response planning (PMBOK 2.7, transcript pages 199-215). Project-specific time windows and tolerances come from `references/thresholds.md`.

## Risk Exposure

Exposure = Probability x Impact.

| Rating | Probability | Impact |
|---|---|---|
| 1 Very Low | < 10% | Minimal disruption |
| 2 Low | 10-30% | Minor delay or rework |
| 3 Medium | 30-50% | Moderate delay or partial capability loss |
| 4 High | 50-70% | Major delay or significant capability loss |
| 5 Very High | > 70% | Project failure or unrecoverable data loss |

| Exposure band | Label |
|---|---|
| 12-25 | High exposure. Active response required. |
| 6-11 | Medium exposure. Monitor and plan response. |
| 1-5 | Low exposure. Accept or monitor. |

## Issue Priority

| Priority | Definition |
|---|---|
| High | Blocks execution or audit compliance |
| Medium | Delays or reduces quality |
| Low | Nice to have; no critical impact |

## Dependency Priority

| Priority | Definition |
|---|---|
| Critical | Unmet dependency blocks delivery |
| High | Unmet dependency threatens a milestone |
| Medium | Unmet dependency causes rework or delay |
| Low | Unmet dependency causes minor friction |

## Assumption Risk

| Rating | Definition |
|---|---|
| High risk | If false, delivery or milestones are materially affected |
| Medium risk | If false, rework or moderate delay |
| Low risk | If false, minor impact |

## Action Ranking

Rank actions by:

1. Blocks or unblocks a High risk, High issue, Critical dependency, or overdue validation
2. Due date or trigger (overdue first)
3. Owner availability
4. Effort vs impact

## Attention Rules

An item needs attention when any of these hold:

| Rule | Trigger |
|---|---|
| Overdue action | Due date passed and state is Open or In Progress |
| High exposure risk | Exposure 12-25 and state is Open |
| Blocked issue | State is Blocked |
| Dependency at risk | State is At Risk |
| Overdue validation | Assumption validation due date passed |
| Pending decision | Decision needed by date passed or within the configured decision attention window |
| Unapproved change | Change state is Proposed beyond the configured change escalation window |
| Stale evidence | Last verified date older than the project's evidence refresh period |
| Tolerance breach | Schedule, cost, or quality outside the project's stated tolerance |

## Presentation Order

Attention lists present highest priority first, grouped as:

- Decisions needed
- Blocked or overdue items
- High exposure risks
- High priority issues
- Critical or at-risk dependencies
- Overdue assumptions and actions
