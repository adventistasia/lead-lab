# {{PROJECT_NAME}} Dependency Log

Project: {{PROJECT_NAME}}

## Register

| ID | Dependency | Owner | Priority | Status | Needed by | Impact if unmet | Action | Related IDs | Source | Verified |
|---|---|---|---|---|---|---|---|---|---|
| DEP-01 | {{DEPENDENCY_DESCRIPTION}} | {{OWNER}} | {{PRIORITY}} | {{STATUS}} | {{YYYY-MM-DD}} | {{IMPACT}} | {{ACTION}} | {{RELATED_IDS}} | {{SOURCE}} | {{YYYY-MM-DD}} |

## Priority

| Priority | Definition |
|---|---|
| Critical | Unmet dependency blocks delivery |
| High | Unmet dependency threatens a milestone |
| Medium | Unmet dependency causes rework or delay |
| Low | Unmet dependency causes minor friction |

## Status

| Status | Meaning |
|---|---|
| Proposed | Captured by the agent; not yet accepted by the PM |
| Open | Condition not yet satisfied; active monitoring required |
| At Risk | Likely to be unmet or delayed; escalation may be needed |
| Met | Condition satisfied; no further action needed |
| Closed | No longer relevant or dependency removed |

## Derived Summary

Generated from the register rows. Do not manually maintain these counts.

| Metric | Count |
|---|---|
| Critical or at risk | {{COUNT}} |
| Open | {{COUNT}} |
| Met | {{COUNT}} |
| Total dependencies | {{TOTAL}} |
