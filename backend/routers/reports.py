"""
reports.py — GET /reports Router

Retrieves audit reports from Firestore for the authenticated user.

TODO: Implement full logic in next phase.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_reports():
    """List all audit reports for the authenticated user."""
    # TODO: implement
    return {"reports": []}


@router.get("/{report_id}")
async def get_report(report_id: str):
    """Get a single full audit report by ID."""
    # TODO: implement
    return {"message": f"Report {report_id} — coming soon"}
