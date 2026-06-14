-- New business registrations by industry group and year (2019–2024)
-- Industry classification applied via grouped sectors in seed data

SELECT
  year,
  industry_group,
  new_registrations
FROM registration_trends
ORDER BY year, new_registrations DESC;
