from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import pandas as pd
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "wells.csv")
DATE_COL = "DATEPRD"
WELL_COL = "NPD_WELL_BORE_NAME"

app = Flask(__name__)
CORS(app)

print("Loading dataset: ", DATA_PATH)
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"Place your dataset as {DATA_PATH}")

df = pd.read_csv(DATA_PATH, parse_dates=[DATE_COL], dayfirst=False, infer_datetime_format=True)
df = df.dropna(subset=[DATE_COL, WELL_COL])

df.columns = [c.strip() for c in df.columns]

df = df.sort_values(by=[WELL_COL, DATE_COL])

unique_wells = sorted(df[WELL_COL].dropna().unique().tolist())
print(f"Found {len(unique_wells)} wells")

def row_to_dict(row, date_col=DATE_COL):
    out = {"DATEPRD": row[date_col].isoformat()}
    for col in row.index:
        if col == date_col:
            continue
        val = row[col]
        if pd.isna(val):
            out[col] = None
        else:
            if isinstance(val, (pd.Timestamp, pd.Timedelta)):
                out[col] = str(val)
            else:
                out[col] = val
    return out

@app.route("/api/wells", methods=["GET"])
def get_wells():
    return jsonify({"wells": unique_wells})

@app.route("/api/wells/<path:well_name>/data", methods=["GET"])
def get_well_data(well_name):
    well_name = well_name
    df_w = df[df[WELL_COL] == well_name].copy()
    if df_w.empty:
        return jsonify({"error": "Well not found or no data"}), 404

    start = request.args.get("start")
    end = request.args.get("end")
    if start:
        try:
            start_ts = pd.to_datetime(start)
            df_w = df_w[df_w[DATE_COL] >= start_ts]
        except Exception:
            return jsonify({"error": "Invalid start date format"}), 400
    if end:
        try:
            end_ts = pd.to_datetime(end)
            df_w = df_w[df_w[DATE_COL] <= end_ts]
        except Exception:
            return jsonify({"error": "Invalid end date format"}), 400

    params = request.args.get("params")
    default_cols = [DATE_COL, "AVG_DOWNHOLE_PRESSURE", "AVG_DOWNHOLE_TEMPERATURE", "AVG_DP_TUBING", "ON_STREAM_HRS", "BORE_OIL_RATE (stb/d)"]
    if params:
        requested = [p.strip() for p in params.split(",") if p.strip()]
        cols = [DATE_COL] + requested
    else:
        cols = [c for c in default_cols if c in df_w.columns]

    rows = []
    for _, r in df_w[cols].iterrows():
        rows.append(row_to_dict(r, date_col=DATE_COL))

    return jsonify({"well": well_name, "count": len(rows), "data": rows})

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
