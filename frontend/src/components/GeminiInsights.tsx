// components/GeminiInsights.tsx
// TODO: Implement in next phase

/**
 * Displays Gemini Pro's AI-generated explanation and recommendations.
 *
 * Props:
 *  - explanation:      string     — Gemini's plain-language analysis
 *  - recommendations:  string[]   — 3 actionable fix suggestions
 *  - sensitiveAttr:    string     — the protected attribute analysed
 *  - riskLevel:        string     — "LOW" | "MODERATE" | "HIGH"
 *
 * Visual design:
 *  - Google Gemini branding / sparkle icon
 *  - Animated text reveal (typewriter effect)
 *  - Numbered recommendation cards
 *  - Distinct panel with gradient border
 */

export interface GeminiInsightsProps {
  explanation: string
  recommendations: string[]
  sensitiveAttr: string
  riskLevel: string
}

export default function GeminiInsights(props: GeminiInsightsProps) {
  // TODO: implement
  return (
    <div>
      <h2>✨ Gemini AI Insights</h2>
      <p>{props.explanation}</p>
      <ol>
        {props.recommendations.map((r, i) => <li key={i}>{r}</li>)}
      </ol>
    </div>
  )
}
