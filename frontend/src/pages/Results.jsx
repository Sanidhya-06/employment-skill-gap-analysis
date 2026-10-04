import { Card, PageHeader } from '../components/UI'

export default function Results() {
  return <><PageHeader eyebrow="Analysis workspace" title="Results" description="Your analysis output will be shown here when available."/><Card className="structural-result"><div><div className="result-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></svg></div><h2>Results will appear here</h2><p>This page is ready to display validated output from the project model. No results have been generated.</p></div></Card></>
}
