"""
gemini_service.py — Google Gemini Pro API Integration

Sends raw bias metrics JSON to Gemini Pro and returns
a plain-language explanation + 3 engineering recommendations.

TODO: Implement full logic in next phase.
"""

import os
import json
# import google.generativeai as genai

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
# model = genai.GenerativeModel("gemini-pro")


GEMINI_PROMPT_TEMPLATE = """
You are a fairness and ethics expert in AI systems.

Here are statistical bias metrics for an AI decision-making model:
{metrics_json}

The model is being used in the context of: {use_case}
The protected attribute being analysed is: {sensitive_attribute}

Please:
1. Explain these results in simple, clear terms that a non-technical HR manager or business leader can understand.
2. Specify exactly which group(s) are being discriminated against and by how much.
3. Recommend exactly 3 specific, actionable ways the engineering team can fix the training data or model to reduce this bias.

Keep your response empathetic, clear, and solution-focused. Avoid unnecessary jargon.
"""


def get_gemini_explanation(
    metrics: dict,
    sensitive_attribute: str,
    use_case: str = "hiring decisions",
) -> dict:
    """
    Call Gemini Pro API with bias metrics and return plain-language analysis.

    Args:
        metrics:             Computed fairness metrics dict
        sensitive_attribute: The protected attribute (e.g. "gender")
        use_case:            Context of the AI model (e.g. "loan approvals")

    Returns:
        dict with keys:
            - explanation (str): Plain-language explanation
            - recommendations (list[str]): 3 fix recommendations
    """
    prompt = GEMINI_PROMPT_TEMPLATE.format(
        metrics_json=json.dumps(metrics, indent=2),
        sensitive_attribute=sensitive_attribute,
        use_case=use_case,
    )

    # TODO: implement API call
    # response = model.generate_content(prompt)
    # return parse_gemini_response(response.text)

    return {
        "explanation": "Gemini explanation — coming soon",
        "recommendations": [],
    }
