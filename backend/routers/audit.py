"""
audit.py — POST /audit Router

Receives dataset + predictions CSVs, runs bias analysis,
calls Gemini for explanation, saves to storage, and returns full results.
"""

import io
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Form
from services.bias_engine import run_full_analysis
from services.gemini_service import get_gemini_explanation
from services.firestore_service import save_audit_report
from fastapi import Depends
from dependencies import get_current_user

router = APIRouter()


@router.post("/")
async def run_audit(
    dataset: UploadFile     = File(...,  description="CSV with features + actual labels"),
    predictions: UploadFile = File(...,  description="CSV with model predicted column"),
    sensitive_attribute: str= Form(...,  description="Protected attribute column name"),
    outcome_column: str     = Form(...,  description="Ground truth outcome column name"),
    dataset_name: str       = Form(None, description="Optional human-readable dataset name"),
    user_id: str            = Depends(get_current_user),
):
    """
    Run a full bias audit:
    1. Parse CSVs
    2. Compute Fairlearn metrics
    3. Send to Gemini Pro for plain-language explanation
    4. Save report to storage
    5. Return full audit result
    """
    # ── 1. Parse CSVs ────────────────────────────────────────
    dataset_bytes = await dataset.read()
    predictions_bytes = await predictions.read()

    dataset_df = pd.read_csv(io.BytesIO(dataset_bytes))
    predictions_df = pd.read_csv(io.BytesIO(predictions_bytes))

    # ── 2. Run bias analysis ─────────────────────────────────
    analysis = run_full_analysis(
        dataset_df=dataset_df,
        predictions_df=predictions_df,
        sensitive_attribute=sensitive_attribute,
        outcome_column=outcome_column,
    )

    # ── 3. Get Gemini explanation ────────────────────────────
    gemini = get_gemini_explanation(
        metrics=analysis["metrics"],
        sensitive_attribute=sensitive_attribute,
        use_case=dataset_name or "general AI decision-making",
    )

    # ── 4. Build full report ─────────────────────────────────
    report = {
        "dataset_name": dataset_name or dataset.filename or "Untitled",
        "sensitive_attribute": sensitive_attribute,
        "outcome_column": outcome_column,
        "fairness_score": analysis["fairness_score"],
        "risk_level": analysis["risk_level"],
        "metrics": analysis["metrics"],
        "group_rates": analysis["group_rates"],
        "gemini": gemini,
    }

    # ── 5. Save & return ─────────────────────────────────────
    report_id = save_audit_report(user_id=user_id, report=report)

    return {
        "report_id": report_id,
        **report,
    }
