# Data Sources — Project 2: Small Business Intelligence

All datasets are publicly available at no cost. Accessed June 2025 for the Creative Hub Miami hackathon.

---

## Primary dataset

### Local Business Tax Receipts (LBT)

| | |
|---|---|
| **Portal** | Miami-Dade GIS Open Data Hub |
| **URL** | https://gis-mdc.opendata.arcgis.com/datasets/local-business-tax-view |
| **Format** | CSV export or ArcGIS REST API |

**Key fields used in this project:**

| Field | Description |
|---|---|
| `BUSINESSNAME` | Registered business name |
| `BUSINESSTYPE` | Free-text industry description (requires keyword grouping) |
| `ISSUE_DATE` | Date business tax receipt was issued |
| `STATUS` | `Active` or `Deleted` (no reliable closure date) |
| `ZIP` | 5-digit ZIP code |
| `CITY` | City/neighborhood label |
| `X`, `Y` | Longitude/latitude (when available) |

**Data quality note (from hackathon guide):** The LBT dataset does not have a reliable closed-date field. Receipts that are not renewed are marked `Deleted`. Analysis is framed as *active business concentration* and *new registrations by year* — not churn/exit rates.

---

## Benchmark dataset

### Census Business Patterns (CBP)

| | |
|---|---|
| **Portal** | US Census Bureau — data.census.gov |
| **Table** | CB2200CBP |
| **Filter** | Miami-Dade County FIPS **12086** |

**Key fields:** `NAICS_CODE`, `NAICS_DESC`, `ESTAB` (establishment count), `EMP`, `PAYANN`

**Role:** County-level industry benchmarks for validating local concentration patterns.

---

## Supplementary dataset

### Commercial Building Permits

| | |
|---|---|
| **Portal** | Miami-Dade Open Data Hub |
| **URL** | https://gis-mdc.opendata.arcgis.com/datasets/building-permit |
| **Filter** | `PERMIT_TYPE LIKE '%COMMERCIAL%'` |

**Key fields:** `PERMIT_TYPE`, `ISSUE_DATE`, `ZIP_CODE`, `JOB_VALUE`

**Role:** Commercial construction activity as a proxy for business corridor development.

---

## Sample data in this dashboard

The dashboard uses **representative sample data** modeled on Miami-Dade LBT patterns across **15 commercially significant ZIP codes** (~55,720 active businesses). Production deployment should connect to live CSVs or the ArcGIS REST endpoint.

ZIP codes included: 33125, 33126, 33127, 33128, 33130, 33131, 33132, 33133, 33134, 33137, 33139, 33142, 33145, 33155, 33166.

---

## Industry classification (keyword matching)

Because `BUSINESSTYPE` is free-text, businesses are grouped into eight sectors:

| Industry Group | Keywords |
|---|---|
| Food & Beverage | RESTAURANT, FOOD, CAFE, BAR, BAKERY |
| Retail | RETAIL, STORE, SHOP, MERCHANDISE |
| Real Estate | REAL ESTATE, PROPERTY, BROKER, LEASING |
| Healthcare | HEALTH, MEDICAL, DENTAL, CLINIC, PHARMACY |
| Technology | TECH, SOFTWARE, IT, COMPUTER, DIGITAL |
| Construction | CONSTRUCTION, CONTRACTOR, BUILDING, PLUMBING, ELECTRICAL |
| Professional Services | LAW, ACCOUNTING, CONSULTING, FINANCE, INSURANCE |
| Beauty & Personal Care | BEAUTY, SALON, SPA, BARBER, NAIL |

Unmatched records fall into "Other" (excluded from the eight-group analysis).
