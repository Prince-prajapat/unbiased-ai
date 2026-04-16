# ⚖️ Bias Metrics Explained

Reference guide for all fairness metrics computed by the Unbiased AI engine.

---

## 1. Disparate Impact Ratio

**Formula:** `min(group_rate) / max(group_rate)`

**What it measures:** How much worse off is the least-favoured group compared to the most-favoured group, expressed as a ratio.

**Legal Standard:** The EEOC's "4/5ths rule" requires this ratio to be **≥ 0.8**.

| Value | Severity | Meaning |
|-------|----------|---------|
| ≥ 0.9 | ✅ Safe | Minimal disparity |
| 0.8 – 0.9 | ⚠️ Warning | Approaching adverse impact |
| < 0.8 | 🚨 Danger | Violates EEOC 4/5ths rule |

**Example:** If 73% of men are hired but only 45% of women → DIR = 0.45/0.73 = **0.61** 🚨

---

## 2. Demographic Parity Difference

**Formula:** `max(group_rate) - min(group_rate)`

**What it measures:** The absolute gap between the group with the highest positive outcome rate and the group with the lowest.

**Ideal value:** 0.0

| Value | Severity |
|-------|----------|
| < 0.1 | ✅ Safe |
| 0.1 – 0.2 | ⚠️ Warning |
| > 0.2 | 🚨 Danger |

---

## 3. Equal Opportunity Difference

**Formula:** `TPR(privileged) - TPR(unprivileged)`

Where TPR = True Positive Rate = correctly identified positive outcomes.

**What it measures:** Whether qualified individuals from different groups have an equal chance of being correctly identified. Requires both dataset AND model predictions.

**Ideal value:** 0.0

| Value | Severity |
|-------|----------|
| < 0.1 | ✅ Safe |
| 0.1 – 0.15 | ⚠️ Warning |
| > 0.15 | 🚨 Danger |

---

## 4. Statistical Parity Difference

**Formula:** `rate(privileged group) - rate(unprivileged group)`

**What it measures:** Same as Demographic Parity but *signed*, identifying exactly which group is disadvantaged.

**Ideal value:** 0.0 (negative means unprivileged group actually benefits)

| Absolute Value | Severity |
|----------------|----------|
| < 0.1 | ✅ Safe |
| 0.1 – 0.2 | ⚠️ Warning |
| > 0.2 | 🚨 Danger |

---

## 5. Class Imbalance

**Formula:** `max deviation from equal representation across groups`

**What it measures:** Whether one demographic group is over- or under-represented in the training dataset. Imbalanced data causes models to be less accurate for minority groups.

| Value | Severity |
|-------|----------|
| < 10% | ✅ Safe |
| 10% – 25% | ⚠️ Warning |
| > 25% | 🚨 Danger |

---

## Overall Fairness Score

The overall score (0–100) is computed as a weighted average of all metric severities:

| Severity | Score contribution |
|----------|--------------------|
| ✅ Safe | 100 |
| ⚠️ Warning | 55 |
| 🚨 Danger | 10 |

**Interpretation:**

| Score | Risk Level | Meaning |
|-------|------------|---------|
| 75 – 100 | 🟢 Low Risk | Acceptable fairness |
| 50 – 74 | 🟡 Moderate Risk | Review and monitor |
| 0 – 49 | 🔴 High Risk | Immediate action required |

---

## Remediation Strategies

### Data-Level Fixes
- **Oversampling** minority groups (SMOTE)
- **Undersampling** majority groups
- **Collect more representative data**

### Algorithm-Level Fixes
- **Fairlearn ExponentiatedGradient** — adds fairness constraints to training
- **Adversarial Debiasing** — trains an adversary to remove protected attribute signal
- **Reweighing** — assigns higher weights to under-represented group samples

### Post-Processing Fixes
- **Threshold Calibration** — set different classification thresholds per group
- **Reject Option Classification** — give borderline cases the favourable outcome
