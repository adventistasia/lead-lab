# Health Rules

Single source for health conditions, trends, confidence, and overall project condition.

## Domains

Assess these seven domains:

- Governance
- Scope and quality
- Schedule
- Finance
- Stakeholders
- Resources
- Risk

RAID is evidence inside the Risk domain. It is not an eighth domain.

## Conditions

| Condition | Meaning |
|---|---|
| Healthy | Meets objectives and is within stated tolerance. No intervention is needed. |
| Watch | Outside tolerance but recoverable with monitoring or planned action. |
| Action required | Significant problem or tolerance breach. Intervention is needed. |
| Insufficient evidence | The condition cannot be determined because evidence is missing, stale, conflicting, or unreliable. |

## Trends

Use only:

- Improving
- Stable
- Worsening
- Unknown

A trend requires at least two comparable data points. Otherwise use `Unknown`.

## Confidence

| Confidence | Meaning |
|---|---|
| High | Direct, current measurement |
| Medium | Derived from multiple reliable records |
| Low | Based mainly on an assumption or incomplete evidence |

Low-confidence evidence cannot produce a Healthy condition by itself.

## Overall Condition Precedence

Apply these rules in order:

1. Any `Action required` domain makes the overall condition `Action required`.
2. If no domain is `Action required` and any domain is `Insufficient evidence`, the overall condition is `Insufficient evidence`.
3. If no domain is `Action required` or `Insufficient evidence`, and three or more domains are `Watch`, the overall condition is `Watch`.
4. Otherwise, the overall condition is `Healthy`.

Always show the domain-level evidence gaps even when the overall condition is Action required.

## Evidence Rules

- Every condition cites a register item or source section.
- Evidence must be current within the reporting period or labeled `as of <date>`.
- Conflicting evidence is reported with both citations.
- Missing evidence is never treated as Healthy.
- Facts, inferences, recommendations, and PMI-based assessment views are labeled separately.
