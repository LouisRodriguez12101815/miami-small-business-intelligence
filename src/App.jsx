import { useState, lazy, Suspense } from "react";
import SqlExplorer from "./components/SqlExplorer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const SmallBusinessDashboard = lazy(() => import("../SmallBusinessDashboard.jsx"));

export default function App() {
  const [view, setView] = useState("sql");

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Creative Hub Miami · SQL Hackathon</p>
          <h1>Miami-Dade HHI Business Intelligence</h1>
          <p className="subtitle">
            Query Herfindahl-Hirschman Index scores, industry concentration, and business data across 15 ZIP codes
          </p>
        </div>
        <nav className="view-tabs">
          <button
            type="button"
            className={view === "sql" ? "active" : ""}
            onClick={() => setView("sql")}
          >
            SQL Explorer
          </button>
          <button
            type="button"
            className={view === "dashboard" ? "active" : ""}
            onClick={() => setView("dashboard")}
          >
            Visual Dashboard
          </button>
        </nav>
      </header>

      {view === "sql" ? (
        <ErrorBoundary>
          <SqlExplorer />
        </ErrorBoundary>
      ) : (
        <Suspense fallback={<div className="loading">Loading visual dashboard…</div>}>
          <SmallBusinessDashboard />
        </Suspense>
      )}
    </div>
  );
}
