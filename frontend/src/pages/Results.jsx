import { useLocation } from 'react-router-dom'
import { Card, PageHeader } from '../components/UI'
import './AnalyzeProfile.css'

export default function Results() {
  const location = useLocation()
  const result = location.state?.result ?? JSON.parse(sessionStorage.getItem('employai-analysis-result') || 'null')

  if (!result) return <><PageHeader eyebrow="Analysis workspace" title="Results" description="Complete a profile analysis to see the returned model output."/><Card className="structural-result"><div><div className="result-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></svg></div><h2>No analysis to show yet</h2><p>Submit a profile for analysis to see its model results here.</p></div></Card></>

  return <>
    <PageHeader eyebrow="Analysis workspace" title="Analysis results" description="Live output returned by the Employment Skill Gap Analysis models." />
    <div className="dashboard-grid result-grid">
      <Card className="result-value-card result-employability"><span className="result-label">High employability</span><strong>{result.high_employability ? 'Yes' : 'No'}</strong><span className="result-support">Model class prediction</span></Card>
      <Card className="result-value-card result-probability"><span className="result-label">High employability probability</span><strong>{(result.high_employability_probability * 100).toFixed(2)}%</strong><span className="result-support">Logistic Regression</span></Card>
      <Card className="result-value-card result-salary"><span className="result-label">Estimated annual salary</span><strong>{Number(result.estimated_annual_salary_lpa).toFixed(2)} <small>LPA</small></strong><span className="result-support">Linear Regression · converted from log1p</span></Card>
      <Card className="result-value-card result-cluster"><span className="result-label">K-Means cluster</span><strong>{result.cluster}</strong><span className="result-support">Assigned cluster label</span></Card>
      <Card className="result-detail-card"><div className="card-title">Model details</div><div className="result-detail-row"><span>Employability score</span><b>{Number(result.employability_score).toFixed(2)} / 100</b></div><div className="result-detail-row"><span>Salary prediction · log1p</span><b>{Number(result.salary_prediction_log1p).toFixed(4)}</b></div><div className="result-detail-row"><span>K-Means employability input</span><b>{result.kmeans_employability_score_source}</b></div></Card>
    </div>
  </>
}
