# PMI Source Map

Maps each management capability to the PMI source sections that govern it. Load only the sections a task needs.

## Source Basis

| Source | File | Organization |
|---|---|---|
| PMBOK Guide 8th Edition | Optional user-supplied PMI source | Use only the selected process and tailoring sections when the source is available |
| PMI Guide to Business Analysis | Optional user-supplied PMI source | Navigate by section number when the source is available |

Navigation hint: when a PMI source is supplied, verify a section by locating its heading before reading it. The bundled process recipes remain the portable operating guidance when no PMI source is supplied.

## Capability Map

| Capability | PMBOK transcript pages | PMBOK section | Notes |
|---|---|---|---|
| Project management principles and performance domains | 60-115 | 3.2 | How the domains form one integrated system |
| Governance domain | 115-140 | 2.1 | Framework, project oversight, project lifecycle, decisions, escalation, tailoring |
| Scope domain (includes quality) | 140-152 | 2.2 | Scope definition, requirements, quality, acceptance |
| Schedule domain | 152-162 | 2.3 | Timeline, milestones, progress measurement |
| Finance domain | 162-175 | 2.4 | Cost estimation, budget, funding, forecasting |
| Stakeholders domain | 175-189 | 2.5 | Identification, engagement, communication |
| Resources domain | 189-199 | 2.6 | Team and physical resource management |
| Risk domain | 199-215 | 2.7 | Risk identification, analysis, responses, risk register, issue handling |
| Tailoring the performance domains | 215-230 | 3.5 | How to adapt practices to project size and context |
| 40 process index and focus-area mapping | 112-114 | Section 2, Table 2-1 | Process IDs and domain-to-focus-area mapping in `process-map.md` |
| Process recipes | 121-215 | Sections 2.1.6 through 2.7.2 | Purpose, inputs, outputs, tailoring, and check results for the 40 processes |

## Business Analysis Capabilities

| Capability | BA guide section | Notes |
|---|---|---|
| Requirements states and relationships | Section 7.2 area; search "requirement states" | Requirements evolve through states; relationships between requirements |
| Dependencies among requirements | Search "implementation dependency", "benefit or value dependency" | Implementation, benefit, and value dependency types |
| Traceability matrix | Sections 7.6.2.3, 8.2.2.5, 9.3.2.3 | Connecting requirements to sources, design, and tests |
| Product risk register | Search "risk register" | Product risks with corresponding responses |

## Workspace Rules Derivation

| Workspace reference | Derived from |
|---|---|
| `definitions.md` | PMBOK 2.1 through 2.7 terminology |
| `prioritization.md` | PMBOK 2.7 risk analysis and response planning |
| `reporting-rules.md` | PMBOK 2.1.6.7 monitoring and reporting, communications principles |
| `health.md` instruction | PMBOK 2.1 through 2.7 check-outcome tables (Tables 2-5 to 2-11) |
| `governance.md` instruction | PMBOK 2.1 governance and escalation guidance |
| `process-map.md` | PMBOK 8 Table 2-1 and process subsections |
| `process-execution-rules.md` | PMBOK 8 nonprescriptive process positioning and tailoring guidance |

When a PMI section and workspace rules conflict, the workspace rule wins for this workspace, and the conflict is flagged to the PM.
