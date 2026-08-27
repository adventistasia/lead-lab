# State Transitions

State transitions keep register history understandable and protect PM decision authority.

## General Rules

1. The agent may create a new item as `Proposed`.
2. The PM must direct acceptance, assignment, approval, rejection, closure, or supersession.
3. Evidence is required before an item is marked Resolved, Validated, Met, Mitigated, or Closed.
4. Do not delete a register item to hide history. Mark it Superseded or Closed with a source.
5. A risk marked `Occurred` is also proposed for the issue register. Preserve the link in `Related IDs`.
6. Every process run requires a separate post-review PM approval before it can enter `Reconciled`, even when no PM-only action is proposed.

## Register Lifecycles

| Register | Normal lifecycle |
|---|---|
| Risk | Proposed -> Open -> Mitigated -> Closed |
| Risk after event | Open -> Occurred -> Proposed issue |
| Assumption | Proposed -> Active -> Validated or Invalidated or Superseded -> Closed |
| Issue | Proposed -> Open -> In Progress or Blocked -> Resolved -> Closed |
| Dependency | Proposed -> Open or At Risk -> Met or Closed |
| Action | Proposed -> Open -> In Progress or Blocked -> Resolved -> Closed |
| Decision | Proposed -> Pending -> Made or Superseded |
| Change | Proposed -> Approved -> Closed, or Proposed -> Rejected |

## Process Run Lifecycle

| State | Meaning |
|---|---|
| Active | The run is moving through Stages 01-04 or has resumed after a requested revision. |
| Revision required | Validation found a blocking quality or evidence problem. |
| Governance pending | Validation passed but required PM direction is missing. |
| Reconciled | Authorized changes were applied and the reconciliation record was written. |
| Abandoned | The run is no longer needed; preserve the manifest and reason. |

Normal flow: `Active -> Revision required -> Active`, or `Active -> Governance pending -> Reconciled` after explicit post-review PM approval, or `Active -> Abandoned`. There is no direct `Active -> Reconciled` path.

## State Meaning

| State | Meaning |
|---|---|
| Proposed | Captured but not yet accepted by the PM |
| Open | Accepted and active |
| Pending | Accepted decision question awaiting an outcome |
| Active | Assumption is in use but not yet validated |
| In Progress | Work is underway |
| At Risk | Likely to fail or slip without intervention |
| Blocked | A real barrier prevents progress |
| Mitigated | Controls reduce risk exposure; evidence is recorded |
| Occurred | Risk event happened; issue capture is required |
| Validated | Assumption confirmed true |
| Invalidated | Assumption proven false and handled |
| Met | Dependency condition satisfied |
| Resolved | Action or issue outcome completed |
| Made | Decision outcome recorded |
| Approved | Change accepted by the PM |
| Rejected | Change declined by the PM with reason recorded |
| Superseded | Replaced by a newer item |
| Closed | Verified, archived, and no further action is required |

A rejected change is a decision state. It may be archived as Closed only when the PM directs that archival step.
