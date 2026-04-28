"""
firestore_service.py — Firebase Firestore Operations

Handles reading and writing audit reports.
Falls back to in-memory storage if Firebase credentials are not configured.
"""

import os
import uuid
from datetime import datetime

# ── Try to initialise Firebase, fall back to in-memory ──────
_db = None
try:
    creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    project_id = os.getenv("FIREBASE_PROJECT_ID")
    private_key = os.getenv("FIREBASE_PRIVATE_KEY")
    client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
    
    import firebase_admin
    from firebase_admin import credentials, firestore
    
    if creds_path and os.path.exists(creds_path):
        if not firebase_admin._apps:
            cred = credentials.Certificate(creds_path)
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
        print("✅ Firestore connected (via JSON file)")
    elif project_id and private_key and client_email:
        if not firebase_admin._apps:
            # Replace escaped newlines if they are passed from env vars
            private_key = private_key.replace('\\n', '\n')
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": project_id,
                "private_key": private_key,
                "client_email": client_email,
                "token_uri": "https://oauth2.googleapis.com/token",
            })
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
        print("✅ Firestore connected (via Env Vars)")
    else:
        print("⚠️  Firebase credentials not found — using in-memory storage")
except Exception as e:
    print(f"⚠️  Firebase init failed ({e}) — using in-memory storage")

# In-memory fallback
_memory_store: dict[str, dict] = {}

COLLECTION_AUDITS = "audits"


def save_audit_report(user_id: str, report: dict) -> str:
    """
    Save a full audit report. Uses Firestore if available, otherwise in-memory.

    Args:
        user_id: Firebase UID of the authenticated user
        report:  Full audit result dict

    Returns:
        report_id (str): The document ID
    """
    report_id = str(uuid.uuid4())[:8]
    doc = {
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
        **report,
    }

    if _db:
        doc_ref = _db.collection(COLLECTION_AUDITS).document(report_id)
        doc_ref.set(doc)
    else:
        _memory_store[report_id] = doc

    return report_id


def get_reports_for_user(user_id: str) -> list:
    """
    Retrieve all audit reports (optionally filtered by user).

    Returns:
        List of report summary dicts
    """
    if _db:
        docs = _db.collection(COLLECTION_AUDITS).stream()
        results = []
        for doc in docs:
            d = doc.to_dict()
            d["id"] = doc.id
            results.append(d)
        return results
    else:
        results = []
        for rid, doc in _memory_store.items():
            d = {**doc, "id": rid}
            results.append(d)
        return results


def get_report_by_id(report_id: str, user_id: str = None) -> dict | None:
    """
    Retrieve a single audit report by ID.

    Returns:
        Report dict or None if not found
    """
    if _db:
        doc = _db.collection(COLLECTION_AUDITS).document(report_id).get()
        if doc.exists:
            d = doc.to_dict()
            d["id"] = doc.id
            return d
        return None
    else:
        doc = _memory_store.get(report_id)
        if doc:
            return {**doc, "id": report_id}
        return None
