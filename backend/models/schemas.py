"""
schemas.py — Pydantic Request / Response Models

Defines all data shapes for the API.
TODO: Implement full schemas in next phase.
"""

from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime


class MetricResult(BaseModel):
    value: float
    severity: str          # "safe" | "warning" | "danger"
    display: str           # Human-readable value string


class GroupRate(BaseModel):
    total: int
    positive: int
    rate: float


class AuditResponse(BaseModel):
    report_id: str
    fairness_score: int
    risk_level: str        # "LOW" | "MODERATE" | "HIGH"
    sensitive_attribute: str
    outcome_column: str
    metrics: Dict[str, MetricResult]
    group_rates: Dict[str, GroupRate]
    gemini_explanation: str
    gemini_recommendations: List[str]
    created_at: datetime


class ReportSummary(BaseModel):
    id: str
    dataset_name: Optional[str]
    created_at: datetime
    fairness_score: int
    risk_level: str
    sensitive_attribute: str


class ReportsListResponse(BaseModel):
    reports: List[ReportSummary]
