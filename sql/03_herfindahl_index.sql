-- Herfindahl-Hirschman Index (HHI) per ZIP code
-- HHI = SUM(share_i^2) where share_i is each industry's proportion of local businesses
-- Classification: Specialised (>0.18), Mixed (0.12-0.18), Diverse (<=0.12)

WITH industry_shares AS (
  SELECT
    z.zip,
    z.neighborhood,
    z.active_businesses,
    ic.industry_group,
    1.0 * ic.business_count / z.active_businesses AS share
  FROM zip_codes z
  JOIN industry_counts ic ON ic.zip = z.zip
)
SELECT
  zip,
  neighborhood,
  active_businesses,
  ROUND(SUM(share * share), 4) AS hhi,
  CASE
    WHEN SUM(share * share) > 0.18 THEN 'Specialised'
    WHEN SUM(share * share) > 0.12 THEN 'Mixed'
    ELSE 'Diverse'
  END AS classification
FROM industry_shares
GROUP BY zip, neighborhood, active_businesses
ORDER BY hhi DESC;
