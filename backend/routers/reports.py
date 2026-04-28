"""
reports.py — GET /reports Router

Retrieves audit reports from storage.
"""

from fastapi import APIRouter, Depends
from services.firestore_service import get_reports_for_user, get_report_by_id
from dependencies import get_current_user

router = APIRouter()


@router.get("/")
async def list_reports(user_id: str = Depends(get_current_user)):
    """List all audit reports."""
    reports = get_reports_for_user(user_id=user_id)

    # Return summary format expected by the frontend
    summaries = []
    for r in reports:
        summaries.append({
            "id": r.get("id", ""),
            "dataset_name": r.get("dataset_name", "Untitled"),
            "sensitive_attribute": r.get("sensitive_attribute", ""),
            "fairness_score": r.get("fairness_score", 0),
            "risk_level": r.get("risk_level", "UNKNOWN"),
            "created_at": r.get("created_at", ""),
        })

    return {"reports": summaries}


@router.get("/{report_id}")
async def get_report(report_id: str, user_id: str = Depends(get_current_user)):
    """Get a single full audit report by ID."""
    report = get_report_by_id(report_id=report_id, user_id=user_id)

    if not report:
        return {"error": "Report not found", "metrics": None}

    return report
