export {
  INDUSTRY_GROUPS,
  INDUSTRY_KEYS,
  ZIP_DATA,
  REGISTRATION_TRENDS,
  computeHHI,
  classifyHHI,
  DATA_SOURCE,
  DATA_FETCHED_AT,
} from "./businessData.js";

export const SAMPLE_QUERIES = [
  {
    id: "hhi-overview",
    title: "HHI scores by neighborhood",
    description: "Rank all ZIP codes by Herfindahl-Hirschman Index with economic classification.",
    sql: `-- Herfindahl-Hirschman Index by ZIP code
SELECT
  z.zip,
  z.neighborhood,
  z.active_businesses,
  ROUND(SUM(POWER(1.0 * ic.business_count / z.active_businesses, 2)), 4) AS hhi,
  CASE
    WHEN SUM(POWER(1.0 * ic.business_count / z.active_businesses, 2)) > 0.18 THEN 'Specialised'
    WHEN SUM(POWER(1.0 * ic.business_count / z.active_businesses, 2)) > 0.12 THEN 'Mixed'
    ELSE 'Diverse'
  END AS classification
FROM zip_codes z
JOIN industry_counts ic ON ic.zip = z.zip
GROUP BY z.zip, z.neighborhood, z.active_businesses
ORDER BY hhi DESC;`,
  },
  {
    id: "dominant-industry",
    title: "Dominant industry per ZIP",
    description: "Find which industry has the largest share in each neighborhood and its HHI impact.",
    sql: `-- Top industry concentration per ZIP with HHI context
WITH shares AS (
  SELECT
    z.zip,
    z.neighborhood,
    ic.industry_group,
    ic.business_count,
    ROUND(100.0 * ic.business_count / z.active_businesses, 1) AS pct_share,
    ROW_NUMBER() OVER (PARTITION BY z.zip ORDER BY ic.business_count DESC) AS rank
  FROM zip_codes z
  JOIN industry_counts ic ON ic.zip = z.zip
),
hhi AS (
  SELECT zip, ROUND(SUM(POWER(1.0 * business_count * 1.0 / total, 2)), 4) AS hhi
  FROM (
    SELECT ic.zip, ic.business_count, z.active_businesses AS total
    FROM industry_counts ic
    JOIN zip_codes z ON z.zip = ic.zip
  )
  GROUP BY zip
)
SELECT s.zip, s.neighborhood, s.industry_group AS dominant_industry,
       s.business_count, s.pct_share, h.hhi
FROM shares s
JOIN hhi h ON h.zip = s.zip
WHERE s.rank = 1
ORDER BY s.pct_share DESC;`,
  },
  {
    id: "specialised-zips",
    title: "Specialised economic zones",
    description: "Neighborhoods where one or two industries dominate (HHI > 0.18).",
    sql: `-- ZIP codes classified as economically specialised
SELECT * FROM hhi_scores
WHERE classification = 'Specialised'
ORDER BY hhi DESC;`,
  },
  {
    id: "company-hhi-context",
    title: "Businesses in high-HHI zones",
    description: "List individual businesses located in neighborhoods with elevated concentration.",
    sql: `-- Active businesses in specialised (high-HHI) neighborhoods
SELECT
  b.business_id,
  b.business_name,
  b.industry_group,
  b.zip,
  b.neighborhood,
  h.hhi,
  h.classification,
  h.dominant_industry
FROM businesses b
JOIN hhi_scores h ON h.zip = b.zip
WHERE h.classification = 'Specialised'
ORDER BY h.hhi DESC, b.industry_group
LIMIT 50;`,
  },
  {
    id: "industry-concentration",
    title: "Industry share by ZIP",
    description: "GROUP BY analysis showing each industry's proportion of local business activity.",
    sql: `-- Industry concentration shares per ZIP (Query 01 methodology)
SELECT
  z.zip,
  z.neighborhood,
  ic.industry_group,
  ic.business_count,
  ROUND(100.0 * ic.business_count / z.active_businesses, 2) AS share_pct
FROM zip_codes z
JOIN industry_counts ic ON ic.zip = z.zip
WHERE ic.business_count > 0
ORDER BY z.zip, share_pct DESC;`,
  },
  {
    id: "diverse-opportunities",
    title: "Diverse vs specialised comparison",
    description: "Compare average business counts across economically diverse and specialised zones.",
    sql: `-- Compare business density across HHI classifications
SELECT
  h.classification,
  COUNT(*) AS zip_count,
  ROUND(AVG(h.hhi), 4) AS avg_hhi,
  ROUND(AVG(h.active_businesses), 0) AS avg_active_businesses,
  SUM(h.active_businesses) AS total_businesses
FROM hhi_scores h
GROUP BY h.classification
ORDER BY avg_hhi DESC;`,
  },
  {
    id: "registration-trends",
    title: "New registrations by year",
    description: "Yearly new business tax receipts by industry sector since 2019.",
    sql: `-- New registration trends (Query 02 methodology)
SELECT year, industry_group, new_registrations
FROM registration_trends
ORDER BY year, new_registrations DESC;`,
  },
  {
    id: "low-diversity-tech",
    title: "Tech share in mixed/diverse ZIPs",
    description: "Find neighborhoods with growing tech presence but low overall concentration.",
    sql: `-- Technology businesses in economically diverse neighborhoods
SELECT
  z.zip,
  z.neighborhood,
  ic.business_count AS tech_businesses,
  ROUND(100.0 * ic.business_count / z.active_businesses, 1) AS tech_share_pct,
  h.hhi,
  h.classification
FROM zip_codes z
JOIN industry_counts ic ON ic.zip = z.zip AND ic.industry_group = 'Technology'
JOIN hhi_scores h ON h.zip = z.zip
WHERE h.classification IN ('Mixed', 'Diverse')
ORDER BY tech_share_pct DESC;`,
  },
];
