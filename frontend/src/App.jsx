import React, { useEffect, useState } from "react";
import Well from "./components/Well";
import TimeSeriesCharts from "./components/TimeSeriesCharts";

const API_BASE = "http://127.0.0.1:5000/api";

export default function App() {
  const [wells, setWells] = useState([]);
  const [selected, setSelected] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/wells`)
      .then((r) => r.json())
      .then((j) => setWells(j.wells || []));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);

    fetch(`${API_BASE}/wells/${encodeURIComponent(selected)}/data`)
      .then((r) => r.json())
      .then((j) => {
        const parsed = j.data.map((d) => ({
          ...d,
          DATEPRD: new Date(d.DATEPRD),
        }));
        setData(parsed);
      })
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="app-container">
      <h1 className="app-title">Well Data Visualizer</h1>

      <Well wells={wells} value={selected} onChange={setSelected} />

      {loading && <p className="status-text">Loading…</p>}

      {!loading && selected && data.length > 0 && (
        <TimeSeriesCharts data={data} />
      )}

      {!loading && selected && data.length === 0 && <p>No data available.</p>}
    </div>
  );
}
