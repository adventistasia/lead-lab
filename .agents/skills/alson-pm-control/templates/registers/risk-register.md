# {{PROJECT_NAME}} Risk Register

Project: {{PROJECT_NAME}}

## Rating Scale

| Rating | Probability | Impact |
|---|---|---|
| 1 Very Low | < 10% | Minimal disruption |
| 2 Low | 10-30% | Minor delay or rework |
| 3 Medium | 30-50% | Moderate delay or partial capability loss |
| 4 High | 50-70% | Major delay or significant capability loss |
| 5 Very High | > 70% | Project failure or unrecoverable data loss |

## Register

| ID | Risk | Owner | Status | P x I | Trigger | Response | Related IDs | Source | Verified |
|---|---|---|---|---|---|---|---|---|
| R-01 | {{RISK_DESCRIPTION}} | {{OWNER}} | {{STATUS}} | {{EXPOSURE}} | {{TRIGGER}} | {{RESPONSE}} | {{RELATED_IDS}} | {{SOURCE}} | {{YYYY-MM-DD}} |

## Status

| Status | Meaning |
|---|---|
| Proposed | Captured by the agent; not yet accepted by the PM |
| Open | Active risk to monitor |
| Mitigated | Controls in place; residual risk accepted |
| Occurred | Risk event happened; move to the issue register |
| Closed | No longer relevant or fully mitigated |

## Derived Summary

Generated from the register rows. Do not manually maintain these counts.

| Metric | Count |
|---|---|
| High exposure (P x I 12-25) | {{COUNT}} |
| Medium exposure (P x I 6-11) | {{COUNT}} |
| Low exposure (P x I 1-5) | {{COUNT}} |
| Total identified risks | {{TOTAL}} |
