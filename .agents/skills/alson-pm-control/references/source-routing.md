# Source Routing

Rules for finding, loading, and citing external project material. External sources stay authoritative. The workspace never copies them.

## Where Sources Come From

| Source type | How the agent receives it |
|---|---|
| File or folder path | User provides it directly |
| Repository or SharePoint location | User provides the location and access method |
| Uploaded or pasted material | User provides the content in conversation |
| Existing project records | Registered in `source-index.md` |

When the user gives no location, check `source-index.md`. If the index has no entry for the needed document, ask. Never invent a location.

## Loading Rules

1. Determine what information the task needs before opening anything.
2. Load only the files and only the sections that answer the task.
3. For a folder, list contents and select the relevant files. Do not read everything.
4. For a large document, locate the relevant section and read it only.
5. Do not copy external content into the workspace. Store the location and section instead.
6. If a source cannot be accessed (missing file, dead link, no permission), flag it and ask for an accessible export. Do not guess the content.

For a process run, Stage 02 starts with the selected process recipe and then loads only the source sections named by that recipe and the process brief. The run folder records locations and evidence; it does not become a copy of the source.

## Recording Sources

`source-index.md` maps document types to locations:

| Document type | Location | Last verified | Notes |
|---|---|---|---|
| Project charter | path or URL | date | Authoritative for scope and objectives |
| BRD / requirements | path or URL | date | Authoritative for requirements |

## Traceability Format

Register rows carry a Source field using this compact form:

```text
Source: <path or URL> | <section or item ID> | verified <date>
```

| Field | Example |
|---|---|
| Path or URL | `/projects/sample/schedule.md` |
| Section or item | Section 4, milestones; REQ-024 |
| Verified | 2026-08-14 |

Related requirement references such as REQ-024 are kept as-is from the source. Do not renumber them.

Process-run evidence uses the same format and adds the run ID:

```text
Run: <run ID> | Process: PM-XX | Source: <path or URL> | <section or item ID> | verified <date>
```

## Answering Traceability Questions

- "Where did this information come from?" Read the item's Source field and open the source section.
- "What does this item affect?" Read the item's Related field and follow the referenced IDs in other registers and sources.

## Duplicate Detection

When capturing from a document, check existing registers first. If an item already exists, update or link instead of creating a duplicate. Flag near-duplicates to the PM for confirmation.
