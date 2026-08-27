# Project Thresholds

Project-specific thresholds are configured in `project-control.md`.

## Required Settings

| Setting | Location | Use |
|---|---|---|
| Evidence refresh period | Current state in `project-control.md` | Identifies stale evidence |
| Decision attention window | Project Preferences | Flags decisions approaching their needed-by date |
| Proposed change escalation window | Project Preferences | Flags changes waiting for approval |
| RAG tolerance thresholds | Project Preferences | Determines Healthy, Watch, and Action required |
| Escalation thresholds | Project Preferences | Determines governance escalation candidates |

## Rules

1. Use the project-specific values in `project-control.md`.
2. Do not silently use a five-day or other default when a value is missing.
3. If a required threshold is blank, report `Unconfigured threshold` and do not make a time-based claim.
4. A PM may change a threshold by updating the project preferences and recording the source or decision that supports the change.
5. Threshold changes do not alter historical reports. New reports use the current configured values and state the effective date.
