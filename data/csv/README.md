# Data for 15 ZIP Codes Only

No bulk county dataset is stored on your machine. The dashboard uses **real Miami-Dade statistics for your 15 neighborhoods only**.

## The first real data to use: active business counts

**File:** `data/processed/zip_codes.csv` (365 bytes — 15 rows)

This is the smallest file with the biggest impact. Each row is an official count of **active** Local Business Tax receipts for one ZIP code.

```csv
zip,neighborhood,active_businesses
33125,Little Havana,2082
33166,Doral,7931
...
```

Your dashboard reads this via **`src/data/businessData.js`** → `ZIP_DATA` (same numbers, ~6 KB total).

---

## All small files kept locally (~70 KB total)

| File | Size | What it powers |
|---|---|---|
| `zip_codes.csv` | 365 B | KPI cards, business density charts |
| `hhi_scores.csv` | 835 B | HHI panel, SQL Explorer |
| `industry_counts.csv` | 4 KB | Industry breakdown, deep dive |
| `registration_trends.csv` | 1 KB | Trend line chart |
| `businesses_sample.csv` | 57 KB | Real business names in SQL queries |
| `src/data/businessData.js` | 6 KB | **What the dashboard actually loads** |

---

## Refresh from official API (15 ZIPs only, ~30 seconds)

```bash
npm run data:fetch
```

Downloads directly from Miami-Dade ArcGIS — never saves the full county export.

---

## What was removed

These are **not** kept on disk anymore (~75 MB deleted):

- ~~`data/raw/lbt_active.csv`~~ (179,415 county-wide records)
- ~~`data/processed/lbt_raw.csv`~~
- ~~`data/processed/lbt_hackathon_zips.csv`~~
