AGENTS.md Identity Precedence governs this template. The identity rules determine writing style, section order, and what to include or omit.
# {{PROJECT_NAME}} Dependency Log

Project: {{PROJECT_NAME}}
Change ID: {{CHANGE_ID}}

## Register

| ID | Dependency | Owner | Status | Needed By | Impact if Unmet | Action |
|----|------------|-------|--------|-----------|-----------------|--------|
| DEP-01 | {{DEPENDENCY_DESCRIPTION}} | {{OWNER}} | {{STATUS}} | {{NEEDED_BY}} | {{IMPACT_IF_UNMET}} | {{ACTION}} |

## Status

| Status | Meaning |
|--------|---------|
| Met | Condition satisfied. No further action needed. |
| Open | Condition not yet satisfied. Active monitoring required. |
| At Risk | Likely to be unmet or delayed. Escalation may be needed. |
| Closed | No longer relevant or dependency removed. |

## Reference Implementation

See `projects/alson-wp/artifacts/dependencies-log.md` — 18 dependencies covering product, technical, and external.
