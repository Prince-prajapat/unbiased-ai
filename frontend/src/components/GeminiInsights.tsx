// components/GeminiInsights.tsx — Gemini AI explanation and recommendations
'use client'

export interface GeminiInsightsProps {
  explanation: string
  recommendations: string[]
  sensitiveAttr: string
  riskLevel: string
}

export default function GeminiInsights({
  explanation, recommendations, sensitiveAttr, riskLevel,
}: GeminiInsightsProps) {
  return (
    <div className="glass-card gemini-panel animate-in">
      <div className="gemini-header">
        <span className="gemini-icon">✨</span>
        <h2>Gemini AI Insights</h2>
        <span className={`risk-tag ${riskLevel?.toLowerCase()}`}>
          {riskLevel} Risk
        </span>
      </div>

      <div className="gemini-explanation">
        {explanation && (explanation.includes('could not be generated') || explanation.includes('API key not configured')) ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--accent-amber)' }}>AI Insights temporarily unavailable.</strong>
              {' '}The Gemini API quota has been reached or the API key needs to be configured.
              The bias metrics above are still accurate — they're calculated locally using Fairlearn.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Try again in a minute, or check your API key in the backend .env file.
            </p>
          </div>
        ) : (
          explanation || 'No AI explanation available yet.'
        )}
      </div>

      {recommendations.length > 0 && (
        <>
          <h3 style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: 'var(--text-secondary)',
          }}>
            Recommended Actions
          </h3>
          <ul className="recommendations-list">
            {recommendations.map((rec, i) => (
              <li key={i} className="recommendation-item">
                <span className="rec-number">{i + 1}</span>
                <span className="rec-text">{rec}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
