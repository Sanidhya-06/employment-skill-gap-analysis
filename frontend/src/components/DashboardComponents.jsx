import { Card } from './UI'

export function StatCard({ label, value, note, tone = 'blue', icon }) {
  return <Card className="stat-card"><div className="stat-top"><span className="stat-label">{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><div className="stat-value">{value}</div><div className="stat-foot">{note}</div><span className={`stat-accent ${tone}`} /></Card>
}

export function MetricCard({ label, value, helper, tone = 'blue' }) {
  return <div className={`metric-card metric-${tone}`}><span>{label}</span><strong>{value}</strong>{helper && <small>{helper}</small>}</div>
}

export function ChartCard({ title, caption, className = '', children }) {
  return <Card className={`chart-card ${className}`}><div className="card-head"><div><h2 className="card-title">{title}</h2><div className="card-caption">{caption}</div></div></div>{children}</Card>
}

export function SectionHeader({ kicker, title, description, index }) {
  return <div className="section-header"><div className="section-index">{index}</div><div><div className="eyebrow">{kicker}</div><h2>{title}</h2><p>{description}</p></div></div>
}
