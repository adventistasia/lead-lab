# Control Root Setup

Initialize or repair a project control root without copying external project documents.

## Setup Goal

Make first use easy for a normal project manager.

Do not turn setup into a questionnaire. Collect only what is required to safely identify the project, locate its source material, and confirm where project-control records will be written.

## Inputs

| Source | What is needed | First-use rule |
|---|---|---|
| User | Project identity | Use a supplied name; otherwise propose a clear folder-derived name when safe |
| User | Project source location | Accept one supplied location or an explicit `No source yet` state |
| User | Control-root authorization | Confirm one exact writable path before the first write |
| Workspace | `templates/` | Create only missing project-control structure |
| Workspace | `references/process-map.md` | Seed all 40 processes as `Not assessed` |
| Optional | PM preferences and thresholds | Do not block setup when these are not configured |

## Minimum Required Input

A new project needs only:

1. A project identity.
2. At least one project source location, or an explicit statement that no source exists yet.
3. One confirmed writable control-root path before files are created.

Everything else is optional during first use.

## First-Use Rules

### Project name

- Use a project name supplied by the user.
- If the user does not supply one and a clear project folder name is available, propose that folder name as the project name in the setup confirmation.
- Do not silently treat an inferred name as authoritative when it is ambiguous.

### Source location

- Accept a folder, file, URL, repository, SharePoint location, or other user-supplied project source.
- Do not require the user to classify every source during setup.
- Record only locations the user supplied or explicitly confirmed.
- More sources can be added later.

### Control root

The control root is where the workspace stores project-control records.

Before writing, it must be explicit and confirmed.

When a safe local suggestion can be derived from a supplied project folder, propose a sibling folder using this pattern:

```text
<project-folder>-control
```

Example:

```text
Project source: /projects/lead-lab
Suggested control root: /projects/lead-lab-control
```

If the source is a file, URL, cloud location, or another location from which a safe writable control-root path cannot be derived, ask only where the project-control records should be stored.

Never invent a filesystem, SharePoint, repository, or cloud path that is not grounded in the user's environment.

### Optional preferences

Do not block setup while asking for:

- Current phase
- Status-report audience or cadence
- RAG thresholds
- Evidence refresh period
- Escalation thresholds
- Decision-attention windows
- Change-escalation windows
- Baseline details
- Artifact ownership
- Artifact need or treatment decisions

If the user has not supplied these values, initialize them as `Not configured`, `Unknown`, or blank as appropriate. Surface them later only when they become useful to a task or decision.

## One-Confirmation Setup Pattern

When enough information is available to propose a setup, present one concise confirmation instead of several sequential questions.

Example:

```text
I can set this project up as:

Project: Lead Lab
Source: /projects/lead-lab
Control records: /projects/lead-lab-control

I will keep your source documents where they are and create only project-control records in the control folder.

Use this setup, or give me a different control-record location.
```

If the user already supplied an exact control-root path, do not ask again. Use it when the user's request already authorizes initialization at that path.

Do not ask optional setup questions unless the missing value prevents safe initialization.

## Process

1. Resolve the project name from supplied or safely proposed information.
2. Record the user-supplied source location or explicit `No source yet` state.
3. Resolve a control-root path:
   - use the exact user-supplied path, or
   - propose a safe derived local path when possible, or
   - ask only for the storage location when no safe proposal is possible.
4. Confirm the control-root path before the first write unless the user's instruction already explicitly authorizes that exact path.
5. Preserve existing files and create only missing structure.
6. Create `artifacts/`, `runs/`, `status-reports/`, `governance-updates/`, `summaries/`, and `registers/`.
7. Copy templates only into missing files. Do not overwrite existing records.
8. Initialize `process-register.md` with all 40 processes as `Not assessed`.
9. Initialize `artifact-index.md` with only artifact ownership supplied or confirmed by the user.
10. Record only user-supplied or confirmed source locations in `source-index.md`.
11. Leave optional project preferences unconfigured when they are not yet known.
12. Validate the structure.
13. Finish with a short setup result and 3-5 plain-English actions the PM can take next.

## Expected First-Use Output

Keep the completion message short and action-oriented.

Example:

```text
Project control is ready.

Project: Lead Lab
Sources: 1 location indexed
Control records: /projects/lead-lab-control

You can now ask:
- What needs my attention?
- Review this project.
- Check the RAID.
- Process these meeting notes.
- Prepare my status report.
```

Do not explain the five-stage PMI pipeline during setup unless the user asks.

## Outputs

| Artifact | Location | Format |
|---|---|---|
| Control dashboard | `<control-root>/project-control.md` | Markdown |
| Source index | `<control-root>/source-index.md` | Markdown |
| Process register | `<control-root>/process-register.md` | Markdown |
| Artifact index | `<control-root>/artifact-index.md` | Markdown |
| Registers | `<control-root>/registers/` | Markdown |
| Setup summary | Chat or requested summary file | Markdown |

## Validation

| Check | Pass condition |
|---|---|
| Identity | Project can be identified without ambiguity |
| Path | Exact writable control-root path is confirmed before first write |
| Preservation | Existing records are unchanged |
| Structure | Required folders and files exist |
| Process seed | All 40 process IDs are present once |
| Sources | Only supplied or confirmed locations are indexed |
| Optional settings | Missing preferences do not block setup |
| Artifact baseline | Setup does not assess the catalog or prescribe project artifacts |
| Authority | No approvals, assignments, closures, or baseline changes are inferred |
| User experience | Setup uses one confirmation whenever the available information allows it |
