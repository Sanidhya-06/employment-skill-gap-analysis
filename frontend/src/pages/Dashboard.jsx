import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../components/UI'
import { ChartCard, MetricCard, SectionHeader, StatCard } from '../components/DashboardComponents'
import { kmeansData } from '../data/kmeansData'
import { modelMetrics } from '../data/modelMetrics'
import './Dashboard.css'

const clusterColors = ['#7895c4', '#8eab96', '#d4b75f', '#d78d78']
const pct = (value) => `${value}%`
const ratio = (value) => value.toFixed(3)
const number = (value) => value.toLocaleString('en-US')

function Icon({ children }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg> }

function MetricTooltip({ active, payload, suffix = '%' }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><span>{payload[0].payload.name}</span><strong>{payload[0].value}{suffix}</strong></div>
}

function ClusterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return <div className="chart-tooltip"><span>Cluster {d.cluster}</span><strong>{number(d.size)} profiles</strong><small>{d.experience} years · {d.salary} LPA</small></div>
}

export default function Dashboard() {
  const { logistic, linear } = modelMetrics
  const total = kmeansData.reduce((sum, cluster) => sum + cluster.size, 0)
  const classificationMetrics = [
    { name: 'Accuracy', value: logistic.accuracy },
    { name: 'Precision', value: logistic.precision },
    { name: 'Recall', value: logistic.recall },
    { name: 'F1', value: logistic.f1 },
    { name: 'ROC-AUC', value: logistic.rocAuc * 100 },
  ]
  const salaryMetrics = [
    { label: 'R² · raw LPA', value: ratio(linear.r2Raw), helper: 'Raw salary scale', tone: 'lavender' },
    { label: 'MAE', value: `${linear.mae} LPA`, helper: 'Mean absolute error', tone: 'blue' },
    { label: 'RMSE', value: `${linear.rmse} LPA`, helper: 'Root mean squared error', tone: 'coral' },
    { label: '5-fold CV R²', value: ratio(linear.cvR2), helper: 'Cross-validation', tone: 'green' },
  ]

  return <>
    <header className="dashboard-hero"><div className="hero-copy"><div className="eyebrow-row"><span className="status-dot"/><span className="eyebrow">EmployAI · Analytics overview</span></div><h1>Employment &amp; Skill Gap Analytics</h1><p>Explore the model performance and workforce segments in your employment dataset.</p></div><div className="hero-mark"><Icon><path d="m4 16 5-5 3 3 8-8"/><path d="M15 6h5v5"/><path d="M4 20h16"/></Icon></div></header>

    <div className="dashboard-grid analytics-grid">
      <StatCard label="Dataset size" value={number(total)} note="Records across 4 K-Means clusters" tone="blue" icon={<Icon><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h4"/></Icon>}/>
      <StatCard label="Logistic Regression accuracy" value={pct(logistic.accuracy)} note="Classification accuracy" tone="green" icon={<Icon><path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="9"/></Icon>}/>
      <StatCard label="Logistic Regression ROC-AUC" value={ratio(logistic.rocAuc)} note="Area under ROC curve" tone="yellow" icon={<Icon><path d="M4 18V6M4 18h16"/><path d="m7 15 3-3 3 1 5-6"/></Icon>}/>
      <StatCard label="Salary model R²" value={ratio(linear.r2Raw)} note="R² on raw LPA" tone="lavender" icon={<Icon><path d="M12 3v18M17 7.5c0-1.4-1.8-2.5-4-2.5S9 6.1 9 7.5 10.8 10 13 10s4 1.1 4 2.5-1.8 2.5-4 2.5-4-1.1-4-2.5"/></Icon>}/>

      <div className="section-break"><SectionHeader index="01" kicker="Classification" title="Employability" description="Logistic Regression model performance"/></div>
      <ChartCard title="Classification metrics" caption="Accuracy, precision, recall and F1 are percentages. ROC-AUC is shown on a 0–100 scale." className="metric-chart-card">
        <div className="chart-wrap tall-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={classificationMetrics} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="#eeeee9"/><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#777970', fontSize: 11 }}/><YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: '#96978f', fontSize: 10 }} tickFormatter={(v) => `${v}%`}/><Tooltip content={<MetricTooltip/>} cursor={{ fill: '#f7f7f3' }}/><Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={48}>{classificationMetrics.map((entry, i) => <Cell key={entry.name} fill={['#7895c4','#8eab96','#d4b75f','#d78d78','#a698bd'][i]}/>)}</Bar></BarChart></ResponsiveContainer></div>
      </ChartCard>
      <Card className="side-metric-card"><div className="eyebrow">At a glance</div><div className="big-metric">{ratio(logistic.rocAuc)}</div><div className="big-metric-label">ROC-AUC</div><p>Logistic Regression’s area under the receiver operating characteristic curve.</p><div className="side-divider"/><div className="inline-stat"><span>Cross-validation accuracy</span><b>{pct(logistic.cvAccuracy)}</b></div><div className="inline-stat"><span>Accuracy</span><b>{pct(logistic.accuracy)}</b></div></Card>

      <div className="section-break"><SectionHeader index="02" kicker="Regression" title="Salary model" description="Linear Regression evaluation on salary outcomes"/></div>
      <ChartCard title="Salary metrics" caption="Error values are in LPA; R² scores are unitless." className="salary-card">
        <div className="salary-metric-grid">{salaryMetrics.map((metric) => <MetricCard key={metric.label} {...metric}/>)}</div>
        <div className="salary-note"><span className="note-dot"/>Raw-scale R² is shown here; the model also reports R² on log salary.</div>
      </ChartCard>
      <ChartCard title="Model scores" caption="R² scores from the supplied model metrics." className="r2-chart-card">
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={[{ name: 'Raw LPA', value: linear.r2Raw }, { name: '5-fold CV', value: linear.cvR2 }]} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="#eeeee9"/><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#777970', fontSize: 10 }}/><YAxis domain={[0, 1]} tickLine={false} axisLine={false} tick={{ fill: '#96978f', fontSize: 10 }} tickFormatter={(v) => v.toFixed(1)}/><Tooltip content={<MetricTooltip suffix=""/>} cursor={{ fill: '#f7f7f3' }}/><Bar dataKey="value" fill="#a698bd" radius={[5,5,0,0]} maxBarSize={45}/></BarChart></ResponsiveContainer></div>
      </ChartCard>

      <div className="section-break"><SectionHeader index="03" kicker="Segmentation" title="K-Means clusters" description={`Four clusters across ${number(total)} dataset records, with the supplied average experience, salary and employability values.`}/></div>
      <ChartCard title="Cluster sizes" caption="Record count by cluster" className="cluster-chart-card">
        <div className="chart-wrap tall-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={kmeansData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}><CartesianGrid vertical={false} stroke="#eeeee9"/><XAxis dataKey="cluster" tickFormatter={(v) => `Cluster ${v}`} tickLine={false} axisLine={false} tick={{ fill: '#777970', fontSize: 10 }}/><YAxis tickLine={false} axisLine={false} tick={{ fill: '#96978f', fontSize: 10 }} tickFormatter={(v) => number(v)}/><Tooltip content={<ClusterTooltip/>} cursor={{ fill: '#f7f7f3' }}/><Bar dataKey="size" radius={[5,5,0,0]} maxBarSize={66}>{kmeansData.map((entry, i) => <Cell key={entry.cluster} fill={clusterColors[i]}/>)}</Bar></BarChart></ResponsiveContainer></div>
      </ChartCard>
      <Card className="cluster-table-card"><div className="cluster-table-head"><div><div className="card-title">Cluster profile</div><div className="card-caption">Values shown exactly as supplied</div></div><span className="table-unit">Salary · LPA</span></div><div className="cluster-list">{kmeansData.map((cluster, index) => <div className="cluster-row" key={cluster.cluster}><span className="cluster-chip" style={{ '--cluster-color': clusterColors[index] }}>0{cluster.cluster}</span><div className="cluster-description"><strong>{number(cluster.size)}</strong><span>profiles</span></div><div className="cluster-detail"><span>Experience</span><b>{cluster.experience} yr</b></div><div className="cluster-detail"><span>Salary</span><b>{cluster.salary}</b></div><div className="cluster-detail"><span>Employability</span><b>{cluster.employability}%</b></div></div>)}</div></Card>

      <div className="section-break"><SectionHeader index="04" kicker="Data notes" title="What the metrics show" description="Direct comparisons from the supplied model metrics and cluster summaries."/></div>
      <Card className="insights-card"><div className="insight-item"><span className="insight-number">01</span><div><strong>Classification scores are closely grouped.</strong><p>Logistic Regression accuracy, precision, recall and F1 range from {Math.min(logistic.accuracy, logistic.precision, logistic.recall, logistic.f1)}% to {Math.max(logistic.accuracy, logistic.precision, logistic.recall, logistic.f1)}% in the provided metrics.</p></div><span className="insight-swatch blue"/></div><div className="insight-item"><span className="insight-number">02</span><div><strong>Cluster 1 has the highest listed averages.</strong><p>Among the four cluster records, Cluster 1 has the highest experience ({kmeansData[1].experience} years), salary ({kmeansData[1].salary} LPA) and employability ({kmeansData[1].employability}%).</p></div><span className="insight-swatch green"/></div><div className="insight-item"><span className="insight-number">03</span><div><strong>Cluster 0 is the largest group.</strong><p>It contains {number(kmeansData[0].size)} records, compared with {number(kmeansData[2].size)} in the smallest group, Cluster 2.</p></div><span className="insight-swatch coral"/></div></Card>
      <Card className="summary-card"><div className="eyebrow">Dataset composition</div><div className="summary-total">{number(total)}</div><div className="summary-label">records represented</div><div className="summary-bar">{kmeansData.map((cluster, i) => <span key={cluster.cluster} style={{ width: `${cluster.size / total * 100}%`, background: clusterColors[i] }} title={`Cluster ${cluster.cluster}: ${number(cluster.size)}`}/>)}</div><div className="summary-legend">{kmeansData.map((cluster, i) => <span key={cluster.cluster}><i style={{ background: clusterColors[i] }}/>Cluster {cluster.cluster} · {number(cluster.size)}</span>)}</div></Card>
    </div>
  </>
}
