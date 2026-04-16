"""
audit.py — POST /audit Router

Receives dataset + predictions CSVs, runs bias analysis,
calls Gemini for explanation, saves to Firestore.

TODO: Implement full logic in next phase.
"""

from fastapi import APIRouter, UploadFile, File, Form, Depends
# from services.bias_engine import run_full_analysis
# from services.gemini_service import get_gemini_explanation
# from services.firestore_service import save_audit_report

router = APIRouter()


@router.post("/")
async def run_audit(
    dataset: UploadFile     = File(...,  description="CSV with features + actual labels"),
    predictions: UploadFile = File(...,  description="CSV with model predicted column"),
    sensitive_attribute: str= Form(...,  description="Protected attribute column name"),
    outcome_column: str     = Form(...,  description="Ground truth outcome column name"),
    dataset_name: str       = Form(None, description="Optional human-readable dataset name"),
):
    """
    Run a full bias audit:
    1. Parse CSVs
    2. Compute Fairlearn metrics
    3. Send to Gemini Pro for plain-language explanation
    4. Save report to Firestore
    5. Return full audit result
    """
    # TODO: implement
    return {"message": "Audit endpoint — coming soon"}
