import { useCallback, useEffect, useState } from "react";
import { Database, BookOpen, ChevronRight } from "lucide-react";
import { initDatabase, runQuery, getSchemaInfo } from "../db/initDatabase.js";
import { SAMPLE_QUERIES } from "../data/seedData.js";
import { SqlEditor } from "./QueryResults.jsx";
import QueryResults from "./QueryResults.jsx";
import HHIOverview from "./HHIOverview.jsx";

export default function SqlExplorer() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sql, setSql] = useState(SAMPLE_QUERIES[0].sql);
  const [result, setResult] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [running, setRunning] = useState(false);
  const [schema, setSchema] = useState([]);
  const [hhiData, setHhiData] = useState([]);
  const [activeQueryId, setActiveQueryId] = useState("hhi-overview");

  useEffect(() => {
    let cancelled = false;

    initDatabase()
      .then((database) => {
        if (cancelled) return;
        setDb(database);
        setSchema(getSchemaInfo(database));

        const hhiResult = runQuery(
          database,
          "SELECT zip, neighborhood, hhi, classification, dominant_industry, active_businesses FROM hhi_scores ORDER BY hhi DESC"
        );
        setHhiData(
          hhiResult.rows.map(([zip, neighborhood, hhi, classification, dominant_industry, active_businesses]) => ({
            zip,
            neighborhood,
            hhi,
            classification,
            dominant_industry,
            active_businesses,
          }))
        );

        setResult(hhiResult);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRun = useCallback(() => {
    if (!db) return;
    setRunning(true);
    setQueryError(null);

    try {
      setResult(runQuery(db, sql));
    } catch (err) {
      setQueryError(err.message);
      setResult(null);
    } finally {
      setRunning(false);
    }
  }, [db, sql]);

  const selectQuery = (query) => {
    setActiveQueryId(query.id);
    setSql(query.sql);
    setQueryError(null);
  };

  if (loading) {
    return <div className="loading">Loading SQLite database…</div>;
  }

  if (error) {
    return <div className="loading error">Failed to initialize database: {error}</div>;
  }

  return (
    <div className="explorer-layout">
      <aside className="sidebar">
        <div className="sidebar-section">
          <h4><Database size={14} /> Schema</h4>
          <div className="schema-list">
            {schema.map((table) => (
              <details key={table.name} className="schema-table">
                <summary>
                  <span className="table-name">{table.name}</span>
                  <span className="table-meta">{table.rowCount} rows</span>
                </summary>
                <ul>
                  {table.columns.map((col) => (
                    <li key={col.name}>
                      <code>{col.name}</code>
                      <span>{col.type}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <h4><BookOpen size={14} /> Sample Queries</h4>
          <div className="query-list">
            {SAMPLE_QUERIES.map((q) => (
              <button
                key={q.id}
                type="button"
                className={`query-item ${activeQueryId === q.id ? "active" : ""}`}
                onClick={() => selectQuery(q)}
              >
                <ChevronRight size={14} />
                <div>
                  <strong>{q.title}</strong>
                  <span>{q.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="explorer-main">
        <HHIOverview hhiData={hhiData} />
        <SqlEditor sql={sql} onChange={setSql} onRun={handleRun} running={running} />
        <QueryResults result={result} error={queryError} />
      </main>
    </div>
  );
}
