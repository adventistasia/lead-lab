# Authority Rules

Defines what the agent may do without approval and what requires the project manager. The PM remains responsible for management decisions. State transitions are defined in `state-transitions.md`.

## Agent May Do Without Approval

- Identify, capture, organize, and summarize information
- Analyze, prioritize, and flag items
- Prepare recommended responses and proposed register entries
- Produce reports, summaries, and governance updates as prepared outputs
- Update metadata fields that record the agent's own actions, such as Last verified and Source
- Draft proposed status changes and present them for approval
- Create and edit process-run drafts under `<control-root>/runs/`
- Create or update non-sensitive control-root artifacts only after the Stage 04 review gate and explicit post-review PM approval

## PM-Only Actions

These require explicit PM direction. The agent prepares the proposed entry, presents it, and applies it only after direction.

| Action | What the agent does instead |
|---|---|
| Close a risk, issue, action, dependency, or assumption | Draft the closure with evidence; wait for direction |
| Approve a change | Draft the change assessment; wait for approval |
| Assign or change ownership | Mark owner as `TBD` or `Unassigned`; flag it |
| Change project scope | Record as a proposed change; never edit scope sources |
| Approve a decision | Record decision as `Proposed` until the PM confirms |
| Escalate to a sponsor or steering body | Prepare the escalation; never send it |
| Establish or revise a baseline | Prepare the baseline and impact record; wait for approval |
| Accept a deliverable or phase | Prepare acceptance evidence; wait for the authorized approver |
| Reconcile a PM-only action | Keep it `Proposed` or `Governance pending` until direction is recorded |

## Mandatory Stage 05 Approval Checkpoint

Every process run must pass a separate approval checkpoint after Stage 04 and before Stage 05.

1. The initial process request authorizes process preparation through Stage 04 only. It is not Stage 05 approval.
2. Stage 04 validates the draft, lists the proposed changes, and presents the approval request in the conversation.
3. The agent stops. It must not start Stage 05, create a reconciliation record, update the run manifest to `Reconciled`, or write canonical records in the same turn.
4. The PM must respond after reviewing the Stage 04 request. The response must explicitly approve the continuation and either approve the listed business decisions or state the approved business scope and limits. Alson maps that direction to the internal change records.
5. An absent, ambiguous, or partial response leaves the run `Governance pending`. Stage 05 remains blocked until the PM supplies clear direction.

`Ready for reconciliation` is a quality result from Stage 04. It is not permission to proceed.

## User-Facing Approval Contract

The PM approves the meaning of a proposed decision, not the internal implementation.

Every approval request must use this order:

1. Result
2. Recommendation, when supported
3. Important risks, gaps, gates, or limits
4. Decision

Use plain-language business or project terms.
Do not ask the PM to approve stage numbers, process IDs, run IDs, PR IDs, ART IDs, internal paths, or implementation record lists.
The PM may answer Approve, Revise, or Reject. Alson maps that response to the internal process, register, artifact, and reconciliation records.
If the PM's response is partial or ambiguous, ask for the business scope of the direction and keep all unresolved changes Governance pending.

## Capture and Confirm Flow

1. Agent captures the item as `Proposed` with source and evidence.
2. Agent presents the proposed entry and any recommendation.
3. PM reviews and directs: accept as `Open`, modify, or reject.
4. Agent applies the direction and records the state and date.

For process runs, Stage 05 is the only stage that may reconcile canonical records. A quality pass without post-review PM direction produces `Governance pending` and blocks Stage 05, including for non-sensitive metadata.

State transitions follow `definitions.md`. A missing PM response leaves the item `Proposed`. It is never silently moved to a final state.

## What the Agent Must Never Do

- Invent missing project information
- Treat missing evidence as healthy
- Write into external project documents
- Create a second source of truth in reports
- Bypass the capture and confirm flow for PM-only actions
- Proceed from Stage 04 to Stage 05 without the mandatory post-review approval checkpoint
- Write canonical project records from Stage 03 or Stage 04
- Present inference as fact without labeling it as inference
