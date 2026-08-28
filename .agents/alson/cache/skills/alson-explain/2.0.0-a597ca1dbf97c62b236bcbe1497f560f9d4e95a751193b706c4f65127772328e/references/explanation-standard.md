# Explanation Standard

Rules every explanation follows. This is the canonical reference for the skill.

## Output Template

Every explanation uses this structure. Empty sections are omitted.

### What is this about?

Explain what the selected item means in plain English. Short sentences. No jargon.

### Why it matters?

Explain why it is relevant, important, or connected to the wider context.

### What do I need to do?

State the specific action, decision, or takeaway. If none is supported, write exactly:

> No immediate action required.

### Sources

List every artifact used as evidence, with file path, section, and line numbers where available. Example: `projects/demo/artifacts/README.md`, line 12.

### Confidence

State how confident the explanation is, and why. Omit this section only when confidence is high and no gaps or conflicts exist.

## Evidence and Interpretation

- Evidence is something you read in a source: text, values, structure, or behavior.
- Interpretation is your reading of that evidence: what it implies, or how pieces connect.
- Label each claim. Interpretations start with phrases like "This suggests" or "This means".
- Never present an interpretation as a fact.

## Context Selection

- Start with the item itself. Read the file or folder before looking for context.
- Name the facts you need before searching for them.
- Inspect candidate artifacts one at a time. Read only the sections that could answer the named facts.
- Stop as soon as the meaning is supported. Do not load the whole workspace, project, or reference set.
- If a needed fact is absent, say it is missing. Do not keep reading to force a finding.

## Citation Format

- File paths are workspace-relative: `projects/<project>/<file>` or `workspaces/<workspace>/<file>`.
- Add the section name or line number when available.
- For pasted text with no file, cite it as "user-provided text" and say so.
- Cite interpretation sources the same way, but mark the claim as interpretation.

## Insufficient or Conflicting Context

- If meaning cannot be determined from available artifacts, say exactly what information is missing and where it would live.
- If sources conflict, present both readings, cite each, and say which is better supported and why.
- Do not guess to fill a gap.
- Do not present a guess as meaning.

## Action Rule

- An action belongs in "What do I need to do" only when evidence or clear interpretation supports it.
- Never manufacture an action, decision, or takeaway.
- When in doubt, write "No immediate action required."
