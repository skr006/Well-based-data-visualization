import React from "react";

export default function Well({ wells, value, onChange }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>Select Well: </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">-- Choose a well --</option>
        {wells.map((w) => (
          <option key={w} value={w}>
            {w}
          </option>
        ))}
      </select>
    </div>
  );
}
