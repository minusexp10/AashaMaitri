import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# ===============================
# LOAD DATA
# ===============================
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "maternal_data.csv")

df = pd.read_csv(csv_path, encoding="latin1")


print("\nCOLUMNS IN CSV:\n")
print(df.columns.tolist())

# Remove non-data rows
df = df[pd.to_numeric(df["Overall Risk"], errors="coerce").notna()]
df["Overall Risk"] = df["Overall Risk"].astype(int)

# ===============================
# REMOVE FEATURES (IMPORTANT CHANGE)
# ===============================

FEATURES = [
    "Age",
    "Weight",
    "Total Pregnancies",
    # ❌ Removed: "Gestation Age (weeks)"
    "systolic_bp (mmHg)",
    "diastolic_bp (mmHg)",
    "blood_glucose (mg/dL)",
    "BodyTemp (F)",
    "HeartRate (BPM)",
    "TSH (mIU/L)",
    "Hemoglobin (g/dL)",
    "WBC (cells/mm³)",
    "RBC (cells/mm³)",
    "Platelets (1000s)",
    "HCT (%)",
    "Transparency (0 - transparent, 1 - translucent)",
    "glucose (-1 no trace, 0 - negative, >1 - positive with unit)",
    "protein (-1 - no trace, 0 - negative, >=1 - positive with unit)",
    "Color (0 - normal, 1 - abnormal)",
    "Fetal Fraction (%)",
    "Trisomy 21 (0- Negative, -1 - couldnt trace, 1- positive)",
    "Trisomy 18 (0- Negative, -1 - couldnt trace, 1- positive)",
    "Trisomy 13 (0- Negative, -1 - couldnt trace, 1- positive)",
    # ❌ Removed: "Estimated Fetal Weight (g)"
    "Fetal Position (0- normal, 1 - abnormal)",
    "Fetal Movement (0- normal, 1 - abnormal)",
    "Fetal Heart Rate (BPM)"
]

# Fix unit mismatch if needed
df.rename(
    columns={"blood_glucose (mmol/L)": "blood_glucose (mg/dL)"},
    inplace=True
)

# Ensure all FEATURES exist
for col in FEATURES:
    if col not in df.columns:
        df[col] = 0

# Drop rows with missing target
df = df.dropna(subset=["Overall Risk"])

X = df[FEATURES]
y = df["Overall Risk"]

print("\nClass distribution:")
print(y.value_counts())

# ===============================
# TRAIN / TEST SPLIT
# ===============================
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ===============================
# MODEL
# ===============================
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    min_samples_split=10,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)

# ===============================
# TRAIN
# ===============================
model.fit(X_train, y_train)

# ===============================
# EVALUATION
# ===============================
y_pred = model.predict(X_test)

print("\nCLASSIFICATION REPORT:\n")
print(classification_report(y_test, y_pred, target_names=["LOW", "MEDIUM", "HIGH"]))

print("\nCONFUSION MATRIX:\n")
print(confusion_matrix(y_test, y_pred))

# ===============================
# SAVE MODEL
# ===============================
joblib.dump(model, "maternal_risk_model.pkl")
print("\nModel saved as maternal_risk_model.pkl")
