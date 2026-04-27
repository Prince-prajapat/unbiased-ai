"""
bias_engine.py — Fairlearn Bias Metrics Service

Computes all fairness metrics against a protected attribute.
Called by the /audit router after parsing uploaded CSVs.
"""

import pandas as pd
from fairlearn.metrics import (
    demographic_parity_difference,
    equalized_odds_difference,
    MetricFrame,
)
from sklearn.metrics import accuracy_score
import numpy as np


def run_full_analysis(
    dataset_df: pd.DataFrame,
    predictions_df: pd.DataFrame,
    sensitive_attribute: str,
    outcome_column: str,
) -> dict:
    """
    Run complete bias analysis using Fairlearn.

    Steps:
    1. Extract sensitive feature column
    2. Extract ground truth (y_true) and predictions (y_pred)
    3. Compute MetricFrame per group
    4. Compute Disparate Impact, Demographic Parity, Equal Opportunity
    5. Compute class imbalance
    6. Calculate overall fairness score
    7. Return structured results dict
    """
    # Extract columns
    sensitive = dataset_df[sensitive_attribute].astype(str)
    y_true = dataset_df[outcome_column].astype(int)

    # Get predictions — use the first column if only one exists
    if predictions_df.shape[1] == 1:
        y_pred = predictions_df.iloc[:, 0].astype(int)
    elif outcome_column in predictions_df.columns:
        y_pred = predictions_df[outcome_column].astype(int)
    else:
        y_pred = predictions_df.iloc[:, 0].astype(int)

    # Ensure same length
    min_len = min(len(y_true), len(y_pred), len(sensitive))
    y_true = y_true.iloc[:min_len]
    y_pred = y_pred.iloc[:min_len]
    sensitive = sensitive.iloc[:min_len]

    # ── Compute MetricFrame ──────────────────────────────
    metric_frame = MetricFrame(
        metrics=accuracy_score,
        y_true=y_true,
        y_pred=y_pred,
        sensitive_features=sensitive,
    )

    # ── Demographic Parity Difference ────────────────────
    dpd = demographic_parity_difference(
        y_true=y_true,
        y_pred=y_pred,
        sensitive_features=sensitive,
    )

    # ── Equalized Odds Difference ────────────────────────
    try:
        eod = equalized_odds_difference(
            y_true=y_true,
            y_pred=y_pred,
            sensitive_features=sensitive,
        )
    except Exception:
        eod = 0.0

    # ── Group-wise Rates ─────────────────────────────────
    groups = sensitive.unique()
    group_rates = {}
    for g in groups:
        mask = sensitive == g
        total = int(mask.sum())
        positive = int(y_pred[mask].sum())
        rate = positive / total if total > 0 else 0
        group_rates[str(g)] = {
            "total": total,
            "positive": positive,
            "rate": round(rate, 4),
        }

    # ── Disparate Impact Ratio ───────────────────────────
    rates = [gr["rate"] for gr in group_rates.values() if gr["rate"] > 0]
    if len(rates) >= 2:
        disparate_impact = min(rates) / max(rates) if max(rates) > 0 else 0
    else:
        disparate_impact = 1.0

    # ── Class Imbalance ──────────────────────────────────
    positive_count = int(y_true.sum())
    total_count = len(y_true)
    class_imbalance = abs(0.5 - (positive_count / total_count)) * 2 if total_count > 0 else 0

    # ── Fairness Score (0–100) ───────────────────────────
    # Weighted combination: lower differences = higher score
    dpd_score = max(0, 1 - abs(dpd)) * 100
    eod_score = max(0, 1 - abs(eod)) * 100
    di_score = min(disparate_impact, 1.0) * 100
    ci_score = max(0, 1 - class_imbalance) * 100

    fairness_score = round(
        dpd_score * 0.3 + eod_score * 0.3 + di_score * 0.25 + ci_score * 0.15
    )

    # ── Risk Level ───────────────────────────────────────
    if fairness_score >= 80:
        risk_level = "LOW"
    elif fairness_score >= 50:
        risk_level = "MODERATE"
    else:
        risk_level = "HIGH"

    return {
        "metrics": {
            "demographic_parity_difference": round(float(dpd), 4),
            "equalized_odds_difference": round(float(eod), 4),
            "disparate_impact_ratio": round(float(disparate_impact), 4),
            "class_imbalance": round(float(class_imbalance), 4),
            "overall_accuracy": round(float(metric_frame.overall), 4),
            "group_accuracy": {
                str(k): round(float(v), 4)
                for k, v in metric_frame.by_group.items()
            },
        },
        "group_rates": group_rates,
        "fairness_score": fairness_score,
        "risk_level": risk_level,
    }
