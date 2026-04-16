"""
main.py — FastAPI Application Entry Point

This file initialises the FastAPI app, sets up CORS,
loads environment variables, and registers all routers.

TODO: Implement the full body in the next development phase.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Unbiased AI — Bias Detection API",
    description="Detects and explains bias in AI model predictions using Fairlearn + Gemini Pro.",
    version="1.0.0",
)

# ─── CORS ────────────────────────────────────────────────────
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────
# from routers import audit, reports
# app.include_router(audit.router,   prefix="/audit",   tags=["Audit"])
# app.include_router(reports.router, prefix="/reports", tags=["Reports"])


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint — no auth required."""
    return {"status": "ok", "version": "1.0.0"}
