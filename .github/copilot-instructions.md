# Copilot Instructions — Vittiya Disha

## What this project is
Vittiya Disha is a pre-loan decision-intelligence web app for rural entrepreneurs 
applying for concessional credit under NSFDC/NBCFDC/NSKFDC (Ministry of Social Justice 
& Empowerment schemes). It routes users to the correct scheme, computes their exact 
financial structure (EMI, loan amount, tenure), scores business feasibility, and runs a 
repayment stress test — all before they borrow. Built for Smart India Hackathon 2026, 
PS 26091.

## Non-negotiable architectural rule
The AI/LLM layer NEVER calculates or generates a number (rupee figure, interest rate, 
EMI, eligibility verdict, feasibility score). Every number comes from a deterministic 
function in algorithms/. The AI only explains pre-computed results in plain language. 
If you are asked to write code where an LLM prompt calculates something, stop and 
implement it as a plain function instead.

## Tech stack (do not deviate without being told)
- Frontend: React + Vite + Tailwind CSS
- Routing: react-router-dom
- State: React Context only (no Redux/Zustand)
- HTTP: axios, always routed through src/services/api.js
- Backend (future phase, not now): Node.js + Firestore
- Fonts: Fraunces (display/headings), Inter (body), IBM Plex Mono (all numbers/data)

## Design tokens (Tailwind custom colors — use these exact hex values, never arbitrary colors)
beige: #F4E9D8, beigeCard: #EDE0C8, beigeDeep: #E3D2AC, ink: #241B12, inkSoft: #5C4A34, 
saffron: #E8762C, saffronDeep: #B8541A, saffronLight: #F7A860, gold: #C6961D, 
maroon: #9C2B1E, go: #2F6B4F, line: #D8C6A0

## Visual style
Premium, aesthetic, light theme, saffron + beige combination — NOT generic dark-neon or 
flat cream/terracotta AI-template look. Reference implementation exists at 
docs/Vittiya_Disha_UI_Prototype.html — match its visual language (the animated "orb" for 
feasibility score, blueprint-grid background, corner-bracket hover effect on cards, 
ledger-style hairline motifs) when building React components.

## Error handling rules
- Every API call needs loading/success/error states, never silent failure
- Never show "0 competitors found" as "no competition" — flag low confidence instead
- Never invent a fallback number — say "insufficient data" instead of guessing
- Round currency values exactly once, at final display — never mid-calculation

## Folder convention
- src/components/ = reusable UI pieces
- src/pages/ = one file per route
- src/context/ = global state
- src/hooks/ = custom hooks
- src/services/ = API calls only, no UI logic
- src/utils/ = pure helper functions (formatting, constants, client-side formulas)

## Full documentation
Detailed specs live in /docs/. Read the relevant doc before implementing a feature if 
unsure: PRD.md (features/users), ARCHITECTURE.md (system flow), RULES.md (do/avoid list), 
Vittiya_Disha_Frontend_Roadmap.md (phase-by-phase build prompts).
