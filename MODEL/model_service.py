from fastapi import FastAPI, HTTPException
import pandas as pd
import numpy as np
import joblib

# ==========================================================
# LOAD MODEL
# ==========================================================

app = FastAPI(title="Maternal Risk Prediction Service")

model = joblib.load("maternal_risk_model.pkl")


# ==========================================================
# MODEL FEATURE ORDER (MUST MATCH TRAINING EXACTLY)
# ==========================================================

MODEL_FEATURES = [
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


# ==========================================================
# FEATURE MAPPING (Backend → Model)
# Backend can send simple lowercase keys
# ==========================================================

FEATURE_MAPPING = {
    "age": "Age",
    "weight": "Weight",
    "total_pregnancies": "Total Pregnancies",

    "systolic_bp": "systolic_bp (mmHg)",
    "diastolic_bp": "diastolic_bp (mmHg)",

    "blood_glucose": "blood_glucose (mg/dL)",
    "bodytemp": "BodyTemp (F)",
    "heartrate": "HeartRate (BPM)",
    "tsh": "TSH (mIU/L)",

    "hemoglobin": "Hemoglobin (g/dL)",
    "wbc": "WBC (cells/mm³)",
    "rbc": "RBC (cells/mm³)",
    "platelets": "Platelets (1000s)",
    "hct": "HCT (%)",

    "urine_transparency": "Transparency (0 - transparent, 1 - translucent)",
    "urine_glucose": "glucose (-1 no trace, 0 - negative, >1 - positive with unit)",
    "urine_protein": "protein (-1 - no trace, 0 - negative, >=1 - positive with unit)",
    "urine_color": "Color (0 - normal, 1 - abnormal)",

    "fetal_fraction": "Fetal Fraction (%)",
    "trisomy_21": "Trisomy 21 (0- Negative, -1 - couldnt trace, 1- positive)",
    "trisomy_18": "Trisomy 18 (0- Negative, -1 - couldnt trace, 1- positive)",
    "trisomy_13": "Trisomy 13 (0- Negative, -1 - couldnt trace, 1- positive)",

    "fetal_position": "Fetal Position (0- normal, 1 - abnormal)",
    "fetal_movement": "Fetal Movement (0- normal, 1 - abnormal)",
    "fetal_heart_rate": "Fetal Heart Rate (BPM)"
}


# ==========================================================
# SAFE FLOAT CONVERSION
# ==========================================================

def safe_float(value, default=0):
    try:
        if value is None:
            return default
        return float(value)
    except:
        return default


# ==========================================================
# BUILD MODEL INPUT (SAFE + ORDERED)
# ==========================================================

def build_model_input(data: dict):

    # Initialize all features to 0
    processed = {feature: 0 for feature in MODEL_FEATURES}
    filled_features = 0

    # Apply mapping
    for incoming_key, value in data.items():
        key = incoming_key.lower().strip()

        if key in FEATURE_MAPPING:
            model_key = FEATURE_MAPPING[key]
            numeric_value = safe_float(value)

            processed[model_key] = numeric_value

            if numeric_value != 0:
                filled_features += 1

    # ------------------------------------------------------
    # Medical rule: Fetal Fraction handling
    # ------------------------------------------------------

    ff = processed["Fetal Fraction (%)"]

    if ff < 0.04:
        processed["Trisomy 21"] = -1
        processed["Trisomy 18"] = -1
        processed["Trisomy 13"] = -1

    # Ensure strict feature order
    df = pd.DataFrame([processed])
    df = df[MODEL_FEATURES]
    df = df.fillna(0)

    return df, filled_features


# ==========================================================
# PREDICT RISK ENDPOINT
# ==========================================================

@app.post("/predict-risk")
async def predict_risk(payload: dict):
    try:
        X, filled_features = build_model_input(payload)

        # ---------------------------------------------
        # Insufficient data protection
        # ---------------------------------------------
        MIN_REQUIRED_FIELDS = 6

        if filled_features < MIN_REQUIRED_FIELDS:
            return {
                "risk_level": "INSUFFICIENT_DATA",
                "message": "Not enough medical parameters provided for reliable prediction.",
                "features_received": filled_features
            }

        # ---------------------------------------------
        # Predict
        # ---------------------------------------------
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]

        risk_map = {
            0: "LOW",
            1: "MEDIUM",
            2: "HIGH"
        }

        return {
            "risk_level": risk_map[prediction],
            "risk_index": int(prediction),
            "confidence_scores": {
                "LOW": float(probabilities[0]),
                "MEDIUM": float(probabilities[1]),
                "HIGH": float(probabilities[2])
            },
            "features_received": filled_features
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
