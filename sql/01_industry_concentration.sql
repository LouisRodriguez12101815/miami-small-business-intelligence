-- Industry concentration shares per ZIP code
-- Uses GROUP BY with window-style ranking via subqueries

SELECT
  z.zip,
  z.neighborhood,
  ic.industry_group,
  ic.business_count,
  ROUND(100.0 * ic.business_count / z.active_businesses, 2) AS share_pct
FROM zip_codes z
JOIN industry_counts ic ON ic.zip = z.zip
WHERE ic.business_count > 0
ORDER BY z.zip, share_pct DESC;
