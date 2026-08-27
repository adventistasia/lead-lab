# Setup Instruction

Initialize or repair a project control root from the workspace templates. The detailed setup contract is `../setup/CONTEXT.md`; this instruction remains the compatibility route for existing setup commands.

## Inputs

| Source | What is needed |
|---|---|
| User | Project identity, at least one source location or `No source yet`, and one confirmed writable control-root path before the first write |
| Workspace | `setup/CONTEXT.md`, `templates/`, `references/process-map.md`, and `references/thresholds.md` |
| External | Source locations supplied or confirmed by the user; do not copy source documents |

Project preferences and thresholds are optional during first use and must not block initialization.

## Process

1. Follow `../setup/CONTEXT.md` for first-use behavior.
2. Use the project name and source location already supplied by the user when available.
3. Resolve the control-root path with the least user effort:
   - use an exact path already supplied and authorized by the user;
   - otherwise propose a safe sibling `<project-folder>-control` path when a local project folder makes that derivation clear;
   - otherwise ask only where project-control records should be stored.
4. Use one concise setup confirmation whenever enough information is available. Do not ask a sequence of optional setup questions.
5. Check whether the confirmed path exists and whether it already contains project-control files.
6. If the root is not empty, preserve existing files and report what is missing. Never overwrite an existing register without explicit direction.
7. Create the control-root structure:

   ```text
   <control-root>/
   ├── project-control.md
   ├── source-index.md
   ├── process-register.md
   ├── artifact-index.md
   ├── artifacts/
   ├── registers/
   ├── runs/
   ├── status-reports/
   ├── governance-updates/
   └── summaries/
   ```

8. Copy the project-control, source-index, process-register, artifact-index, and register templates into missing locations.
9. Replace values supplied or confirmed by the user, such as `{{PROJECT_NAME}}` and `{{CONTROL_ROOT_PATH}}`.
10. For optional values not yet supplied, use `Not configured`, `Unknown`, or blank as appropriate instead of stopping setup. Do not run a full artifact baseline or infer artifact need during setup.
11. Add all 40 process rows as `Not assessed`; do not invent applicability or ownership.
12. Add only source locations the user supplied or confirmed. Record them in `source-index.md`; do not copy source files.
13. Validate that all expected files and output folders exist, and that `project-control.md` contains the project identity and control-root path.
14. Return a short setup result and 3-5 plain-English next actions.
15. If setup was triggered while the user was trying to do another task, continue the original task after setup when enough information is available. Do not make the user repeat the request.

## Outputs

- Initialized or repaired control-root structure
- Populated project name and supplied source locations
- Setup validation summary
- Short list of useful next actions
- Only task-relevant missing information; do not dump optional configuration gaps on first use

## Validation

| Check | Pass condition |
|---|---|
| Path confirmed | Exact writable control-root location confirmed before first write |
| Existing work preserved | No existing register or output overwritten without direction |
| Structure complete | Required files and output folders exist |
| Source handling | Only user-supplied or confirmed locations recorded; no source document copied |
| Missing facts | Unknown project facts are not invented |
| Optional settings | Missing preferences or thresholds do not block setup |
| Traceability | Source locations include type, section of interest, and verification date when known |
| User effort | Setup uses one confirmation whenever possible and avoids duplicate questions |

## Authority

Setup may create missing structure and populate user-supplied or confirmed metadata. It may not infer project facts, replace existing project records, or approve any project decision.
