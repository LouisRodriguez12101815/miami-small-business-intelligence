# Presentation Guide — Project 2: Small Business Intelligence

**Audience:** Hackathon judges and Miami-Dade officials  
**Duration:** 5–7 minutes demo + Q&A  
**Your angle:** First time learning about HHI — using it as the lens for economic resilience

**Live demo:** https://files-drab-theta.vercel.app  
**GitHub:** https://github.com/LouisRodriguez12101815/miami-small-business-intelligence

---

## One-sentence pitch

> "We built a dashboard that shows where Miami's small businesses are concentrating — and used the Herfindahl-Hirschman Index to classify each neighborhood as economically specialised, mixed, or diverse, so officials can see which areas are resilient and which are vulnerable to a single-industry downturn."

---

## How this maps to the hackathon guide

| Hackathon asks (Project 2) | Your answer |
|---|---|
| *What industries are growing in Miami?* | Registration trend lines (2019–2024) by sector on City Overview |
| *Where are they concentrating?* | Industry Deep Dive + Top Corridors table by ZIP |
| SQL: GROUP BY concentration | `sql/01_industry_concentration.sql` + live demo in SQL Explorer |
| SQL: CASE + registrations | `sql/02_new_registrations.sql` |
| SQL: Herfindahl Index | `sql/03_herfindahl_index.sql` — **your presentation focus** |
| DDA relevance | Sector Opportunity page — ZIPs with growth but supply gaps |
| Official appeal | Actionable: "South Beach is specialised in Food & Beverage — a tourism shock hits harder than Doral's mixed economy" |

---

## Slide outline (for Figma or Google Slides)

Use hackathon palette: navy `#1B3A5C`, teal `#0E7490`, amber `#D97706`, green `#166534`, bg `#F1F5F9`.

### Slide 1 — Title
**Small Business Intelligence Dashboard**  
Creative Hub Miami · SQL & Power BI Hackathon · Project 2  
*Your name · GitHub link · Live demo URL*

### Slide 2 — The question
**What industries are growing in Miami — and where are they concentrating?**

- 55,720 active businesses across 15 ZIP codes
- Data: Miami-Dade Local Business Tax Receipts (open data)
- Built with React + SQL + live query explorer

### Slide 3 — Why I focused on HHI *(your personal hook)*
**Discovering economic diversity through the Herfindahl-Hirschman Index**

> "Before this hackathon, I hadn't heard of HHI. I learned it's the same index antitrust regulators use to measure market concentration — applied here to measure how diversified a neighborhood's business base is."

**Formula:** `HHI = Σ (industry share)²`

| HHI Score | Classification | What it means |
|---|---|---|
| > 0.18 | **Specialised** | One or two industries dominate — higher risk |
| 0.12 – 0.18 | **Mixed** | Moderate concentration |
| ≤ 0.12 | **Diverse** | Broadly distributed — more resilient |

*Visual: screenshot of HHI bar chart from SQL Explorer*

### Slide 4 — What we found (example insights)
Pick 2–3 from your data:

- **South Beach (33139)** — HHI ~0.19, Specialised. Food & Beverage + Beauty dominate (tourism economy).
- **Doral (33166)** — HHI ~0.14, Mixed. Strong Professional Services + Technology presence.
- **Design District (33137)** — among highest Food & Beverage share per ZIP.

*Visual: screenshot of District Classification panel from City Overview*

### Slide 5 — Dashboard walkthrough (3 pages)
1. **City Overview** — KPIs, density, trends, HHI classification
2. **Industry Deep Dive** — pick one industry, show concentration
3. **Sector Opportunity** — DDA-relevant gap analysis

*Visual: 3 screenshots or a single composite*

### Slide 6 — SQL Explorer (differentiator)
**From static charts to live queries**

- In-browser SQLite seeded with business data
- 8 sample queries including HHI ranking, dominant industry, specialised zones
- Same SQL methodology as the hackathon exercises

*Live demo: run `SELECT * FROM hhi_scores ORDER BY hhi DESC`*

### Slide 7 — Methodology & limitations
- Keyword-based industry grouping (8 sectors from free-text BUSINESSTYPE)
- Sample data modeled on LBT patterns — production would use live Open Data Hub API
- No reliable business closure dates in LBT dataset
- 15 ZIP codes, not full county (~80+)

### Slide 8 — What's actionable for officials
- **Specialised ZIPs** → diversify business attraction incentives
- **Sector Opportunity page** → target ZIPs where population is growing but sector supply is low
- **SQL Explorer** → officials or analysts can ask ad-hoc questions without rebuilding charts

### Slide 9 — Links & thank you
- GitHub repo (public)
- Live demo (Vercel)
- Data sources: Miami-Dade Open Data Hub + US Census

---

## Demo script (5 minutes)

### 0:00 — Open with the insight, not the tech
*"Miami has 55,000+ active small businesses. But not every neighborhood is equally diversified. I want to show you how we measure that — and why it matters for economic resilience."*

### 0:30 — SQL Explorer tab: HHI query
1. Open **https://files-drab-theta.vercel.app** (or `npm run dev` locally)
2. Default view: SQL Explorer with HHI chart visible
3. Click sample query **"HHI scores by neighborhood"**
4. Click **Run Query**
5. Point to top result: *"South Beach has the highest concentration — one industry shock affects the whole ZIP differently than Kendall."*

### 1:30 — Visual Dashboard: City Overview
1. Switch to **Visual Dashboard** tab
2. Scroll to **District Classification** panel on the right
3. *"Green = diverse, amber = specialised. Officials can scan this in seconds."*

### 2:30 — Industry Deep Dive
1. Click **Industry Deep Dive** tab
2. Select **Food & Beverage**
3. *"South Beach and Little Havana lead — this connects back to HHI: tourism corridors are specialised."*

### 3:30 — Sector Opportunity (DDA relevance)
1. Click **Sector Opportunity** tab
2. *"Hackathon guide asked for this — ZIPs where population is growing but business density in a sector is below county average. Directly actionable for business attraction."*

### 4:30 — Close
*"All three SQL exercises from the hackathon guide are in the repo. The SQL Explorer lets you run them live. Code and demo are public on GitHub."*

---

## Anticipated Q&A

**Q: Why HHI instead of just showing industry counts?**  
A: Counts tell you what's there; HHI tells you how *balanced* the economy is. A ZIP with 5,000 restaurants and nothing else is different from one with 800 businesses spread across 8 sectors — even if total count is similar.

**Q: Is this live data?**  
A: Representative sample modeled on Miami-Dade LBT patterns. Production version connects to the ArcGIS REST endpoint — structure and SQL are ready.

**Q: Why React instead of Power BI?**  
A: Hackathon guide specifies Power BI; we built an equivalent React dashboard for portability, public GitHub hosting, and the SQL Explorer. Visual design follows the shared hackathon palette and page structure.

**Q: What would you do with more time?**  
A: Live data connection, map visualization (Leaflet/Mapbox), NAICS crosswalk for better industry classification.

---

## Figma tips

1. Create a **1280 × 720** frame (16:9, matches hackathon layout spec)
2. Use **Segoe UI** (or Inter as fallback)
3. Export screenshots from the running dashboard for slides 3–5
4. Add a **prototype link** from title slide → live demo URL
5. Duplicate the colour styles as Figma color styles for consistency

---

## Pre-demo checklist

- [ ] `npm run dev` running (or Vercel URL confirmed)
- [ ] Hard refresh browser (`Cmd+Shift+R`)
- [ ] SQL Explorer loads (not blank — sql.js WASM working)
- [ ] GitHub repo is public
- [ ] README has live demo URL
- [ ] PDF export of slides as fallback (hackathon guide recommendation)
