# {{PROJECT_NAME}} Assumption Log

Project: {{PROJECT_NAME}}

## Register

| ID | Assumption or constraint | Type | Owner | Status | Risk if false | Validation evidence | Validation due | Related IDs | Source | Verified |
|---|---|---|---|---|---|---|---|---|---|
| AL-01 | {{ASSUMPTION_DESCRIPTION}} | {{TYPE}} | {{OWNER}} | {{STATUS}} | {{IMPACT_IF_FALSE}} | {{EVIDENCE}} | {{YYYY-MM-DD}} | {{RELATED_IDS}} | {{SOURCE}} | {{YYYY-MM-DD}} |

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
| Active assumptions | {{COUNT}} |
| Validated | {{COUNT}} |
| Invalidated | {{COUNT}} |
| Overdue validation | {{COUNT}} |
