import pandas as pd
import numpy as np
import re

# ---------------------------
# LOAD CSV (robust)
# ---------------------------
df = pd.read_csv("maternal_data.csv", encoding="latin1")
df.columns = df.columns.str.lower().str.strip()
np.random.seed(42)

# ---------------------------
# helper: find column by keywords
# ---------------------------
def find_col(keywords, exclude_keywords=None):
    """Return first column that contains any keyword (case-insensitive).
       keywords: list/iterable of substrings to look for.
       exclude_keywords: list of substrings that must NOT be present.
    """
    if isinstance(keywords, str):
        keywords = [keywords]
    if exclude_keywords and isinstance(exclude_keywords, str):
        exclude_keywords = [exclude_keywords]

    for c in df.columns:
        lc = c.lower()
        if exclude_keywords and any(ex in lc for ex in exclude_keywords):
            continue
        if any(kw in lc for kw in keywords):
            return c
    return None

def extract_unit(colname):
    m = re.search(r"\(([^)]+)\)", colname)
    return m.group(1).strip() if m else None

# ---------------------------
# Detect columns
# ---------------------------
cols_detect = {
    "sys_bp": ["systolic", "sys_bp"],
    "dia_bp": ["diastolic", "dia_bp"],
    "hb": ["hemoglobin", "hb "],
    "platelets": ["platelet"],
    "hct": ["hct"],
    "tsh": ["tsh"],
    "fhr": ["fetal heart"],
    "fetal_fraction": ["fetal fraction"],
    "protein": ["protein", "protein ("],
    "urine_glucose": ["urine glucose", "glucose (-1", "glucose (dipstick)"],
    "temp": ["bodytemp", "body temp", "temperature"],
    "hr": ["heart rate (bpm)", "heartrate", "heart rate"],
    "glucose": ["blood_glucose", "blood glucose", "glucose (mg"],
    "wbc": ["wbc"],
    "rbc": ["rbc", "red blood cell"],
    "efw": ["estimated fetal weight", "estimated fetal weight (g)"],
    "fetal_position": ["fetal position"],
    "fetal_movement": ["fetal movement"],
    "weight": ["weight (kg)", "weight"],
    "gestation_age": ["gestation age", "gestationage", "gestation age (weeks", "gestation age (week"],
    "total_pregnancies": ["total pregn", "total preg", "total pregnancies"],
    "trisomy21": ["trisomy 21", "trisomy21"],
    "trisomy18": ["trisomy 18", "trisomy18"],
    "trisomy13": ["trisomy 13", "trisomy13"]
}

found = {}
for key, kws in cols_detect.items():
    # special-case urine_glucose: try specific first, else find 'glucose' excluding 'blood'
    if key == "urine_glucose":
        col = find_col(kws)
        if col is None:
            col = find_col(["glucose"], exclude_keywords=["blood"])
    else:
        col = find_col(kws)
    found[key] = col

print("Detected columns (None = not found):")
for k, v in found.items():
    print(f"  {k:16s} -> {v}")

# ---------------------------
# Print units & quick stats for verification
# ---------------------------
print("\nUnits & quick stats (if column found):")
for k, col in found.items():
    if col:
        unit = extract_unit(col) or "no unit"
        s = pd.to_numeric(df[col], errors="coerce")
        print(f"\n - {k:16s} col='{col}' unit='{unit}'")
        print(s.describe().to_string())
    else:
        print(f"\n - {k:16s} -> NOT FOUND")

# ---------------------------
# Coerce numeric for all found columns (no fill; keep NaN if missing)
# ---------------------------
for col in [c for c in found.values() if c]:
    df[col] = pd.to_numeric(df[col], errors="coerce")

# ---------------------------
# Score array
# ---------------------------
score = np.zeros(len(df))

# tiny helper
def has(k): 
    return found.get(k) is not None

# ---------------------------
# MAJOR (3 pts)
# ---------------------------
if has("sys_bp") and has("dia_bp"):
    score += ((df[found["sys_bp"]] >= 160) | (df[found["dia_bp"]] >= 120)) * 3

if has("hb"):
    score += (df[found["hb"]] < 8) * 3
    score += (df[found["hb"]] > 18) * 3  # polycythemia extreme

if has("fhr"):
    score += ((df[found["fhr"]] < 110) | (df[found["fhr"]] > 160)) * 3

if has("platelets"):
    score += (df[found["platelets"]] < 100) * 3

if has("hct"):
    score += ((df[found["hct"]] < 24) | (df[found["hct"]] > 40)) * 3

if has("tsh"):
    score += (df[found["tsh"]] > 6) * 3
    score += (df[found["tsh"]] < 0.1) * 3  # very suppressed

# fetal fraction: high side is major per your ask
if has("fetal_fraction"):
    score += (df[found["fetal_fraction"]] > 20) * 3

# trisomy detection => major
for tkey in ("trisomy21", "trisomy18", "trisomy13"):
    if has(tkey):
        score += (df[found[tkey]] == 1) * 3

# ---------------------------
# MODERATE (2 pts)
# ---------------------------
if has("sys_bp") and has("dia_bp"):
    score += ((df[found["sys_bp"]] >= 140) & (df[found["sys_bp"]] < 160) | (df[found["dia_bp"]] >= 100) & (df[found["sys_bp"]] < 120)) * 2


if has("hb"):
    score += ((df[found["hb"]] >= 8) & (df[found["hb"]] < 10) | (df[found["hb"]] >= 14) & (df[found["hb"]] < 18)) * 2

if has("fetal_position"):
    score += (df[found["fetal_position"]] == 1) * 2

if has("fetal_movement"):
    score += (df[found["fetal_movement"]] == 1) * 2

if has("transparency"):
    score += (df[found["transparency"]] == 1) * 1
if has("color"):
    score += (df[found["color"]] == 1) * 1

if has("protein"):
    score += (df[found["protein"]] > 0) * 1

if has("urine_glucose"):
    score += (df[found["urine_glucose"]] > 0) * 2

# fetal fraction small -> moderate (no-call risk)
if has("fetal_fraction"):
    score += (((df[found["fetal_fraction"]] > 15 ) & (df[found["fetal_fraction"]] < 20))) * 1

# ---------------------------
# MILD (1 pt)
# ---------------------------
if has("temp"):
    score += (df[found["temp"]] > 99.5) * 1

if has("hr"):
    score += (df[found["hr"]] > 100) * 1

if has("glucose"):
    score += ((df[found["glucose"]] < 3) | (df[found["glucose"]] > 9)) * 2

# WBC: data is in 1000s -> thresholds in thousands
if has("wbc"):
    w = df[found["wbc"]]
    score += (w > 18) * 2   # more severe leukocytosis
    score += ((w > 15) & (w <= 18)) * 1
    score += (w < 4) * 1    # leukopenia mild

# RBC (both hypo & hyper)
if has("rbc"):
    r = df[found["rbc"]]
    score += (r < 3.2) * 2
    score += (r > 5.5) * 2

# ---------------------------
# NEW: total pregnancies, gestation age, weight
# score both hypo and hyper where relevant
# ---------------------------
# -------------------------------------------------
# AGE × TOTAL PREGNANCIES CORRELATED RISK
# -------------------------------------------------
if has("total_pregnancies") and has("age"):
    age = pd.to_numeric(df[found["age"]], errors="coerce")
    tp = pd.to_numeric(df[found["total_pregnancies"]], errors="coerce")

    # ---------- DATA QUALITY / EDGE ----------
    score += (tp.isna() | (tp <= 0)) * 0   # mild: missing or zero

    # ---------- YOUNG AGE HIGH PARITY ----------
    # Age < 20
    score += ((age < 20) & (tp >= 2)) * 3   # very high concern
    score += ((age < 20) & (tp == 1)) * 2

    # ---------- AGE 20–24 ----------
    score += ((age >= 20) & (age < 25) & (tp >= 3)) * 3
    score += ((age >= 20) & (age < 25) & (tp == 1)) * 2

    # ---------- AGE 25–34 (biologically safest window) ----------
    score += ((age >= 25) & (age < 35) & (tp >= 5)) * 2
    score += ((age >= 25) & (age < 35) & (tp == 4)) * 2

    # ---------- ADVANCED MATERNAL AGE ----------
    # Age ≥ 35
    score += ((age >= 35) & (tp >= 4)) * 2
    score += ((age >= 35) & (tp == 3)) * 1

    # ---------- EXTREME PARITY (ANY AGE) ----------
    score += (tp >= 6) * 3

# if has("gestation_age"):
#     ga = pd.to_numeric(df[found["gestation_age"]], errors="coerce")
#     # interpret unit as weeks (printed earlier for your verification)
#     score += (ga < 20) * 1     # early
#     score += ((ga >= 20) & (ga < 37)) * 2  # preterm/mid
#     score += ((ga >= 41) & (ga <= 42)) * 1
#     score += (ga > 42) * 2

if has("weight"):
    wt = pd.to_numeric(df[found["weight"]], errors="coerce")
    score += (wt < 35) * 3
    score += ((wt >= 35) & (wt < 45)) * 2
    score += ((wt >= 76) & (wt <= 100)) * 2
    score += (wt > 100) * 3

# ---------------------------
# FINALIZE and save
# ---------------------------
df["overall_risk_score"] = score
df["overall_risk"] = pd.cut(score, bins=[-1, 3, 7, np.inf], labels=[0, 1, 2]).astype(int)

print("\nOverall risk distribution (counts and %):")
vc = df["overall_risk"].value_counts()
print(vc)
print((vc / vc.sum() * 100).round(2))

# quick summary for new/adjusted fields (units are printed earlier)
for name in ("wbc", "fetal_fraction", "rbc", "weight", "gestation_age", "total_pregnancies"):
    col = found.get(name)
    if col:
        print(f"\n{name:15s} -> '{col}' unit='{extract_unit(col)}'")
        print(pd.to_numeric(df[col], errors="coerce").describe().to_string())
    else:
        print(f"\n{name:15s} -> NOT FOUND")

# save
df.to_csv("maternal_data_FINAL_adj_WBC_FF_trisomy.csv", index=False)
print("\nSaved to maternal_data_FINAL_adj_WBC_FF_trisomy.csv")
