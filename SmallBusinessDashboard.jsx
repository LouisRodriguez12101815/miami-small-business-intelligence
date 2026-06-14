import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ComposedChart, Area } from "recharts";
import { Building2, TrendingUp, MapPin, BarChart3, Search, ChevronRight, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

// === MIAMI-DADE BUSINESS DATA (Representative sample from LBT open data) ===
const COLORS = {
  navy: "#1B3A5C", teal: "#0E7490", amber: "#D97706", red: "#9B1C1C",
  green: "#166534", bgLight: "#F1F5F9", white: "#FFFFFF", slate: "#64748b",
  tealLight: "#0e749015", navyLight: "#1B3A5C10"
};

const CHART_COLORS = ["#0E7490", "#1B3A5C", "#D97706", "#166534", "#9B1C1C", "#7c3aed", "#0891b2", "#ca8a04"];

const INDUSTRY_GROUPS = ["Food & Beverage", "Retail", "Real Estate", "Healthcare", "Technology", "Construction", "Professional Services", "Beauty & Personal Care"];

const ZIP_DATA = [
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

const REGISTRATION_TRENDS = [
  { year: 2019, "Food & Beverage": 3240, Retail: 2890, "Real Estate": 1820, Healthcare: 1450, Technology: 980, Construction: 1670, "Professional Services": 2100, "Beauty & Personal Care": 1340 },
  { year: 2020, "Food & Beverage": 1890, Retail: 1720, "Real Estate": 1540, Healthcare: 1680, Technology: 1240, Construction: 1120, "Professional Services": 1890, "Beauty & Personal Care": 780 },
  { year: 2021, "Food & Beverage": 3680, Retail: 2640, "Real Estate": 2310, Healthcare: 1720, Technology: 1560, Construction: 2080, "Professional Services": 2340, "Beauty & Personal Care": 1520 },
  { year: 2022, "Food & Beverage": 4120, Retail: 2980, "Real Estate": 2650, Healthcare: 1890, Technology: 1980, Construction: 2340, "Professional Services": 2560, "Beauty & Personal Care": 1680 },
  { year: 2023, "Food & Beverage": 4380, Retail: 3120, "Real Estate": 2420, Healthcare: 2050, Technology: 2450, Construction: 2180, "Professional Services": 2780, "Beauty & Personal Care": 1820 },
  { year: 2024, "Food & Beverage": 4650, Retail: 3340, "Real Estate": 2180, Healthcare: 2280, Technology: 2890, Construction: 2450, "Professional Services": 3020, "Beauty & Personal Care": 1950 },
];

const HERFINDAHL_DATA = ZIP_DATA.map(z => {
  const cats = [z.foodBev, z.retail, z.realEstate, z.healthcare, z.tech, z.construction, z.professional, z.beauty];
  const total = z.active;
  const hhi = cats.reduce((sum, c) => sum + Math.pow(c / total, 2), 0);
  return {
    zip: z.zip, name: z.name, active: z.active, hhi: Math.round(hhi * 1000) / 1000,
    type: hhi > 0.18 ? "Specialised" : hhi > 0.12 ? "Mixed" : "Diverse"
  };
});

const OPPORTUNITY_DATA = ZIP_DATA.map(z => ({
  zip: z.zip, name: z.name, population: Math.round(z.active * (3.2 + Math.random() * 2.8)),
  popGrowth: Math.round((Math.random() * 18 - 2) * 10) / 10,
  bizDensity: Math.round(z.active / (z.active * (3.2 + Math.random() * 2.8)) * 10000) / 10,
  techDensity: Math.round(z.tech / z.active * 100 * 10) / 10,
  healthDensity: Math.round(z.healthcare / z.active * 100 * 10) / 10,
  foodDensity: Math.round(z.foodBev / z.active * 100 * 10) / 10,
}));

// === COMPONENTS ===
const KPICard = ({ icon: Icon, label, value, sub, trend }) => (
  <div style={{ background: COLORS.white, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <div style={{ background: COLORS.tealLight, borderRadius: 8, padding: 6, display: "flex" }}>
        <Icon size={16} color={COLORS.teal} />
      </div>
      <span style={{ fontSize: 12, color: COLORS.slate, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
    </div>
    <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.navy, lineHeight: 1.1 }}>{value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
      {trend && (
        <span style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600, color: trend > 0 ? COLORS.green : trend < 0 ? COLORS.red : COLORS.slate }}>
          {trend > 0 ? <ArrowUpRight size={14} /> : trend < 0 ? <ArrowDownRight size={14} /> : <Minus size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
      <span style={{ fontSize: 12, color: COLORS.slate }}>{sub}</span>
    </div>
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "10px 20px", fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", border: "none",
    background: active ? COLORS.white : "transparent", color: active ? COLORS.teal : "rgba(255,255,255,0.75)",
    borderRadius: "8px 8px 0 0", transition: "all 0.2s",
  }}>{children}</button>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: COLORS.navy, margin: 0 }}>{children}</h3>
    {sub && <p style={{ fontSize: 12, color: COLORS.slate, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: COLORS.white, borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", ...style }}>{children}</div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: COLORS.white, border: `1px solid #e2e8f0`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: COLORS.navy }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "4px 0 0", fontSize: 12, color: p.color }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// === PAGES ===
const CityOverview = ({ selectedIndustries }) => {
  const totalActive = ZIP_DATA.reduce((s, z) => s + z.active, 0);
  const totalNew2024 = Object.values(REGISTRATION_TRENDS[5]).reduce((s, v) => typeof v === "number" && v > 100 ? s + v : s, 0);
  const totalNew2023 = Object.values(REGISTRATION_TRENDS[4]).reduce((s, v) => typeof v === "number" && v > 100 ? s + v : s, 0);
  const yoyGrowth = Math.round((totalNew2024 - totalNew2023) / totalNew2023 * 1000) / 10;
  const topZip = [...ZIP_DATA].sort((a, b) => b.active - a.active)[0];
  const diverseCount = HERFINDAHL_DATA.filter(h => h.type === "Diverse").length;

  const industryTotals = INDUSTRY_GROUPS.map((name, i) => {
    const keys = ["foodBev", "retail", "realEstate", "healthcare", "tech", "construction", "professional", "beauty"];
    const total = ZIP_DATA.reduce((s, z) => s + z[keys[i]], 0);
    return { name, value: total };
  }).sort((a, b) => b.value - a.value);

  const topZips = [...ZIP_DATA].sort((a, b) => b.active - a.active).slice(0, 12).map(z => ({
    name: z.name, zip: z.zip, active: z.active
  }));

  const filteredTrends = REGISTRATION_TRENDS.map(row => {
    const filtered = { year: row.year };
    (selectedIndustries.length ? selectedIndustries : INDUSTRY_GROUPS).forEach(ind => {
      filtered[ind] = row[ind];
    });
    return filtered;
  });
  const trendKeys = selectedIndustries.length ? selectedIndustries : INDUSTRY_GROUPS;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard icon={Building2} label="Registered Businesses" value={totalActive.toLocaleString()} sub="active in Miami-Dade" />
        <KPICard icon={TrendingUp} label="New Registrations (2024)" value={totalNew2024.toLocaleString()} sub="year-over-year" trend={yoyGrowth} />
        <KPICard icon={MapPin} label="Highest Density ZIP" value={`${topZip.zip}`} sub={topZip.name} />
        <KPICard icon={BarChart3} label="Economically Diverse ZIPs" value={diverseCount} sub={`of ${ZIP_DATA.length} analyzed`} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <SectionTitle sub="Active businesses by neighborhood, sorted by volume">Business Density by ZIP</SectionTitle>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={topZips} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.slate }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: COLORS.navy }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="active" fill={COLORS.teal} radius={[0, 4, 4, 0]} name="Active Businesses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle sub="Share of total registered businesses by sector">Industry Breakdown</SectionTitle>
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie data={industryTotals} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={130} paddingAngle={2} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true} style={{ fontSize: 11 }}>
                {industryTotals.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <Card>
          <SectionTitle sub="New business tax receipts issued per year by sector (2019–2024)">Registration Trends</SectionTitle>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={filteredTrends} margin={{ left: 10, right: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: COLORS.slate }} />
              <YAxis tick={{ fontSize: 11, fill: COLORS.slate }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {trendKeys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[INDUSTRY_GROUPS.indexOf(key) % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} name={key} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle sub="Herfindahl Index: economic diversity by ZIP">District Classification</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HERFINDAHL_DATA.sort((a, b) => b.hhi - a.hhi).map(h => (
              <div key={h.zip} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: COLORS.bgLight, borderRadius: 8, borderLeft: `4px solid ${h.type === "Specialised" ? COLORS.amber : h.type === "Mixed" ? COLORS.teal : COLORS.green}` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.navy }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.slate }}>{h.zip}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: h.type === "Specialised" ? COLORS.amber : h.type === "Mixed" ? COLORS.teal : COLORS.green }}>{h.type}</div>
                  <div style={{ fontSize: 11, color: COLORS.slate }}>HHI: {h.hhi}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const IndustryDeepDive = ({ selectedIndustry, setSelectedIndustry }) => {
  const keys = ["foodBev", "retail", "realEstate", "healthcare", "tech", "construction", "professional", "beauty"];
  const keyMap = Object.fromEntries(INDUSTRY_GROUPS.map((name, i) => [name, keys[i]]));
  const activeKey = keyMap[selectedIndustry];

  const concentrationData = ZIP_DATA.map(z => ({
    name: z.name, zip: z.zip, count: z[activeKey],
    pctOfZip: Math.round(z[activeKey] / z.active * 1000) / 10,
  })).sort((a, b) => b.count - a.count).slice(0, 12);

  const yoyData = REGISTRATION_TRENDS.map((row, i) => ({
    year: row.year, registrations: row[selectedIndustry],
    growth: i > 0 ? Math.round((row[selectedIndustry] - REGISTRATION_TRENDS[i - 1][selectedIndustry]) / REGISTRATION_TRENDS[i - 1][selectedIndustry] * 1000) / 10 : null,
  }));

  const totalInIndustry = ZIP_DATA.reduce((s, z) => s + z[activeKey], 0);
  const totalAll = ZIP_DATA.reduce((s, z) => s + z.active, 0);
  const pctShare = Math.round(totalInIndustry / totalAll * 1000) / 10;
  const topZipForIndustry = concentrationData[0];
  const latestGrowth = yoyData[yoyData.length - 1].growth;

  const corridorData = ZIP_DATA.map(z => ({
    zip: z.zip, city: z.name, active: z[activeKey], pctOfZip: Math.round(z[activeKey] / z.active * 1000) / 10,
    total: z.active
  })).sort((a, b) => b.active - a.active);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard icon={Building2} label={`${selectedIndustry} Businesses`} value={totalInIndustry.toLocaleString()} sub={`${pctShare}% of all businesses`} />
        <KPICard icon={MapPin} label="Top Concentration" value={topZipForIndustry.name} sub={`${topZipForIndustry.count.toLocaleString()} businesses`} />
        <KPICard icon={TrendingUp} label="2024 YoY Growth" value={`${latestGrowth > 0 ? "+" : ""}${latestGrowth}%`} sub="new registrations" trend={latestGrowth} />
        <KPICard icon={BarChart3} label="Avg ZIP Share" value={`${Math.round(concentrationData.reduce((s, c) => s + c.pctOfZip, 0) / concentrationData.length * 10) / 10}%`} sub="of ZIP business base" />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {INDUSTRY_GROUPS.map(ind => (
          <button key={ind} onClick={() => setSelectedIndustry(ind)} style={{
            padding: "8px 16px", fontSize: 12, fontWeight: selectedIndustry === ind ? 600 : 400, border: "none", cursor: "pointer",
            borderRadius: 20, background: selectedIndustry === ind ? COLORS.teal : COLORS.white, color: selectedIndustry === ind ? COLORS.white : COLORS.navy,
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)", transition: "all 0.2s",
          }}>{ind}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <SectionTitle sub={`${selectedIndustry} business count by neighborhood`}>Concentration by ZIP</SectionTitle>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={concentrationData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.slate }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: COLORS.navy }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={COLORS.teal} radius={[0, 4, 4, 0]} name="Businesses" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle sub={`Year-over-year new ${selectedIndustry.toLowerCase()} registrations`}>Registration Growth</SectionTitle>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={yoyData} margin={{ left: 10, right: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: COLORS.slate }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: COLORS.slate }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: COLORS.amber }} unit="%" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="registrations" fill={COLORS.teal} radius={[4, 4, 0, 0]} name="New Registrations" />
              <Line yAxisId="right" type="monotone" dataKey="growth" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 4, fill: COLORS.amber }} name="YoY Growth %" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <SectionTitle sub="All ZIP codes ranked by business count for selected industry">Top Corridors</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${COLORS.navy}` }}>
                {["Rank", "ZIP", "Neighborhood", `${selectedIndustry} Count`, "% of ZIP", "Total in ZIP"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: COLORS.navy, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {corridorData.map((row, i) => (
                <tr key={row.zip} style={{ borderBottom: "1px solid #e2e8f0", background: i % 2 === 0 ? COLORS.white : COLORS.bgLight }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: COLORS.slate }}>{i + 1}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 500, color: COLORS.navy }}>{row.zip}</td>
                  <td style={{ padding: "10px 12px", color: COLORS.navy }}>{row.city}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: Math.max(row.active / corridorData[0].active * 120, 8), height: 8, background: COLORS.teal, borderRadius: 4 }} />
                      <span style={{ fontWeight: 600, color: COLORS.navy }}>{row.active.toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 500, color: row.pctOfZip > 20 ? COLORS.amber : COLORS.slate }}>{row.pctOfZip}%</td>
                  <td style={{ padding: "10px 12px", color: COLORS.slate }}>{row.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const SectorOpportunity = ({ selectedIndustry }) => {
  const densityKey = selectedIndustry === "Technology" ? "techDensity" : selectedIndustry === "Healthcare" ? "healthDensity" : "foodDensity";
  const avgDensity = OPPORTUNITY_DATA.reduce((s, d) => s + d[densityKey], 0) / OPPORTUNITY_DATA.length;

  const gapData = OPPORTUNITY_DATA.map(d => ({
    ...d, gap: Math.round((d.popGrowth - d[densityKey]) * 10) / 10,
    isOpportunity: d.popGrowth > 5 && d[densityKey] < avgDensity,
  })).sort((a, b) => b.gap - a.gap);

  const opportunities = gapData.filter(d => d.isOpportunity);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard icon={Search} label="Opportunity ZIPs Identified" value={opportunities.length} sub={`for ${selectedIndustry}`} />
        <KPICard icon={TrendingUp} label="Avg Population Growth" value={`${Math.round(OPPORTUNITY_DATA.reduce((s, d) => s + d.popGrowth, 0) / OPPORTUNITY_DATA.length * 10) / 10}%`} sub="across analyzed ZIPs" />
        <KPICard icon={Building2} label={`Avg ${selectedIndustry} Density`} value={`${Math.round(avgDensity * 10) / 10}%`} sub="share of ZIP business base" />
        <KPICard icon={AlertTriangle} label="Largest Gap" value={gapData[0]?.name || "—"} sub={`pop growth ${gapData[0]?.popGrowth}% vs density ${gapData[0]?.[densityKey]}%`} />
      </div>

      <Card style={{ marginBottom: 20, background: "#fffbeb", border: "1px solid #fde68a" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <AlertTriangle size={20} color={COLORS.amber} style={{ marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 600, color: COLORS.navy, fontSize: 14, marginBottom: 4 }}>What this page shows</div>
            <div style={{ fontSize: 13, color: COLORS.slate, lineHeight: 1.6 }}>
              ZIP codes where population is growing but <strong>{selectedIndustry.toLowerCase()}</strong> business density is below the county average.
              These represent gaps where demand may outpace supply — directly actionable for economic development and business attraction programs.
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card>
          <SectionTitle sub="Each dot is a ZIP. Top-left quadrant = opportunity zones">Population Growth vs Business Density</SectionTitle>
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ left: 10, right: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey={densityKey} name={`${selectedIndustry} Density`} unit="%" tick={{ fontSize: 11, fill: COLORS.slate }} label={{ value: `${selectedIndustry} Density (%)`, position: "bottom", fontSize: 11, fill: COLORS.slate }} />
              <YAxis type="number" dataKey="popGrowth" name="Pop Growth" unit="%" tick={{ fontSize: 11, fill: COLORS.slate }} label={{ value: "Pop Growth (%)", angle: -90, position: "insideLeft", fontSize: 11, fill: COLORS.slate }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: COLORS.white, border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: COLORS.navy }}>{d.name} ({d.zip})</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: COLORS.slate }}>Pop Growth: <strong>{d.popGrowth}%</strong></p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.slate }}>{selectedIndustry} Density: <strong>{d[densityKey]}%</strong></p>
                    {d.isOpportunity && <p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600, color: COLORS.amber }}>⚡ Opportunity Zone</p>}
                  </div>
                );
              }} />
              <Scatter data={gapData} fill={COLORS.teal}>
                {gapData.map((d, i) => (
                  <Cell key={i} fill={d.isOpportunity ? COLORS.amber : COLORS.teal} r={d.isOpportunity ? 8 : 5} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle sub="Ranked by gap between population growth and sector density">Gap Analysis</SectionTitle>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={gapData.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: COLORS.slate }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: COLORS.navy }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="popGrowth" fill={COLORS.green} radius={[0, 4, 4, 0]} name="Pop Growth %" />
              <Bar dataKey={densityKey} fill={COLORS.teal} radius={[0, 4, 4, 0]} name={`${selectedIndustry} Density %`} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <SectionTitle sub="ZIPs with high population growth but below-average sector density">Opportunity Zones Detail</SectionTitle>
        {opportunities.length === 0 ? (
          <p style={{ color: COLORS.slate, fontSize: 13 }}>No clear opportunity gaps identified for {selectedIndustry} at current thresholds. Try selecting a different industry.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.navy}` }}>
                  {["ZIP", "Neighborhood", "Pop Growth", `${selectedIndustry} Density`, "Gap Score", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: COLORS.navy, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {opportunities.map((d, i) => (
                  <tr key={d.zip} style={{ borderBottom: "1px solid #e2e8f0", background: i % 2 === 0 ? COLORS.white : COLORS.bgLight }}>
                    <td style={{ padding: "10px 12px", fontWeight: 500, color: COLORS.navy }}>{d.zip}</td>
                    <td style={{ padding: "10px 12px", color: COLORS.navy }}>{d.name}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: COLORS.green }}>+{d.popGrowth}%</td>
                    <td style={{ padding: "10px 12px", color: COLORS.slate }}>{d[densityKey]}%</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: COLORS.amber }}>{d.gap}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ background: "#fef3c7", color: COLORS.amber, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 12 }}>Opportunity</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// === MAIN APP ===
export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState("Food & Beverage");
  const [selectedIndustries, setSelectedIndustries] = useState([]);

  const toggleIndustryFilter = (ind) => {
    setSelectedIndustries(prev => prev.includes(ind) ? prev.filter(i => i !== ind) : prev.length >= 3 ? prev : [...prev, ind]);
  };

  const tabs = ["City Overview", "Industry Deep Dive", "Sector Opportunity"];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: COLORS.bgLight, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, #234b73 100%)`, padding: "20px 32px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Creative Hub Miami · SQL & Power BI Hackathon</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: COLORS.white }}>Small Business Intelligence Dashboard</h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,0.65)" }}>Miami-Dade County · Local Business Tax Receipt Analysis · 15 ZIP Codes · 55,720 Active Businesses</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Data Source</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Miami-Dade Open Data Hub</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>US Census Bureau</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map((tab, i) => (
            <TabButton key={tab} active={activeTab === i} onClick={() => setActiveTab(i)}>{tab}</TabButton>
          ))}
        </div>
      </div>

      {/* Industry Filter Bar (for City Overview) */}
      {activeTab === 0 && (
        <div style={{ padding: "12px 32px", background: COLORS.white, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.slate }}>Filter trends:</span>
          {INDUSTRY_GROUPS.map(ind => (
            <button key={ind} onClick={() => toggleIndustryFilter(ind)} style={{
              padding: "4px 12px", fontSize: 11, fontWeight: selectedIndustries.includes(ind) ? 600 : 400,
              border: `1px solid ${selectedIndustries.includes(ind) ? COLORS.teal : "#e2e8f0"}`, cursor: "pointer",
              borderRadius: 16, background: selectedIndustries.includes(ind) ? COLORS.tealLight : COLORS.white,
              color: selectedIndustries.includes(ind) ? COLORS.teal : COLORS.slate, transition: "all 0.2s",
            }}>{ind}</button>
          ))}
          {selectedIndustries.length > 0 && (
            <button onClick={() => setSelectedIndustries([])} style={{ padding: "4px 12px", fontSize: 11, border: "none", background: "transparent", color: COLORS.red, cursor: "pointer", fontWeight: 500 }}>Clear</button>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "24px 32px 48px" }}>
        {activeTab === 0 && <CityOverview selectedIndustries={selectedIndustries} />}
        {activeTab === 1 && <IndustryDeepDive selectedIndustry={selectedIndustry} setSelectedIndustry={setSelectedIndustry} />}
        {activeTab === 2 && <SectorOpportunity selectedIndustry={selectedIndustry} />}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 32px", background: COLORS.white, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.slate }}>
        <span>Data: Miami-Dade Open Data Hub · US Census Bureau (County Business Patterns)</span>
        <span>Creative Hub Miami 2025 · Project 2: Small Business Intelligence</span>
      </div>
    </div>
  );
}
