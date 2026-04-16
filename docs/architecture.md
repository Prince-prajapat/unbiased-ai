# 🏗️ System Architecture

## Overview

Unbiased AI is a full-stack bias detection platform. Below is the detailed system design.

## Component Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │           Next.js Frontend (Vercel)                         │   │
│   │                                                             │   │
│   │  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐  │   │
│   │  │  Upload  │  │ Dashboard │  │  Reports  │  │  Login  │  │   │
│   │  │   Page   │  │   Page    │  │   Page    │  │   Page  │  │   │
│   │  └──────────┘  └───────────┘  └───────────┘  └─────────┘  │   │
│   └─────────────────────┬───────────────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────────────────┘
                          │
              ┌───────────┴────────────┐
              │                        │
         REST API                Firebase SDK
              │                        │
              ▼                        ▼
┌─────────────────────┐    ┌─────────────────────────┐
│  FastAPI Backend    │    │  Firebase Services      │
│  (Cloud Run)        │    │                         │
│                     │    │  ┌──────────────────┐   │
│  ┌───────────────┐  │    │  │ Authentication   │   │
│  │ /audit POST   │  │    │  └──────────────────┘   │
│  │ /reports GET  │  │    │  ┌──────────────────┐   │
│  └───────┬───────┘  │    │  │   Firestore DB   │   │
│          │          │    │  └──────────────────┘   │
│  ┌───────▼───────┐  │    └─────────────────────────┘
│  │ Bias Engine   │  │
│  │ (Fairlearn)   │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │ Gemini Pro    │  │
│  │ API Client    │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────▼───────┐  │
│  │ Firestore     │  │
│  │ Service       │  │
│  └───────────────┘  │
└─────────────────────┘
```

## Data Flow

### Audit Request Flow
```
User uploads CSV files
        │
        ▼
Frontend validates file types + size
        │
        ▼
POST /audit  (multipart/form-data)
  - dataset.csv       ← original training/test data
  - predictions.csv   ← model's output predictions
  - config.json       ← protected attributes, outcome column
        │
        ▼
FastAPI receives files → saves temporarily
        │
        ▼
bias_engine.py runs Fairlearn metrics
  - Disparate Impact Ratio
  - Demographic Parity Difference
  - Equal Opportunity Difference
  - Statistical Parity Difference
  - Class Imbalance Score
        │
        ▼
Raw metrics JSON → gemini_service.py
  - Sends to Gemini Pro with structured prompt
  - Receives plain-language explanation
        │
        ▼
firestore_service.py saves:
  - audit_report (full metrics + gemini text)
  - timestamp, user_id, dataset_name
        │
        ▼
Response: { report_id, score, summary }
        │
        ▼
Frontend redirects to /reports/{report_id}
        │
        ▼
Firestore listener renders live dashboard
```

## Database Schema (Firestore)

### Collection: `audits`
```json
{
  "id": "auto-generated",
  "user_id": "firebase_uid",
  "dataset_name": "hiring_data_q1.csv",
  "created_at": "timestamp",
  "fairness_score": 42,
  "risk_level": "HIGH",
  "sensitive_attribute": "gender",
  "outcome_column": "hired",
  "metrics": {
    "disparate_impact": { "value": 0.61, "severity": "danger" },
    "demographic_parity": { "value": 0.28, "severity": "danger" },
    "equal_opportunity": { "value": 0.19, "severity": "warning" },
    "statistical_parity": { "value": 0.31, "severity": "danger" },
    "class_imbalance": { "value": 0.18, "severity": "warning" }
  },
  "group_rates": {
    "Male":   { "total": 30, "positive": 22, "rate": 0.73 },
    "Female": { "total": 20, "positive":  9, "rate": 0.45 }
  },
  "gemini_explanation": "Your AI model shows significant gender bias...",
  "gemini_recommendations": [
    "Oversample female candidates in training data",
    "Apply fairness constraints using Fairlearn ExponentiatedGradient",
    "Implement post-processing threshold calibration"
  ]
}
```

### Collection: `users`
```json
{
  "uid": "firebase_uid",
  "email": "user@company.com",
  "display_name": "Jane Smith",
  "created_at": "timestamp",
  "audit_count": 12
}
```
