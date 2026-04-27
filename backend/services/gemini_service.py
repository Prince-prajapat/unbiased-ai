"""
gemini_service.py — Google Gemini Pro API Integration

Sends raw bias metrics JSON to Gemini Pro and returns
a plain-language explanation + 3 engineering recommendations.
"""

import os
import json
import google.generativeai as genai

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

GEMINI_PROMPT_TEMPLATE = """
You are a fairness and ethics expert in AI systems.

Here are statistical bias metrics for an AI decision-making model:
{metrics_json}

The model is being used in the context of: {use_case}
The protected attribute being analysed is: {sensitive_attribute}

Please provide your response as valid JSON with exactly this structure:
{{
  "explanation": "A clear, plain-language explanation of the bias findings (2-3 paragraphs).",
  "recommendations": [
    "First specific, actionable recommendation",
    "Second specific, actionable recommendation",
    "Third specific, actionable recommendation"
  ]
}}

Guidelines:
1. Explain the results in simple terms a non-technical HR manager or business leader can understand.
2. Specify which group(s) are being discriminated against and by how much.
3. Make the 3 recommendations specific, actionable, and engineering-focused.
4. Be empathetic, clear, and solution-focused. Avoid jargon.
5. Return ONLY the JSON, no other text.
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
    if not api_key:
        return {
            "explanation": "Gemini API key not configured. Please set GEMINI_API_KEY in your .env file to get AI-powered explanations of bias metrics.",
            "recommendations": [
                "Configure your Gemini API key to enable AI explanations.",
                "Review the raw metrics above for bias indicators.",
                "Consult your fairness team for mitigation strategies.",
            ],
        }

    prompt = GEMINI_PROMPT_TEMPLATE.format(
        metrics_json=json.dumps(metrics, indent=2),
        sensitive_attribute=sensitive_attribute,
        use_case=use_case,
    )

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Remove markdown code fences if present
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3].strip()
        if text.startswith("json"):
            text = text[4:].strip()

        parsed = json.loads(text)
        return {
            "explanation": parsed.get("explanation", ""),
            "recommendations": parsed.get("recommendations", []),
        }
    except Exception as e:
        print(f"Gemini API error: {e}")
        return {
            "explanation": f"AI analysis could not be generated: {str(e)}",
            "recommendations": [
                "Review the demographic parity metrics for disparities between groups.",
                "Check if the training data has representative samples from all groups.",
                "Consider applying bias mitigation techniques like resampling or reweighting.",
            ],
        }
