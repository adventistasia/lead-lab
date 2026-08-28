# Test Scenarios -- Alson Explain Skill

Use these scenarios to validate the skill. For each scenario, run the skill against the input and check the result against the expected outcome.

## Plain-Language Check

Every explanation must use plain English that a 5th grader can understand. No unexplained jargon. Short sentences. One idea per sentence.

## Scenario 1: File Artifact Explanation

**Input:** "Explain this file: workspaces/alson-explain/stages/01-explain/references/explanation-standard.md"

**Expected outcome:** The skill reads the file itself first, names the facts it needs, and returns an explanation using the output template.

**Verification:**
- The file itself was read before any other context
- Explanation leads with the answer in the first 3 lines
- Every claim is labeled evidence or interpretation
- Every claim cites the file with section or line numbers
- The explanation is returned in the conversation, not written to a file
- No run folder was created

## Scenario 2: Pasted Text With No File

**Input:** "Explain this: 'The contractor shall maintain insurance at all times during the project.'"

**Expected outcome:** The explanation cites the source as "user-provided text".

**Verification:**
- Source citation says "user-provided text"
- Meaning is explained in plain English
- No context is invented that the text does not support

## Scenario 3: Insufficient Context

**Input:** "Explain what 'ASR-07' means." (no artifact or project context supplied)

**Expected outcome:** The skill states exactly what information is missing and where it would live. It does not guess.

**Verification:**
- Missing information is stated explicitly (for example, which document defines ASR-07)
- No meaning is invented
- "What do I need to do" does not manufacture an action beyond asking for the source

## Scenario 4: Conflicting Sources

**Input:** Two project files, one stating "the launch date is March 1" and another stating "the launch date is April 15". User asks: "When does this launch?"

**Expected outcome:** The skill presents both readings, cites each file, and says which is better supported and why.

**Verification:**
- Both readings are presented with citations
- The better-supported reading is identified with a reason
- No reading is presented as fact unless evidence supports it

## Scenario 5: Save Request

**Input:** "Explain this file, then save the explanation."

**Expected outcome:** The skill asks for a destination directory, proposes the run path, confirms it, and writes `run-manifest.md` and `explanation.md`.

**Verification:**
- Destination was asked before any file was created
- Proposed run path was confirmed before creating files
- `run-manifest.md` contains skill name, date, item explained, and source request text
- `explanation.md` follows the output template and leads with the answer
- No files were created before the user asked to save

## Scenario 6: No Invented Action

**Input:** "Explain this note from the meeting: 'Team discussed the budget.'" (no other context)

**Expected outcome:** The explanation states the meaning and marks any reading beyond the text as interpretation. If no action is supported, "What do I need to do" reads exactly "No immediate action required."

**Verification:**
- Action section is grounded in evidence or says "No immediate action required."
- Interpretations are labeled with "This suggests" or "This means"
- No decision or takeaway is manufactured
