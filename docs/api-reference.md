# 📡 API Reference

Base URL (local): `http://localhost:8000`
Base URL (production): `https://your-service.run.app`

---

## Authentication

All endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase_id_token>
```

---

## Endpoints

### `POST /audit`

Run a full bias audit on a dataset + model predictions.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dataset` | File (CSV) | ✅ | Training/test dataset with features + actual labels |
| `predictions` | File (CSV) | ✅ | Model predictions CSV with `predicted` column |
| `sensitive_attribute` | string | ✅ | Column name of protected attribute (e.g. `gender`) |
| `outcome_column` | string | ✅ | Column name of ground truth outcome (e.g. `hired`) |
| `dataset_name` | string | ❌ | Human-readable name for this audit |

**Response** `200 OK`

```json
{
  "report_id": "abc123",
  "fairness_score": 42,
  "risk_level": "HIGH",
  "metrics": {
    "disparate_impact": { "value": 0.61, "severity": "danger", "display": "0.610" },
    "demographic_parity": { "value": 0.28, "severity": "danger", "display": "28.0%" },
    "equal_opportunity": { "value": 0.19, "severity": "warning", "display": "19.0%" },
    "statistical_parity": { "value": 0.31, "severity": "danger", "display": "31.0%" },
    "class_imbalance": { "value": 0.18, "severity": "warning", "display": "18.0%" }
  },
  "group_rates": {
    "Male":   { "total": 30, "positive": 22, "rate": 0.73 },
    "Female": { "total": 20, "positive":  9, "rate": 0.45 }
  },
  "gemini_explanation": "Your AI model shows...",
  "gemini_recommendations": ["...", "...", "..."]
}
```

**Error Responses**

| Code | Reason |
|------|--------|
| `400` | Missing required fields or invalid CSV format |
| `401` | Invalid or missing Firebase token |
| `422` | Selected column not found in CSV |
| `500` | Internal server error (Gemini or Firestore failure) |

---

### `GET /reports`

List all audit reports for the authenticated user.

**Response** `200 OK`

```json
{
  "reports": [
    {
      "id": "abc123",
      "dataset_name": "hiring_data_q1.csv",
      "created_at": "2026-04-16T12:00:00Z",
      "fairness_score": 42,
      "risk_level": "HIGH",
      "sensitive_attribute": "gender"
    }
  ]
}
```

---

### `GET /reports/{report_id}`

Get a single full audit report.

**Response** `200 OK` — Full report object (same as POST /audit response)

**Error**

| Code | Reason |
|------|--------|
| `404` | Report not found |
| `403` | Report belongs to a different user |

---

### `GET /health`

Health check — no auth required.

**Response**

```json
{ "status": "ok", "version": "1.0.0" }
```

---

## CSV Format Requirements

### `dataset.csv`

Must include:
- The **sensitive attribute** column (e.g. `gender`)
- The **outcome column** (e.g. `hired`) with binary values (`0`/`1` or `yes`/`no`)
- Any other feature columns

```csv
age,gender,race,education,experience_years,hired
28,Male,White,Bachelor,3,1
34,Female,Black,Master,7,0
```

### `predictions.csv`

Must include a `predicted` column with model output values matching the same binary format as the outcome column. Rows must be in the same order as `dataset.csv`.

```csv
predicted
1
0
```
