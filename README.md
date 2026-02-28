🌸 AashaMaitri
Tech-Enabled Maternal Health Risk Monitoring Platform
🚀 Overview

AashaMaitri is a full-stack AI-powered maternal health monitoring system designed to empower ASHA workers with real-time clinical insights from medical reports.

The platform enables:

📄 Uploading multiple medical reports (PDF/images)

🔎 Automatic OCR-based extraction of medical parameters

✍ Manual correction of extracted values

🤖 AI-driven maternal risk prediction

📊 Structured digital monitoring dashboard

Our goal is to reduce maternal risk through early detection, especially in rural and low-resource settings.

🎯 Problem Statement

ASHA workers currently:

Manually interpret scattered medical reports

Track values in paper registers

Lack structured risk scoring tools

Face delays in identifying high-risk pregnancies

This leads to:

Fragmented health records

Human error

Delayed intervention

Increased maternal complications

💡 Our Solution

AashaMaitri provides a seamless pipeline:

📤 Upload reports (CBC, Ultrasound, NIPT, Urine, Blood)

🔍 Extract clinical values via OCR

🧠 Predict maternal risk using ML model

📈 Display actionable insights on dashboard

⚠ Highlight high-risk pregnancies early

🏗 System Architecture
React Frontend
        ↓
Node.js Backend (Auth + Routing)
        ↓
FastAPI Microservice
        ├── OCR Engine (Tesseract)
        └── ML Risk Prediction Model

The system is modular and microservice-oriented for scalability and maintainability.

🧠 AI Model

We trained a Random Forest Classifier to predict maternal risk:

Risk Classes:

0 → LOW

1 → MEDIUM

2 → HIGH

Model Performance:

Accuracy: ~81%

Balanced class weighting

Handles missing features safely

Robust against incomplete clinical data

Key Features Used:

Blood pressure

Hemoglobin

Platelets

Fetal heart rate

Fetal movement

TSH

Blood glucose

Urine abnormalities

Trisomy indicators

And more

The model excludes gestation age and estimated fetal weight to prevent gestation bias.

🔎 OCR Engine

The OCR system:

Converts PDFs to images

Uses Tesseract for text extraction

Detects report type dynamically

Extracts numbers via anchor-based parsing

Normalizes units automatically

Handles:

Comma-separated values

OCR-split digits

Multi-word medical anchors

Garbage text between keywords and numbers

Multiple report uploads are merged into a single structured JSON.

🔐 Authentication

Secure signup/login using bcrypt

JWT-based session handling

Protected frontend routes

Scalable for role-based access

🖥 Frontend (ASHA Dashboard)

Built using:

React (Vite)

TailwindCSS

Responsive clean hospital-style UI

Features:

Login / Signup

Dashboard overview

Upload medical reports

Review extracted values

Risk prediction display

Logout

Designed specifically for ease of use by ASHA workers.

🛠 Tech Stack
Frontend

React

Vite

TailwindCSS

Axios

React Router

Backend

Node.js

Express

MySQL

bcrypt

JWT

AI & OCR Microservice

FastAPI

pytesseract

pdf2image

scikit-learn

pandas

numpy

joblib

📂 Core Features Implemented

✔ Multi-file OCR upload

✔ Content-based report type detection

✔ Structured JSON extraction

✔ Feature mapping for ML compatibility

✔ Safe missing-value handling

✔ Insufficient data detection

✔ Risk prediction API endpoint

✔ Protected frontend routing

⚙ How It Works (End-to-End Flow)

ASHA logs in

Uploads multiple reports

FastAPI performs OCR

Extracted data returned as grouped JSON

ASHA corrects any missing values

Frontend sends final structured data to ML endpoint

Model predicts risk

Risk displayed in dashboard

📈 Impact Potential

AashaMaitri can:

Reduce maternal mortality

Enable early referral for high-risk pregnancies

Digitize rural health monitoring

Improve healthcare data consistency

Support government maternal health initiatives

🔐 Security Considerations

Password hashing via bcrypt

JWT-based authentication

Protected routes

No model exposure to public

Feature validation before prediction

🚧 Future Scope

Patient database management

Risk trend tracking

Follow-up reminders

SMS alerts for high-risk cases

Cloud deployment

Government dashboard integration

Explainable AI insights

🏆 Why This Project Stands Out

Real-world rural healthcare use case

End-to-end AI integration

OCR + ML + Full-stack system

Designed for non-technical users

Modular microservice architecture

Production-minded implementation

👥 Target Beneficiaries

ASHA workers

Rural healthcare centers

Primary Health Clinics

Government health programs

Expecting mothers in underserved regions

📌 Conclusion

AashaMaitri bridges the gap between paper-based medical records and intelligent maternal risk monitoring.

It transforms:
Manual report checking → Structured AI-driven maternal risk insights.

This is not just a project.
It is a scalable foundation for rural maternal health digitization.

# # Sample .env  
# Location: backend/.env  
# Sample Database Configuration
DB_HOST=localhost  
DB_USER=root  
DB_PASSWORD=12345  
DB_NAME=pregnant  
