# Prompts & Build Process

This document records the AI-assisted workflow used to build and prepare this hackathon deliverable. Include this in your presentation if judges ask about your process — it shows intentional use of tools, not copy-paste output.

---

## Phase 1 — Initial dashboard (hackathon deliverable)

**Goal:** Scaffold a Vite + React project from existing dashboard files.

**Prompt used:**

> I'm building a React dashboard for a hackathon (deliverable due soon). I have these files in my current directory:
> - SmallBusinessDashboard.jsx — the complete dashboard component (uses recharts + lucide-react)
> - PROJECT_DOCUMENTATION.md — methodology and docs
> - 01_industry_concentration.sql, 02_new_registrations.sql, 03_herfindahl_index.sql — SQL exercises
> - DATA_SOURCES.md, README.md — reference docs
>
> The dashboard is a "Small Business Intelligence Dashboard" analyzing Miami-Dade business data across three pages: City Overview, Industry Deep Dive, and Sector Opportunity. It currently uses representative sample data baked into the component.
>
> Please do the following, in order:
> 1. Scaffold a Vite + React project
> 2. Install dependencies: recharts and lucide-react
> 3. Move SmallBusinessDashboard.jsx into src/ as App.jsx
> 4. Run the dev server and confirm it compiles
> 5. Create a production build
> 6. Add a README with run instructions
> 7. Tell me the exact command to deploy to Vercel
>
> Don't make changes to the dashboard's data or visual design unless something is broken.

**Outcome:** Vite project scaffolded, dependencies installed, build verified.

---

## Phase 2 — HHI focus + SQL Explorer

**Goal:** Interactive SQL interface to explore HHI scores — motivated by first exposure to the concept.

**Prompt used:**

> I am interested in creating an interface where I would be able to interact in a react dashboard using sql queries to find out more information relevant to the HHI score of each of the companies.

**Why this mattered:** The hackathon guide's Project 2 Exercise 3 is the Herfindahl Index SQL query. Rather than only showing HHI as a static panel on City Overview, this prompt led to:

- In-browser SQLite database (`sql.js`) seeded with ZIP, industry, and business data
- `hhi_scores` table with precomputed HHI and classification
- SQL Explorer tab with 8 sample queries
- HHI bar chart visualization
- Schema browser for judges/officials to explore the data model

**Personal learning note for presentation:**

> "I had never heard of HHI before reading the hackathon guide's Exercise 3. The index measures market concentration — sum of squared industry shares. Near 1 means one industry dominates; near 0 means diverse. I wanted to understand it by querying it myself, not just reading a chart."

---

## Phase 3 — Debugging blank page

**Issue:** Dashboard loaded blank at localhost:5173.

**Root cause found:**
1. Dev server was not running
2. `sql.js` browser bundle has no ESM default export — React never mounted

**Fix applied:**
- Vite alias pointing to `sql-wasm.js`
- Local WASM file in `public/sql-wasm.wasm`
- Error boundary for future visibility

---

## Phase 4 — Presentation & GitHub prep

**Prompt used:**

> I need to present this dashboard. The file outlines 4 different projects — I selected Project 2. I want files and ability to use the repo on GitHub publicly. I have Figma if that helps. Include the guidance and prompts I used. I was genuinely interested in the HHI score since this was my first time learning about it.

**Deliverables created:**
- `README.md` — project overview, run/deploy instructions
- `DATA_SOURCES.md` — open data links and field definitions
- `PRESENTATION.md` — slide outline, demo script, Q&A prep
- `PROMPTS_AND_PROCESS.md` — this file
- Git repository initialized for public GitHub push

---

## Key decisions (yours to explain in demo)

| Decision | Rationale |
|---|---|
| **HHI as presentation focus** | First time learning the concept; directly maps to hackathon SQL Exercise 3 |
| **SQL Explorer added** | Wanted to query HHI interactively, not just view a static list |
| **Kept original 3-page dashboard** | Matches hackathon Project 2 spec (City Overview, Industry Deep Dive, + Sector Opportunity for DDA) |
| **Sample data retained** | Hackathon guide allows representative data; SQL structure ready for live LBT connection |
| **React over Power BI** | Portable, hostable on GitHub/Vercel, supports live SQL demo |

---

## SQL exercises → dashboard mapping

| Hackathon exercise | File | Where it appears |
|---|---|---|
| Exercise 1 — Industry concentration | `sql/01_industry_concentration.sql` | SQL Explorer sample query + Industry Deep Dive page |
| Exercise 2 — New registrations | `sql/02_new_registrations.sql` | SQL Explorer + City Overview trend chart |
| Exercise 3 — Herfindahl Index | `sql/03_herfindahl_index.sql` | SQL Explorer + City Overview HHI panel + **presentation focus** |

---

## Tools used

- **Cursor** — AI-assisted coding, debugging, documentation
- **Vite + React** — dashboard framework
- **Recharts** — charts (hackathon-compatible alternative to Power BI visuals)
- **sql.js** — in-browser SQLite for live SQL demo
- **Vercel** — deployment (recommended)
- **Figma** — presentation slides (optional; outline in PRESENTATION.md)
