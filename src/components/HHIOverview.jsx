import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = {
  Specialised: "#D97706",
  Mixed: "#0E7490",
  Diverse: "#166534",
};

export default function HHIOverview({ hhiData }) {
  if (!hhiData?.length) return null;

  const sorted = [...hhiData].sort((a, b) => b.hhi - a.hhi);
  const avgHhi = hhiData.reduce((s, d) => s + d.hhi, 0) / hhiData.length;
  const counts = hhiData.reduce(
    (acc, d) => {
      acc[d.classification] = (acc[d.classification] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="hhi-overview">
      <div className="kpi-row">
        <div className="kpi-card">
          <span className="kpi-label">ZIP codes analyzed</span>
          <span className="kpi-value">{hhiData.length}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Average HHI</span>
          <span className="kpi-value">{avgHhi.toFixed(3)}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Specialised zones</span>
          <span className="kpi-value accent-amber">{counts.Specialised || 0}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Diverse zones</span>
          <span className="kpi-value accent-green">{counts.Diverse || 0}</span>
        </div>
      </div>

      <div className="chart-card">
        <h3>HHI by Neighborhood</h3>
        <p className="chart-sub">Higher values indicate greater industry concentration (less economic diversity)</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="neighborhood" width={110} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [value, "HHI"]}
              labelFormatter={(_, payload) => {
                const d = payload?.[0]?.payload;
                return d ? `${d.neighborhood} (${d.zip}) — ${d.classification}` : "";
              }}
            />
            <Bar dataKey="hhi" radius={[0, 4, 4, 0]}>
              {sorted.map((entry) => (
                <Cell key={entry.zip} fill={COLORS[entry.classification] || "#64748b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="legend">
          <span><i className="dot amber" /> Specialised (&gt;0.18)</span>
          <span><i className="dot teal" /> Mixed (0.12–0.18)</span>
          <span><i className="dot green" /> Diverse (≤0.12)</span>
        </div>
      </div>
    </div>
  );
}
