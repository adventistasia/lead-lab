# Alson Explain

Explains any selected text, statement, artifact, or concept in its context, in plain English.

When you are looking at a sentence, policy, requirement, piece of code, error, folder structure, or any other item and need to know what it actually means and why it matters, this skill reads only the minimum context needed and returns a grounded explanation. It labels every claim as evidence or interpretation and cites its sources.

## Installation

### OpenCode

Add to your `opencode.json`:

```json
{
  "skills": {
    "paths": ["./alson-explain"]
  }
}
```

### Agent tools with .agents/skills/ support

```bash
cp -r alson-explain ~/.agents/skills/
```

### Manual

Place the `alson-explain/` folder in any skill search path your agent tool supports.

## Usage

Trigger the skill by naming the item to explain and using one of these keywords:

- "explain this"
- "what does this mean"
- "explain this file"
- "explain this error"
- "help me understand this"

Supply the item: pasted text, a file path, a folder, or a reference to an artifact. The skill reads the item first, names the facts it needs, inspects only the context that answers them, and returns the explanation in the conversation.

This skill is not a pipeline. The explanation appears in the conversation. No files are written unless you ask to save.

### Example prompts

- "Explain this: [pasted paragraph from a contract]"
- "What does this mean in context? Read projects/demo/artifacts/README.md"
- "Explain the folder structure of workspaces/alson-explain"
- "Help me understand this error from the build log"

### Saving the explanation

Say "save the explanation". The skill asks where to save it, confirms the path, and writes a run manifest alongside the explanation.

## Output Files

| File | Contents |
|------|----------|
| Conversation | The explanation (default output) |
| `run-manifest.md` | Run metadata (only when saved) |
| `explanation.md` | Saved explanation (only when saved) |

## What It Does Not Do

- Does not summarize documents outside their context
- Does not rewrite, improve, or edit content
- Does not give advice or make decisions for the user
- Does not research beyond the provided context
- Does not create a run folder unless the user asks to save

## Requirements

An agent tool that supports Agent Skills (loads `SKILL.md` from a skill directory).

## License

MIT
