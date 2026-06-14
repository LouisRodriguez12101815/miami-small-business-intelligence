import { useState } from "react";
import { Play, Copy, Check, Clock, Rows3 } from "lucide-react";

export default function QueryResults({ result, error }) {
  if (error) {
    return (
      <div className="results-panel error">
        <strong>Query error</strong>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-panel empty">
        Run a query to see HHI scores, industry concentration, and business data.
      </div>
    );
  }

  const { columns, rows, rowCount, elapsedMs } = result;

  if (!rowCount) {
    return (
      <div className="results-panel empty">
        Query returned no rows ({elapsedMs}ms).
      </div>
    );
  }

  return (
    <div className="results-panel">
      <div className="results-meta">
        <span><Rows3 size={14} /> {rowCount.toLocaleString()} rows</span>
        <span><Clock size={14} /> {elapsedMs}ms</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={getCellClass(columns[j], cell)}>
                    {formatCell(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getCellClass(column, value) {
  if (column === "classification") {
    if (value === "Specialised") return "badge-specialised";
    if (value === "Mixed") return "badge-mixed";
    if (value === "Diverse") return "badge-diverse";
  }
  if (column === "hhi" && typeof value === "number") {
    if (value > 0.18) return "hhi-high";
    if (value > 0.12) return "hhi-mid";
    return "hhi-low";
  }
  return "";
}

function formatCell(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(4).replace(/\.?0+$/, "");
  }
  return String(value);
}

export function SqlEditor({ sql, onChange, onRun, running }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="sql-editor">
      <div className="sql-toolbar">
        <span className="sql-label">SQL Query</span>
        <div className="sql-actions">
          <button type="button" className="btn-ghost" onClick={handleCopy} title="Copy query">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className="btn-primary" onClick={onRun} disabled={running}>
            <Play size={14} />
            {running ? "Running…" : "Run Query"}
          </button>
        </div>
      </div>
      <textarea
        value={sql}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onRun();
          }
        }}
        spellCheck={false}
        placeholder="Write a SELECT query… (Ctrl+Enter to run)"
      />
    </div>
  );
}
