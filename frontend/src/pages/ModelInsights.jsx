import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, PageHeader } from '../components/UI'
import { modelMetrics } from '../data/modelMetrics'
import { kmeansData } from '../data/kmeansData'
import './ModelInsights.css'

const figure = (name) => `http://localhost:8000/ml-figures/${name}`
const percent = (value) => `${(value * 100).toFixed(1)}%`
const logistic = modelMetrics.logistic
const linear = modelMetrics.linear
const kmeans = modelMetrics.kmeans

const clusterColors = ['#7895c4', '#8eab96', '#d4b75f', '#d78d78']

function Metric({ label, value, tone = 'blue', note }) {
  return <div className={`insight-metric ${tone}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
}

function FigureCard({ title, caption, src, alt, className = '' }) {
  return <Card className={`figure-card ${className}`}><div className="figure-heading"><h3>{title}</h3><p>{caption}</p></div><a className="figure-image-link" href={src} target="_blank" rel="noreferrer"><img src={src} alt={alt} loading="lazy"/><span>Open figure ↗</span></a></Card>
}

function TooltipBox({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><span>{label}</span><strong>{payload[0].name}: {payload[0].value}</strong></div>
}

export default function ModelInsights() {
  const metrics = [
    { metric: 'Accuracy', value: logistic.accuracy * 100 },
    { metric: 'Precision', value: logistic.precisionRaw * 100 },
    { metric: 'Recall', value: logistic.recallRaw * 100 },
    { metric: 'F1', value: logistic.f1 * 100 },
    { metric: 'ROC-AUC', value: logistic.rocAucRaw * 100 },
  ]
  const profiles = kmeansData

  return <>
    <PageHeader eyebrow="Model performance" title="Model insights" description="Evaluation metrics and visualizations exported from the project’s trained models."/>
    <div className="insights-page-grid">
      <div className="insights-section-head"><span>01</span><div><div className="eyebrow">Classification</div><h2>Logistic Regression</h2><p>Employability classification evaluation</p></div></div>
      <Card className="insights-metric-strip logistic-strip"><Metric label="Accuracy" value={percent(logistic.accuracy / 100)} tone="blue"/><Metric label="Precision" value={percent(logistic.precisionRaw)} tone="green"/><Metric label="Recall" value={percent(logistic.recallRaw)} tone="yellow"/><Metric label="F1" value={percent(logistic.f1 / 100)} tone="coral"/><Metric label="ROC-AUC" value={logistic.rocAucRaw.toFixed(3)} tone="lavender"/></Card>
      <Card className="insight-chart-card logistic-chart-card"><div className="figure-heading"><h3>Classification metrics</h3><p>Held-out test metrics; cross-validation accuracy is shown separately.</p></div><div className="insight-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={metrics} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}><CartesianGrid vertical={false} stroke="#eeeee9"/><XAxis dataKey="metric" tickLine={false} axisLine={false} tick={{ fill: '#777970', fontSize: 10 }}/><YAxis domain={[0,100]} tickLine={false} axisLine={false} tick={{ fill: '#96978f', fontSize: 9 }} tickFormatter={(value) => `${value}%`}/><Tooltip content={<TooltipBox/>} cursor={{ fill: '#f7f7f3' }}/><Bar dataKey="value" name="Score" radius={[4,4,0,0]} maxBarSize={42}>{metrics.map((entry,index)=><Cell key={entry.metric} fill={clusterColors[index] ?? '#a698bd'}/>)}</Bar></BarChart></ResponsiveContainer></div><div className="cv-note"><span className="cv-dot"/><span>5-fold CV accuracy: <strong>{percent(logistic.cvAccuracyMeanRaw)}</strong> ± {(logistic.cvAccuracyStdRaw * 100).toFixed(2)} percentage points</span></div></Card>
      <div className="logistic-figures"><FigureCard title="Confusion matrix" caption="Saved Logistic Regression confusion matrix." src={figure('08_logistic_confusion.png')} alt="Logistic Regression confusion matrix"/><FigureCard title="Logistic coefficients" caption="Feature coefficient visualization exported by the notebook." src={figure('09_logistic_coefficients.png')} alt="Logistic Regression feature coefficients"/></div>

      <div className="insights-section-head"><span>02</span><div><div className="eyebrow">Regression</div><h2>Linear Regression</h2><p>Salary model comparison from the notebook evaluation</p></div></div>
      <Card className="salary-comparison-card"><div className="figure-heading"><h3>Model comparison</h3><p>All three feature sets reported in the saved linear metrics.</p></div><div className="salary-table-scroll"><table className="salary-table"><thead><tr><th>Feature set</th><th>R² · log</th><th>R² · LPA</th><th>MAE · LPA</th><th>RMSE · LPA</th><th>CV R² · log</th></tr></thead><tbody>{linear.comparisons.map((row) => <tr key={row.model}><th>{row.model}</th><td>{row.r2Log.toFixed(3)}</td><td>{row.r2Raw.toFixed(3)}</td><td>{row.mae.toFixed(3)}</td><td>{row.rmse.toFixed(3)}</td><td>{row.cvR2.toFixed(3)}</td></tr>)}</tbody></table></div><div className="salary-focus"><Metric label="Full model · raw LPA R²" value={linear.r2Raw.toFixed(3)} tone="lavender" note="Feature set C"/><Metric label="Full model · MAE" value={`${linear.mae} LPA`} tone="blue"/><Metric label="Full model · RMSE" value={`${linear.rmse} LPA`} tone="coral"/><Metric label="Full model · CV R² log" value={linear.cvR2.toFixed(3)} tone="green"/></div></Card>
      <FigureCard className="salary-figure" title="Actual vs. predicted salary" caption="Saved Linear Regression actual/predicted and residual plots." src={figure('10_linear_actual_vs_pred.png')} alt="Linear Regression actual versus predicted salary and residual plots"/>

      <div className="insights-section-head"><span>03</span><div><div className="eyebrow">Unsupervised segmentation</div><h2>K-Means</h2><p>Cluster diagnostics and profile summaries</p></div></div>
      <Card className="kmeans-summary-card"><div className="kmeans-topline"><div><div className="figure-heading"><h3>Clustering metrics</h3><p>Saved evaluation output</p></div></div><div className="kmeans-k">k <strong>{kmeans.k}</strong></div></div><div className="kmeans-metrics"><Metric label="Silhouette score" value={kmeans.silhouette.toFixed(3)} tone="blue"/><Metric label="Inertia" value={kmeans.inertia.toLocaleString('en-US',{maximumFractionDigits:3})} tone="lavender"/></div><div className="cluster-summary-list">{profiles.map((cluster,index)=><div className="cluster-summary-row" key={cluster.cluster}><i style={{background:clusterColors[index]}}/><strong>Cluster {cluster.cluster}</strong><span>{cluster.size.toLocaleString()} records</span><span>{cluster.experience} yrs</span><span>{cluster.salary} LPA</span><span>{cluster.employability}% employability</span></div>)}</div></Card>
      <div className="kmeans-figures"><FigureCard title="K selection" caption="Notebook elbow and silhouette diagnostics for candidate k values." src={figure('11_kmeans_k_selection.png')} alt="K-Means elbow and silhouette selection plots"/><FigureCard title="PCA cluster projection" caption="Saved two-component PCA projection colored by K-Means cluster." src={figure('12_kmeans_pca.png')} alt="K-Means cluster projection in PCA space"/></div>
    </div>
  </>
}
