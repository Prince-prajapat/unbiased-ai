# 🛡️ Unbiased AI — Bias Detection & Fairness Audit Platform

> **Google Hackathon 2026** — Ensuring Fairness and Detecting Bias in Automated Decisions

Computer programs now make life-changing decisions about who gets a job, a bank loan, or medical care. If these programs learn from flawed historical data, they repeat and amplify those same discriminatory mistakes.

**Unbiased AI** gives organizations a clear, accessible way to inspect datasets and AI models for hidden discrimination — and fix it before it impacts real people.

---

## 🌟 Live Demo

> _Coming soon — Deployed on Vercel + Google Cloud Run_

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (AI Engineer / HR Manager)          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Firebase Auth (Login)
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               FRONTEND — Next.js (Vercel)                       │
│   Upload CSV  →  View Dashboard  →  Read Audit Reports          │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP (REST API)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND — FastAPI (Google Cloud Run)              │
│                                                                 │
│  ┌──────────────┐   ┌──────────────────┐   ┌───────────────┐   │
│  │  Fairlearn   │   │  Gemini Pro API  │   │  Firestore    │   │
│  │  Bias Engine │──▶│  AI Explainer    │──▶│  Storage      │   │
│  └──────────────┘   └──────────────────┘   └───────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### How it Works — Step by Step

| Step | What Happens |
|------|-------------|
| **1. Login** | AI Engineer authenticates via **Firebase Auth** |
| **2. Upload** | Engineer uploads dataset CSV + model predictions CSV via Next.js frontend |
| **3. API Call** | Frontend sends files to **FastAPI backend** hosted on **Google Cloud Run** |
| **4. Bias Analysis** | Python backend uses **Fairlearn** to compute fairness metrics (Disparate Impact, Equal Opportunity Difference, Demographic Parity, etc.) against protected attributes (Gender, Race, Age) |
| **5. Gemini Explains** | Raw JSON metrics are passed to **Gemini Pro** with a prompt asking it to explain results in plain English, identify who is discriminated against, and recommend 3 engineering fixes |
| **6. Save Report** | Full audit report (metrics + Gemini analysis) saved to **Firebase Firestore** |
| **7. Dashboard** | Frontend reads from Firestore and renders interactive charts, flags, feature importance, and Gemini's recommendations |

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Interactive dashboard UI |
| **Styling** | Tailwind CSS | Design system |
| **Auth** | Firebase Authentication | Secure user login |
| **Database** | Firebase Firestore | Storing audit reports |
| **Backend** | FastAPI (Python) | REST API for bias analysis |
| **ML / Fairness** | Fairlearn, scikit-learn, pandas | Computing bias metrics |
| **AI** | Google Gemini Pro API | Plain-language explanations + recommendations |
| **Deployment (BE)** | Google Cloud Run | Containerized backend |
| **Deployment (FE)** | Vercel | Frontend hosting |
| **Containerization** | Docker | Backend packaging |

---

## 📁 Project Structure

```
unbiased-ai/
│
├── README.md
├── .gitignore
├── LICENSE
│
├── frontend/                        # Next.js Application
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── .env.example                 # Environment variable template
│   │
│   └── src/
│       ├── app/
│       │   ├── layout.tsx           # Root layout with Firebase provider
│       │   ├── page.tsx             # Landing / login page
│       │   ├── dashboard/
│       │   │   └── page.tsx         # Main audit dashboard
│       │   ├── upload/
│       │   │   └── page.tsx         # CSV upload page
│       │   └── reports/
│       │       └── [id]/page.tsx    # Individual audit report
│       │
│       ├── components/
│       │   ├── ui/                  # Reusable UI components
│       │   ├── charts/              # Chart components
│       │   │   ├── OutcomeRateChart.tsx
│       │   │   ├── RadarChart.tsx
│       │   │   └── FeatureImportance.tsx
│       │   ├── BiasMetricCard.tsx   # Individual metric display
│       │   ├── GeminiInsights.tsx   # Gemini recommendation panel
│       │   └── UploadZone.tsx       # Drag-and-drop file upload
│       │
│       └── lib/
│           ├── firebase.ts          # Firebase config + init
│           ├── firestore.ts         # Firestore read/write helpers
│           └── api.ts               # Backend API calls
│
├── backend/                         # FastAPI Application
│   ├── main.py                      # FastAPI app entry point
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Container definition
│   ├── .env.example                 # Environment variable template
│   │
│   ├── routers/
│   │   ├── audit.py                 # POST /audit endpoint
│   │   └── reports.py               # GET /reports endpoint
│   │
│   ├── services/
│   │   ├── bias_engine.py           # Fairlearn bias metrics computation
│   │   ├── gemini_service.py        # Gemini Pro API integration
│   │   └── firestore_service.py     # Firebase/Firestore operations
│   │
│   └── models/
│       └── schemas.py               # Pydantic request/response schemas
│
└── docs/
    ├── architecture.md              # Detailed system design
    ├── api-reference.md             # API endpoint documentation
    └── bias-metrics.md              # Explanation of each metric
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Docker** (for running backend locally)
- **Git**
- A **Google Cloud** account
- A **Firebase** project
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/unbiased-ai.git
cd unbiased-ai
```

---

### Step 2 — Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Create a new project**
2. Enable **Authentication** → Sign-in method → **Email/Password**
3. Enable **Firestore Database** → Start in test mode
4. Go to **Project Settings** → **General** → scroll to "Your apps" → Add a **Web App**
5. Copy the Firebase config object — you'll need it in Step 4

---

### Step 3 — Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy the env template
cp .env.example .env
```

Edit `backend/.env` and fill in:

```env
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
```

**Get your Firebase Service Account Key:**
1. Firebase Console → Project Settings → **Service Accounts**
2. Click **Generate new private key** → Download JSON
3. Save it as `backend/serviceAccountKey.json`

Run the backend locally:

```bash
uvicorn main:app --reload --port 8000
```

API will be live at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

---

### Step 4 — Frontend Setup (Next.js)

```bash
cd frontend

# Install dependencies
npm install

# Copy env template
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
# Firebase Config (from Step 2)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Backend API (local or deployed)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Frontend live at: `http://localhost:3000`

---

### Step 5 — Run with Docker (Full Stack)

```bash
# From project root
docker compose up --build
```

This starts:
- Frontend at `http://localhost:3000`
- Backend at `http://localhost:8000`

---

## ☁️ Deployment

### Deploy Backend to Google Cloud Run

```bash
cd backend

# Build Docker image
docker build -t unbiased-ai-backend .

# Tag for GCR
docker tag unbiased-ai-backend gcr.io/YOUR_PROJECT_ID/unbiased-ai-backend

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/unbiased-ai-backend

# Deploy to Cloud Run
gcloud run deploy unbiased-ai-backend \
  --image gcr.io/YOUR_PROJECT_ID/unbiased-ai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key,FIREBASE_PROJECT_ID=your_id
```

### Deploy Frontend to Vercel

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Update `NEXT_PUBLIC_API_URL` in your Vercel environment variables to point to your Cloud Run URL.

---

## 📊 Fairness Metrics Explained

| Metric | Description | Threshold |
|--------|-------------|-----------|
| **Disparate Impact Ratio** | Ratio of positive outcome rates between groups. EEOC requires ≥ 0.8 | < 0.8 = 🚨 Danger |
| **Demographic Parity Difference** | Max difference in positive outcome rates across groups | > 0.2 = 🚨 Danger |
| **Equal Opportunity Difference** | Difference in true positive rates across groups | > 0.1 = ⚠️ Warning |
| **Statistical Parity Difference** | Signed gap: privileged group rate − unprivileged group rate | > 0.2 = 🚨 Danger |
| **Class Imbalance** | How unevenly groups are represented in training data | > 25% = ⚠️ Warning |

---

## 🤖 Gemini Integration

The backend sends raw metric JSON to Gemini Pro with this prompt structure:

```
Here are statistical bias metrics for an HR screening AI model:
{metrics_json}

Please:
1. Explain these results in simple terms that HR managers (non-technical) can understand.
2. Specify exactly which group(s) are being discriminated against and by how much.
3. Recommend 3 specific ways the engineering team can fix the training data or model.

Keep your response clear, empathetic, and actionable.
```

Gemini's response is stored in Firestore and displayed on the dashboard alongside the charts.

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

## 👥 Team

Built with ❤️ for **Google Hackathon 2026**

> _"Fairness is not a feature — it's a foundation."_
