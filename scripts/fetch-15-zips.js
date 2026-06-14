/**
 * Fetch ONLY the 15 hackathon ZIP codes from Miami-Dade LBT API.
 * Writes small summary files + src/data/businessData.js — no bulk county CSV.
 *
 * Run: npm run data:fetch
 */

import { writeFileSync, mkdirSync, unlinkSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../data/processed");
const API =
  "https://gisweb.miamidade.gov/arcgis/rest/services/BusinessTracker/MapServer/0/query";

const HACKATHON_ZIPS = [
  "33125", "33126", "33127", "33128", "33130", "33131", "33132", "33133",
  "33134", "33137", "33139", "33142", "33145", "33155", "33166",
];

const ZIP_DISPLAY_NAMES = {
  "33125": "Little Havana", "33126": "Westchester", "33127": "Wynwood",
  "33128": "Downtown", "33130": "Brickell", "33131": "Brickell Key",
  "33132": "Edgewater", "33133": "Coconut Grove", "33134": "Coral Gables",
  "33137": "Design District", "33139": "South Beach", "33142": "Allapattah",
  "33145": "Shenandoah", "33155": "Kendall", "33166": "Doral",
};

const INDUSTRY_GROUPS = [
  "Food & Beverage", "Retail", "Real Estate", "Healthcare", "Technology",
  "Construction", "Professional Services", "Beauty & Personal Care",
];

const INDUSTRY_KEYS = ["foodBev", "retail", "realEstate", "healthcare", "tech", "construction", "professional", "beauty"];

const KEYWORDS = [
  ["RESTAURANT", "FOOD", "CAFE", "BAR", "BAKERY"],
  ["RETAIL", "STORE", "SHOP", "MERCHANDISE"],
  ["REAL ESTATE", "PROPERTY", "BROKER", "LEASING", "RENTAL"],
  ["HEALTH", "MEDICAL", "DENTAL", "CLINIC", "PHARMACY"],
  ["TECH", "SOFTWARE", "IT", "COMPUTER", "DIGITAL", "DATA"],
  ["CONSTRUCTION", "CONTRACTOR", "BUILDING", "PLUMBING", "ELECTRICAL"],
  ["LAW", "ACCOUNTING", "CONSULTING", "FINANCE", "INSURANCE", "LEGAL"],
  ["BEAUTY", "SALON", "SPA", "BARBER", "NAIL"],
];

const FIELDS = "BUSNAME,OCCDESC,CLASSDESC,CATGRYNAME,BUSSDATE,ZIPCODE";
const BATCH = 1000;

function normalizeZip(z) {
  const m = String(z || "").match(/(\d{5})/);
  return m ? m[1] : "";
}

function businesstype(attrs) {
  return [attrs.OCCDESC, attrs.CLASSDESC, attrs.CATGRYNAME].filter(Boolean).join(" ").toUpperCase();
}

function classifyIndustry(text) {
  for (let i = 0; i < INDUSTRY_GROUPS.length; i++) {
    if (KEYWORDS[i].some((kw) => text.includes(kw))) return INDUSTRY_GROUPS[i];
  }
  return "Other";
}

function epochToIso(ms) {
  if (!ms || ms <= 0) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

function computeHHI(counts, total) {
  return counts.reduce((s, c) => s + Math.pow(c / total, 2), 0);
}

function classifyHHI(hhi) {
  if (hhi > 0.18) return "Specialised";
  if (hhi > 0.12) return "Mixed";
  return "Diverse";
}

function csvEscape(v) {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(path, headers, rows) {
  writeFileSync(path, [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n") + "\n");
}

async function fetchZipRecords(zip) {
  const where = `RCPTSTATUS='Active' AND ZIPCODE LIKE '${zip}%'`;
  const records = [];
  let offset = 0;

  while (true) {
    const url = `${API}?${new URLSearchParams({
      where,
      outFields: FIELDS,
      returnGeometry: "false",
      resultOffset: String(offset),
      resultRecordCount: String(BATCH),
      orderByFields: "OBJECTID",
      f: "json",
    })}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) throw new Error(JSON.stringify(data.error));

    const batch = (data.features || []).map((f) => f.attributes);
    records.push(...batch);
    if (batch.length < BATCH) break;
    offset += BATCH;
  }
  return records;
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const zipMap = new Map(
    HACKATHON_ZIPS.map((z) => [z, {
      zip: z,
      total: 0,
      counts: Object.fromEntries(INDUSTRY_GROUPS.map((g) => [g, 0])),
      trends: new Map(),
      bizSamples: Object.fromEntries(INDUSTRY_GROUPS.map((g) => [g, []])),
    }])
  );

  console.log("Fetching 15 ZIP codes from Miami-Dade LBT API (active only)...\n");

  for (const zip of HACKATHON_ZIPS) {
    const records = await fetchZipRecords(zip);
    const d = zipMap.get(zip);

    for (const r of records) {
      d.total++;
      const typeText = businesstype(r);
      const ind = classifyIndustry(typeText);
      if (ind !== "Other") {
        d.counts[ind]++;
        if (d.bizSamples[ind].length < 8 && r.BUSNAME) {
          d.bizSamples[ind].push(r.BUSNAME);
        }
      }
      const year = parseInt(epochToIso(r.BUSSDATE).slice(0, 4), 10);
      if (year >= 2019 && ind !== "Other") {
        const key = `${year}|${ind}`;
        d.trends.set(key, (d.trends.get(key) || 0) + 1);
      }
    }

    console.log(`  ${zip} ${ZIP_DISPLAY_NAMES[zip].padEnd(16)} ${String(d.total).padStart(5)} active businesses`);
    await new Promise((r) => setTimeout(r, 80));
  }

  // Build outputs
  const zipRows = [];
  const industryRows = [];
  const hhiRows = [];
  const trendMap = new Map();
  const bizRows = [];
  let bizId = 1;

  const ZIP_DATA = HACKATHON_ZIPS.map((z) => {
    const d = zipMap.get(z);
    const name = ZIP_DISPLAY_NAMES[z];
    const row = { zip: z, name, active: d.total };
    INDUSTRY_GROUPS.forEach((g, i) => { row[INDUSTRY_KEYS[i]] = d.counts[g]; });

    zipRows.push([z, name, d.total]);
    for (const g of INDUSTRY_GROUPS) industryRows.push([z, name, g, d.counts[g]]);

    const counts = INDUSTRY_GROUPS.map((g) => d.counts[g]);
    const hhi = d.total ? Math.round(computeHHI(counts, d.total) * 10000) / 10000 : 0;
    const dominant = INDUSTRY_GROUPS.reduce((best, g) => (d.counts[g] > d.counts[best] ? g : best), INDUSTRY_GROUPS[0]);
    hhiRows.push([z, name, d.total, hhi, classifyHHI(hhi), dominant]);

    for (const [key, count] of d.trends) {
      trendMap.set(key, (trendMap.get(key) || 0) + count);
    }
    for (const g of INDUSTRY_GROUPS) {
      for (const bizName of d.bizSamples[g]) {
        bizRows.push([bizId++, bizName, g, z, name, "Active"]);
      }
    }

    return row;
  });

  const years = [...new Set([...trendMap.keys()].map((k) => Number(k.split("|")[0])))].sort();
  const REGISTRATION_TRENDS = years.map((year) => {
    const row = { year };
    for (const g of INDUSTRY_GROUPS) {
      row[g] = trendMap.get(`${year}|${g}`) || 0;
    }
    return row;
  });

  const trendRows = [...trendMap.entries()]
    .map(([key, count]) => { const [y, ind] = key.split("|"); return [y, ind, count]; })
    .sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1]));

  writeCsv(join(OUT, "zip_codes.csv"), ["zip", "neighborhood", "active_businesses"], zipRows);
  writeCsv(join(OUT, "industry_counts.csv"), ["zip", "neighborhood", "industry_group", "business_count"], industryRows);
  writeCsv(join(OUT, "hhi_scores.csv"), ["zip", "neighborhood", "active_businesses", "hhi", "classification", "dominant_industry"], hhiRows);
  writeCsv(join(OUT, "registration_trends.csv"), ["year", "industry_group", "new_registrations"], trendRows);
  writeCsv(join(OUT, "businesses_sample.csv"), ["business_id", "business_name", "industry_group", "zip", "neighborhood", "status"], bizRows);

  const totalActive = zipRows.reduce((s, r) => s + Number(r[2]), 0);
  const bizModule = `// AUTO-GENERATED — 15 hackathon ZIPs only, Miami-Dade LBT API
// Source: gisweb.miamidade.gov/arcgis/rest/services/BusinessTracker/MapServer/0
// Generated: ${new Date().toISOString()}
// Refresh: npm run data:fetch

export const DATA_SOURCE = "Miami-Dade Local Business Tax (15 ZIP codes, active receipts)";
export const DATA_FETCHED_AT = "${new Date().toISOString().slice(0, 10)}";

export const INDUSTRY_GROUPS = ${JSON.stringify(INDUSTRY_GROUPS, null, 2)};

export const INDUSTRY_KEYS = ${JSON.stringify(INDUSTRY_KEYS, null, 2)};

export const ZIP_DATA = ${JSON.stringify(ZIP_DATA, null, 2)};

export const REGISTRATION_TRENDS = ${JSON.stringify(REGISTRATION_TRENDS, null, 2)};

export function computeHHI(zipRow) {
  const counts = INDUSTRY_KEYS.map((key) => zipRow[key] || 0);
  const total = zipRow.active;
  if (!total) return 0;
  return counts.reduce((sum, c) => sum + Math.pow(c / total, 2), 0);
}

export function classifyHHI(hhi) {
  if (hhi > 0.18) return "Specialised";
  if (hhi > 0.12) return "Mixed";
  return "Diverse";
}
`;

  writeFileSync(join(__dirname, "../src/data/businessData.js"), bizModule);

  // Remove bulky files if they exist from earlier runs
  for (const bulky of [
    join(__dirname, "../data/raw/lbt_active.csv"),
    join(OUT, "lbt_raw.csv"),
    join(OUT, "lbt_hackathon_zips.csv"),
  ]) {
    if (existsSync(bulky)) {
      unlinkSync(bulky);
      console.log(`\nRemoved bulky file: ${bulky}`);
    }
  }

  console.log(`\nDone. ${totalActive.toLocaleString()} active businesses across 15 ZIPs.`);
  console.log("Small files in data/processed/ (~70 KB total)");
  console.log("Dashboard updated: src/data/businessData.js");
}

main().catch((e) => { console.error(e.message); process.exit(1); });
