import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TimeSeriesCharts({ data }) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.DATEPRD.toISOString().slice(0, 10),
  }));

  const params = [
    "AVG_DOWNHOLE_PRESSURE",
    "AVG_DOWNHOLE_TEMPERATURE",
    "AVG_DP_TUBING",
    "ON_STREAM_HRS",
    "BORE_OIL_RATE (stb/d)",
  ];

  const available = params.filter((p) =>
    formatted.some((d) => d[p] !== null && d[p] !== undefined)
  );

  return (
    <div>
      {available.map((p) => (
        <div key={p} style={{ height: 300, marginBottom: 40 }}>
          <h3>{p}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatted}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={p} stroke="#000" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
