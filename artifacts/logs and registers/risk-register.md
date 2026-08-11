AGENTS.md Identity Precedence governs this template. The identity rules determine writing style, section order, and what to include or omit.
# {{PROJECT_NAME}} Risk Register

Project: {{PROJECT_NAME}}
Change ID: {{CHANGE_ID}}

## Rating Scale

| Rating | Probability | Impact |
|--------|------------|--------|
| 1 - Very Low | < 10% | Minimal disruption |
| 2 - Low | 10-30% | Minor delay or rework |
| 3 - Medium | 30-50% | Moderate delay or partial loss of capability |
| 4 - High | 50-70% | Major delay or significant capability loss |
| 5 - Very High | > 70% | Project failure or unrecoverable data loss |

## Register

| ID | Risk | Owner | Status | P x I | Trigger | Response |
|----|------|-------|--------|-------|---------|----------|
| R-01 | {{RISK_DESCRIPTION}} | {{OWNER}} | {{STATUS}} | {{EXPOSURE}} | {{TRIGGER}} | {{RESPONSE}} |

## Status

| Status | Meaning |
|--------|---------|
| Open | Active risk to monitor |
| Occurred | Risk event happened (move to Issue Log) |
| Closed | No longer relevant or mitigated |

## Summary

| Metric | Count |
|--------|-------|
| High exposure (P x I >= 12) | {{HIGH_COUNT}} |
| Medium exposure (P x I 6-11) | {{MEDIUM_COUNT}} |
| Low exposure (P x I 1-5) | {{LOW_COUNT}} |
| **Total identified risks** | **{{TOTAL_RISKS}}** |

## Reference Implementation

See `projects/alson-wp/artifacts/risk-register.md` — 17 risks with P×I scoring.
