# Small Business Intelligence Dashboard — Project Documentation

**Creative Hub Miami · SQL & Power BI Hackathon · June 2025**
**Project 2 · Team Deliverable**

---

## 1. Dashboard Structure

The dashboard consists of three pages, each serving a distinct analytical purpose for city decision-makers:

**Page 1 — City Overview** provides the high-level picture: how many businesses are active across Miami-Dade, which neighborhoods have the highest density, how industries break down by share, and how new registrations have trended from 2019 through 2024. Four KPI cards at the top give immediate context. An industry filter bar lets users isolate specific sectors on the trend line chart. The Herfindahl Index panel on the right classifies each ZIP as Specialised, Mixed, or Diverse — a direct measure of economic resilience.

**Page 2 — Industry Deep Dive** lets users select a single industry and see where it concentrates geographically, how its new registrations have grown year-over-year, and which corridors have the highest count. The pill selector at the top switches between all eight industry groups. The Top Corridors table at the bottom provides a ranked, sortable reference with inline data bars.

**Page 3 — Sector Opportunity** is the page most directly actionable for officials. It identifies ZIP codes where population is growing but business density in the selected sector falls below the county average. The scatter plot places each ZIP in a growth-vs-density space, highlighting opportunity zones in amber. The gap analysis bar chart and detail table make the case concrete.

---

## 2. Data Sources

| Dataset | Source | URL | Role |
|---|---|---|---|
| Local Business Tax Receipts (LBT) | Miami-Dade GIS Open Data Hub | gis-mdc.opendata.arcgis.com/datasets/local-business-tax-view | Primary dataset: active businesses, industry types, locations |
| Census Business Patterns (CBP) | US Census Bureau | data.census.gov (Table CB2200CBP, FIPS 12086) | County-level industry benchmarks, employment, payroll |
| Commercial Building Permits | Miami-Dade Open Data Hub | gis-mdc.opendata.arcgis.com/datasets/building-permit | Commercial permit activity, job values, construction trends |

All sources are publicly available at no cost. Data was accessed June 2025.

---

## 3. Methodology

### Industry Classification

The LBT dataset contains free-text BUSINESSTYPE values that are not standardised. We grouped them into eight sectors using keyword matching:

| Industry Group | Matching Keywords |
|---|---|
| Food & Beverage | RESTAURANT, FOOD, CAFE, BAR, BAKERY |
| Retail | RETAIL, STORE, SHOP, MERCHANDISE |
| Real Estate | REAL ESTATE, PROPERTY, BROKER, LEASING |
| Healthcare | HEALTH, MEDICAL, DENTAL, CLINIC, PHARMACY |
| Technology | TECH, SOFTWARE, IT, COMPUTER, DIGITAL |
| Construction | CONSTRUCTION, CONTRACTOR, BUILDING, PLUMBING, ELECTRICAL |
| Professional Services | LAW, ACCOUNTING, CONSULTING, FINANCE, INSURANCE |
| Beauty & Personal Care | BEAUTY, SALON, SPA, BARBER, NAIL |

Businesses not matching any keyword fall into "Other" (excluded from the eight-group analysis to maintain clarity).

### Herfindahl-Hirschman Index (HHI)

Economic diversity per ZIP code is measured using the Herfindahl-Hirschman Index:

```
HHI = Σ (share_i)²
```

Where `share_i` is each industry's proportion of total businesses in that ZIP. Classification thresholds:

- **Specialised** (HHI > 0.18): One or two industries dominate
- **Mixed** (0.12 < HHI ≤ 0.18): Moderate concentration
- **Diverse** (HHI ≤ 0.12): Broadly distributed across sectors

### Sector Opportunity Identification

A ZIP qualifies as an "opportunity zone" for a given sector when:
- Population growth exceeds 5% (indicating demand pressure)
- Sector business density falls below the county average (indicating supply gap)

This is directly actionable for business attraction programs.

---

## 4. Data Cleaning and Transformation

- **Status filtering:** Only records with STATUS = 'Active' are included in concentration analysis. Records marked 'Deleted' are treated as inactive (the LBT dataset has no reliable closure date).
- **ZIP code standardisation:** All ZIP codes normalised to 5-digit strings.
- **Date parsing:** ISSUE_DATE extracted to year for trend analysis. Records before 2019 excluded from registration trend charts.
- **Null coordinates:** Records with missing X/Y coordinates are included in count-based analysis but excluded from any geographic visualization.
- **Industry grouping:** Applied via SQL CASE statements (see sql/02_new_registrations.sql). The "Other" bucket is intentionally excluded from the eight-group breakdown to keep charts readable.

---

## 5. Design Decisions

- **Color palette:** Uses the shared hackathon palette (navy #1B3A5C, teal #0E7490, amber #D97706, red #9B1C1C, green #166534) for consistency across all four team dashboards.
- **Typography:** Segoe UI throughout, with KPI values at 32px bold for readability at distance during presentations.
- **KPI cards:** Four per page, positioned at the top. Each includes an icon, label, primary value, and contextual trend indicator.
- **Chart library:** Recharts (React-native, declarative, responsive).
- **No map visual:** A geographic map was replaced with ranked bar charts and the scatter plot. With more time, Leaflet or Mapbox could be integrated for point-level mapping of business locations.
- **Sector Opportunity page:** Added based on hackathon guide's "DDA Relevance" note — this is the page most likely to generate follow-up conversations with officials.

---

## 6. How to Run

### In Claude (current)
The dashboard renders as an interactive React artifact directly in this conversation.

### Locally
```bash
cd /Users/user/Desktop/creatHubHackathon_06132026/files

# Install dependencies (first time only)
npm install

# Start the interactive dashboard with SQL explorer
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

**SQL Explorer tab** — Run SQL queries against an in-browser SQLite database seeded with Miami-Dade business data. Sample queries cover HHI scores, industry concentration, and business listings by neighborhood.

**Visual Dashboard tab** — The original three-page analytics dashboard (City Overview, Industry Deep Dive, Sector Opportunity).

### Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts — Vercel auto-detects Vite and deploys
```

---

## 7. Assumptions and Limitations

| Item | Detail |
|---|---|
| **Sample data** | The dashboard uses representative data modeled on Miami-Dade LBT patterns. Production deployment should connect to live CSVs from the Open Data Hub. |
| **No closure tracking** | The LBT dataset lacks reliable business closure dates. All analysis frames businesses as "active" or "new registrations" — churn rates cannot be calculated. |
| **Industry classification** | Keyword-based grouping is approximate. Some businesses may be miscategorised (e.g., a tech company registered as "CONSULTING"). NAICS code crosswalk would improve accuracy. |
| **Geographic scope** | Analysis covers 15 commercially significant ZIP codes, not all ~80+ in Miami-Dade County. |
| **Population data** | Population figures and growth rates are modeled estimates. Production version should pull from ACS 5-year estimates (Table B01003). |
| **No spatial join** | Without GIS processing, the dashboard uses ZIP-level aggregation rather than census tract or neighborhood boundaries. |

---

## 8. Recommendations for Future Improvements

1. **Connect to live data** — Replace sample data with direct API calls to the ArcGIS REST endpoint for LBT data, enabling real-time updates.
2. **Add map visualization** — Integrate Mapbox GL or react-leaflet to show point-level business locations with cluster markers.
3. **NAICS crosswalk** — Map LBT business types to standardised NAICS codes using the Census Business Patterns data for more accurate industry classification.
4. **Time-series forecasting** — Add a projected trend line using simple linear regression on registration data to show where each sector is heading.
5. **Supabase backend** — Move data into a Supabase PostgreSQL database for persistent storage, team collaboration, and real-time filtering via API.
6. **Mobile responsive layout** — Current layout is optimised for desktop/presentation. Add responsive breakpoints for mobile viewing.
7. **Export functionality** — Add PDF export capability so officials can download snapshots of the dashboard for briefings.

---

## 9. SQL Exercises Completed

The following SQL queries were developed as part of the analytical methodology:

1. **01_industry_concentration.sql** — GROUP BY + HAVING + window functions to calculate each industry's share of business activity per ZIP code.
2. **02_new_registrations.sql** — CASE expressions to classify business types into industry groups, with yearly registration counts since 2019.
3. **03_herfindahl_index.sql** — CTE-based Herfindahl-Hirschman Index calculation measuring economic diversity per ZIP code.

These queries are designed for SQL Server syntax with SQLite alternatives noted in comments.
