// components/BiasMetricCard.tsx
// TODO: Implement in next phase

/**
 * Displays a single fairness metric result as a card.
 *
 * Props:
 *  - name:        string   — metric name
 *  - value:       number   — raw computed value
 *  - display:     string   — human-readable value (e.g. "28.0%")
 *  - severity:    "safe" | "warning" | "danger"
 *  - description: string   — plain-language explanation
 *  - icon:        string   — emoji icon
 *  - label:       string   — severity label (e.g. "High Bias")
 *  - color:       string   — hex color for severity
 */

export interface BiasMetricCardProps {
  name: string
  value: number
  display: string
  severity: 'safe' | 'warning' | 'danger'
  description: string
  icon: string
  label: string
  color: string
}

export default function BiasMetricCard(props: BiasMetricCardProps) {
  // TODO: implement styled card with animated value reveal
  return <div>{props.name}: {props.display}</div>
}
