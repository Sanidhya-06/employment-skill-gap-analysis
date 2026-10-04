import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import EmployAILayout from './layouts/EmployAILayout'
import Dashboard from './pages/Dashboard'
import AnalyzeProfile from './pages/AnalyzeProfile'
import Results from './pages/Results'

function ModelInsights() {
  return <section className="empty-state"><span className="eyebrow">MODEL INSIGHTS</span><h2>Model insights</h2><p>Connect the project model to surface validated insights here.</p></section>
}

export default function App() {
  return <BrowserRouter><Routes><Route element={<EmployAILayout />}><Route path="/" element={<Dashboard />} /><Route path="/analyze" element={<AnalyzeProfile />} /><Route path="/results" element={<Results />} /><Route path="/insights" element={<ModelInsights />} /><Route path="*" element={<Navigate to="/" replace />} /></Route></Routes></BrowserRouter>
}
