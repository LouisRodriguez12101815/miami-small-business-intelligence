import initSqlJs from "sql.js";
import {
  ZIP_DATA,
  INDUSTRY_GROUPS,
  INDUSTRY_KEYS,
  REGISTRATION_TRENDS,
  computeHHI,
  classifyHHI,
} from "../data/seedData.js";

const BUSINESS_PREFIXES = {
  "Food & Beverage": ["Miami Bites", "Cafe", "Kitchen", "Grill", "Bakery"],
  Retail: ["Shop", "Market", "Boutique", "Store", "Outlet"],
  "Real Estate": ["Properties", "Realty", "Homes", "Estates", "Brokers"],
  Healthcare: ["Medical", "Dental", "Clinic", "Health", "Wellness"],
  Technology: ["Tech", "Digital", "Software", "IT", "Cyber"],
  Construction: ["Build", "Contractors", "Construction", "Plumbing", "Electric"],
  "Professional Services": ["Law", "Consulting", "Finance", "Advisors", "Group"],
  "Beauty & Personal Care": ["Salon", "Spa", "Beauty", "Barber", "Nails"],
};

function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

function buildBusinesses() {
  const businesses = [];
  let id = 1;

  for (const zip of ZIP_DATA) {
    for (let i = 0; i < INDUSTRY_GROUPS.length; i++) {
      const industry = INDUSTRY_GROUPS[i];
      const key = INDUSTRY_KEYS[i];
      const count = zip[key];
      const prefixes = BUSINESS_PREFIXES[industry];
      const sampleSize = Math.min(count, 8);

      for (let j = 0; j < sampleSize; j++) {
        const prefix = prefixes[j % prefixes.length];
        businesses.push({
          business_id: id++,
          business_name: `${prefix} ${zip.name} ${j + 1}`,
          industry_group: industry,
          zip: zip.zip,
          neighborhood: zip.name,
          status: "Active",
        });
      }
    }
  }

  return businesses;
}

function getDominantIndustry(zipRow) {
  let maxCount = 0;
  let dominant = INDUSTRY_GROUPS[0];

  INDUSTRY_KEYS.forEach((key, i) => {
    if (zipRow[key] > maxCount) {
      maxCount = zipRow[key];
      dominant = INDUSTRY_GROUPS[i];
    }
  });

  return dominant;
}

export async function initDatabase() {
  const SQL = await initSqlJs({
    locateFile: (file) => `/${file.replace(/^.*\//, "")}`,
  });

  const db = new SQL.Database();

  db.run(`
    CREATE TABLE zip_codes (
      zip TEXT PRIMARY KEY,
      neighborhood TEXT NOT NULL,
      active_businesses INTEGER NOT NULL
    );

    CREATE TABLE industry_counts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zip TEXT NOT NULL,
      industry_group TEXT NOT NULL,
      business_count INTEGER NOT NULL,
      FOREIGN KEY (zip) REFERENCES zip_codes(zip)
    );

    CREATE TABLE businesses (
      business_id INTEGER PRIMARY KEY,
      business_name TEXT NOT NULL,
      industry_group TEXT NOT NULL,
      zip TEXT NOT NULL,
      neighborhood TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active'
    );

    CREATE TABLE registration_trends (
      year INTEGER NOT NULL,
      industry_group TEXT NOT NULL,
      new_registrations INTEGER NOT NULL,
      PRIMARY KEY (year, industry_group)
    );
  `);

  for (const z of ZIP_DATA) {
    db.run(
      `INSERT INTO zip_codes (zip, neighborhood, active_businesses) VALUES ('${z.zip}', '${escapeSql(z.name)}', ${z.active})`
    );

    INDUSTRY_GROUPS.forEach((industry, i) => {
      const count = z[INDUSTRY_KEYS[i]];
      db.run(
        `INSERT INTO industry_counts (zip, industry_group, business_count) VALUES ('${z.zip}', '${escapeSql(industry)}', ${count})`
      );
    });
  }

  for (const b of buildBusinesses()) {
    db.run(
      `INSERT INTO businesses (business_id, business_name, industry_group, zip, neighborhood, status)
       VALUES (${b.business_id}, '${escapeSql(b.business_name)}', '${escapeSql(b.industry_group)}', '${b.zip}', '${escapeSql(b.neighborhood)}', '${b.status}')`
    );
  }

  for (const row of REGISTRATION_TRENDS) {
    const { year, ...industries } = row;
    for (const [industry, count] of Object.entries(industries)) {
      db.run(
        `INSERT INTO registration_trends (year, industry_group, new_registrations) VALUES (${year}, '${escapeSql(industry)}', ${count})`
      );
    }
  }

  const hhiRows = ZIP_DATA.map((z) => {
    const hhi = computeHHI(z);
    return {
      zip: z.zip,
      neighborhood: z.name,
      active_businesses: z.active,
      hhi: Math.round(hhi * 10000) / 10000,
      classification: classifyHHI(hhi),
      dominant_industry: getDominantIndustry(z),
    };
  });

  db.run(`
    CREATE TABLE hhi_scores (
      zip TEXT PRIMARY KEY,
      neighborhood TEXT NOT NULL,
      active_businesses INTEGER NOT NULL,
      hhi REAL NOT NULL,
      classification TEXT NOT NULL,
      dominant_industry TEXT NOT NULL
    );
  `);

  for (const h of hhiRows) {
    db.run(
      `INSERT INTO hhi_scores (zip, neighborhood, active_businesses, hhi, classification, dominant_industry)
       VALUES ('${h.zip}', '${escapeSql(h.neighborhood)}', ${h.active_businesses}, ${h.hhi}, '${h.classification}', '${escapeSql(h.dominant_industry)}')`
    );
  }

  return db;
}

export function runQuery(db, sql) {
  const trimmed = sql.trim();
  if (!trimmed) {
    throw new Error("Query is empty.");
  }

  const upper = trimmed.toUpperCase();
  if (
    !upper.startsWith("SELECT") &&
    !upper.startsWith("WITH") &&
    !upper.startsWith("EXPLAIN")
  ) {
    throw new Error("Only SELECT queries are allowed in this explorer.");
  }

  const start = performance.now();
  const results = db.exec(trimmed);
  const elapsed = Math.round(performance.now() - start);

  if (!results.length) {
    return { columns: [], rows: [], rowCount: 0, elapsedMs: elapsed };
  }

  const { columns, values } = results[0];
  return {
    columns,
    rows: values,
    rowCount: values.length,
    elapsedMs: elapsed,
  };
}

export function getSchemaInfo(db) {
  const tables = db.exec(`
    SELECT name, type FROM sqlite_master
    WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
    ORDER BY type, name
  `);

  if (!tables.length) return [];

  return tables[0].values.map(([name, type]) => {
    const cols = db.exec(`PRAGMA table_info(${name})`);
    const columns = cols[0]?.values.map(([, colName, colType]) => ({
      name: colName,
      type: colType,
    })) ?? [];

    const countResult = db.exec(`SELECT COUNT(*) FROM ${name}`);
    const rowCount = countResult[0]?.values[0][0] ?? 0;

    return { name, type, columns, rowCount };
  });
}
