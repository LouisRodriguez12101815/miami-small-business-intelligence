# Small Business Intelligence Dashboard

**Creative Hub Miami · SQL & Power BI Hackathon · Project 2**

A React dashboard analyzing Miami-Dade local business tax receipt data across 15 ZIP codes. Built to answer: *What industries are growing in Miami, and where are they concentrating?*

This project extends the hackathon spec with an interactive **SQL Explorer** focused on the **Herfindahl-Hirschman Index (HHI)** — a measure of economic diversity that indicates how resilient a neighborhood's business base is when one sector slows down.

**Live demo:** *(add your Vercel URL after deploy)*  
**Repository:** *(add your GitHub URL after push)*

---

## What the dashboard shows

| View | Purpose |
|---|---|
| **SQL Explorer** | Run live SQL queries against seeded Miami-Dade business data; explore HHI scores, industry concentration, and business listings |
| **City Overview** | KPIs, business density by ZIP, industry breakdown, registration trends, HHI district classification |
| **Industry Deep Dive** | Select an industry; see geographic concentration, YoY registration growth, top corridors |
| **Sector Opportunity** | ZIPs with high population growth but low sector density — actionable for business attraction (DDA relevance) |

---

## Quick start

```bash
# Clone and install
git clone <your-repo-url>
cd small-business-intelligence-dashboard
npm install

# Run locally
npm run dev
# → http://localhost:5173

# Production build
npm run build
npm run preview
```

---

## Project structure

```
├── README.md                    ← you are here
├── DATA_SOURCES.md              ← open data links and field definitions
├── PRESENTATION.md              ← demo script and slide outline (HHI-focused)
├── PROMPTS_AND_PROCESS.md       ← AI prompts and build process used
├── PROJECT_DOCUMENTATION.md     ← full methodology and assumptions
├── sql/
│   ├── 01_industry_concentration.sql
│   ├── 02_new_registrations.sql
│   └── 03_herfindahl_index.sql
├── src/
│   ├── App.jsx                  ← tab shell (SQL Explorer + Visual Dashboard)
│   ├── components/              ← SQL explorer, HHI chart, query results
│   ├── data/seedData.js         ← representative Miami-Dade sample data
│   └── db/initDatabase.js       ← in-browser SQLite (sql.js)
└── SmallBusinessDashboard.jsx   ← original three-page visual dashboard
```

---

## Deploy to Vercel

```bash
npm install -g vercel
cd /path/to/this/project
vercel
```

| Prompt | Recommended answer |
|---|---|
| Set up and deploy? | **Y** |
| Which scope? | Your personal account or org |
| Link to existing project? | **N** (first time) |
| Project name? | `miami-small-biz-dashboard` (or accept default) |
| In which directory is your code? | **./** (press Enter) |
| Want to modify settings? | **N** |
| Detected Vite — build command? | Accept default: `vite build` |
| Output directory? | Accept default: `dist` |

After deploy, Vercel prints a URL like `https://miami-small-biz-dashboard.vercel.app`. Add it to this README and use it as your demo fallback.

---

## Hackathon alignment (Project 2)

| Requirement | Status |
|---|---|
| Local Business Tax data analysis | ✅ Sample data modeled on LBT patterns |
| SQL: industry concentration (GROUP BY) | ✅ `sql/01_industry_concentration.sql` |
| SQL: new registrations (CASE + GROUP BY) | ✅ `sql/02_new_registrations.sql` |
| SQL: Herfindahl Index (CTE) | ✅ `sql/03_herfindahl_index.sql` |
| City Overview page | ✅ KPIs, density, trends, HHI panel |
| Industry Deep Dive page | ✅ Pill selector, concentration, corridors |
| Sector Opportunity (DDA relevance) | ✅ Gap analysis + opportunity zones |
| Shared hackathon colour palette | ✅ Navy, teal, amber, green |
| Interactive demo | ✅ SQL Explorer + live queries |

---

## Tech stack

- **React 19** + **Vite 7**
- **Recharts** — charts and scatter plots
- **Lucide React** — icons
- **sql.js** — in-browser SQLite for the SQL Explorer

---

## License

MIT — open for public use and hackathon demonstration.
