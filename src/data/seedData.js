export const INDUSTRY_GROUPS = [
  "Food & Beverage",
  "Retail",
  "Real Estate",
  "Healthcare",
  "Technology",
  "Construction",
  "Professional Services",
  "Beauty & Personal Care",
];

export const INDUSTRY_KEYS = [
  "foodBev",
  "retail",
  "realEstate",
  "healthcare",
  "tech",
  "construction",
  "professional",
  "beauty",
];

export const ZIP_DATA = [
  { zip: "33125", name: "Little Havana", active: 4820, foodBev: 1205, retail: 964, realEstate: 434, healthcare: 289, tech: 145, construction: 578, professional: 530, beauty: 675 },
  { zip: "33126", name: "Westchester", active: 3150, foodBev: 567, retail: 693, realEstate: 284, healthcare: 410, tech: 189, construction: 347, professional: 378, beauty: 282 },
  { zip: "33127", name: "Wynwood", active: 2890, foodBev: 896, retail: 520, realEstate: 347, healthcare: 115, tech: 376, construction: 202, professional: 260, beauty: 174 },
  { zip: "33128", name: "Downtown", active: 5240, foodBev: 786, retail: 629, realEstate: 891, healthcare: 367, tech: 524, construction: 419, professional: 1048, beauty: 576 },
  { zip: "33130", name: "Brickell", active: 4670, foodBev: 701, retail: 514, realEstate: 981, healthcare: 280, tech: 654, construction: 327, professional: 934, beauty: 279 },
  { zip: "33131", name: "Brickell Key", active: 2100, foodBev: 294, retail: 231, realEstate: 546, healthcare: 126, tech: 378, construction: 105, professional: 336, beauty: 84 },
  { zip: "33132", name: "Edgewater", active: 2450, foodBev: 490, retail: 343, realEstate: 392, healthcare: 147, tech: 294, construction: 245, professional: 368, beauty: 171 },
  { zip: "33133", name: "Coconut Grove", active: 2180, foodBev: 480, retail: 458, realEstate: 305, healthcare: 196, tech: 131, construction: 218, professional: 262, beauty: 130 },
  { zip: "33134", name: "Coral Gables", active: 4390, foodBev: 527, retail: 659, realEstate: 703, healthcare: 527, tech: 307, construction: 264, professional: 878, beauty: 525 },
  { zip: "33137", name: "Design District", active: 1680, foodBev: 504, retail: 454, realEstate: 185, healthcare: 67, tech: 218, construction: 101, professional: 84, beauty: 67 },
  { zip: "33139", name: "South Beach", active: 5890, foodBev: 1767, retail: 942, realEstate: 530, healthcare: 236, tech: 177, construction: 295, professional: 707, beauty: 1236 },
  { zip: "33142", name: "Allapattah", active: 3420, foodBev: 684, retail: 753, realEstate: 205, healthcare: 342, tech: 103, construction: 616, professional: 308, beauty: 409 },
  { zip: "33145", name: "Shenandoah", active: 2760, foodBev: 662, retail: 580, realEstate: 248, healthcare: 221, tech: 110, construction: 331, professional: 276, beauty: 332 },
  { zip: "33155", name: "Kendall", active: 3870, foodBev: 658, retail: 774, realEstate: 348, healthcare: 581, tech: 232, construction: 310, professional: 581, beauty: 386 },
  { zip: "33166", name: "Doral", active: 6210, foodBev: 621, retail: 932, realEstate: 559, healthcare: 373, tech: 869, construction: 745, professional: 1242, beauty: 869 },
];

export const REGISTRATION_TRENDS = [
  { year: 2019, "Food & Beverage": 3240, Retail: 2890, "Real Estate": 1820, Healthcare: 1450, Technology: 980, Construction: 1670, "Professional Services": 2100, "Beauty & Personal Care": 1340 },
  { year: 2020, "Food & Beverage": 1890, Retail: 1720, "Real Estate": 1540, Healthcare: 1680, Technology: 1240, Construction: 1120, "Professional Services": 1890, "Beauty & Personal Care": 780 },
  { year: 2021, "Food & Beverage": 3680, Retail: 2640, "Real Estate": 2310, Healthcare: 1720, Technology: 1560, Construction: 2080, "Professional Services": 2340, "Beauty & Personal Care": 1520 },
  { year: 2022, "Food & Beverage": 4120, Retail: 2980, "Real Estate": 2650, Healthcare: 1890, Technology: 1980, Construction: 2340, "Professional Services": 2560, "Beauty & Personal Care": 1680 },
  { year: 2023, "Food & Beverage": 4380, Retail: 3120, "Real Estate": 2420, Healthcare: 2050, Technology: 2450, Construction: 2180, "Professional Services": 2780, "Beauty & Personal Care": 1820 },
  { year: 2024, "Food & Beverage": 4650, Retail: 3340, "Real Estate": 2180, Healthcare: 2280, Technology: 2890, Construction: 2450, "Professional Services": 3020, "Beauty & Personal Care": 1950 },
];

export function computeHHI(zipRow) {
  const counts = INDUSTRY_KEYS.map((key) => zipRow[key]);
  const total = zipRow.active;
  return counts.reduce((sum, count) => sum + Math.pow(count / total, 2), 0);
}

export function classifyHHI(hhi) {
  if (hhi > 0.18) return "Specialised";
  if (hhi > 0.12) return "Mixed";
  return "Diverse";
}

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
