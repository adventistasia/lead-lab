AGENTS.md Identity Precedence governs this template. The identity rules determine writing style, section order, and what to include or omit.
# {{PROJECT_NAME}} Assumption Log

Project: {{PROJECT_NAME}}
Change ID: {{CHANGE_ID}}

## Register

| ID | Assumption / Constraint | Type | Owner | Status | Validation / Evidence | Impact if False |
|----|------------------------|------|-------|--------|-----------------------|-----------------|
| AL-01 | {{ASSUMPTION_DESCRIPTION}} | {{TYPE}} | {{OWNER}} | {{STATUS}} | {{VALIDATION_EVIDENCE}} | {{IMPACT_IF_FALSE}} |

## Type

| Type | Meaning |
|------|---------|
| Assumption | Accepted as true without proof |
| Constraint | Externally imposed limitation |

## Status

| Status | Meaning |
|--------|---------|
| Active | Not yet validated |
| Validated | Confirmed true |
| Invalidated | Proven false (handled) |
| Superseded | Replaced by new assumption |

## Reference Implementation

See `projects/alson-wp/artifacts/assumption-log.md` — 15 assumptions with validation status.
