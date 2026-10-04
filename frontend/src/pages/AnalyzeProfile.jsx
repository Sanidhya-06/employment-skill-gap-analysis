import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, PageHeader } from '../components/UI'
import ProfileFormField from '../components/ProfileFormField'
import { analyzeProfile } from '../services/api'
import './AnalyzeProfile.css'

const initialProfile = {
  years_experience: '', seniority_level: '', certifications_count: '',
  profile_completeness_pct: '', endorsement_count: '', skill_count: '',
  education_level: '', last_profile_update: '', connections_tier: '',
  in_demand_skill_flag: '', open_to_work: '', uses_generative_ai_tools: '',
  work_mode: '', estimated_annual_salary_lpa: '',
}

const selectChoices = {
  seniority_level: ['Entry-level', 'Associate', 'Mid-Senior', 'Senior', 'Lead/Principal', 'Director+'],
  education_level: ['Bootcamp/Certification-only', 'Diploma', "Bachelor's", "Master's", 'PhD'],
  last_profile_update: ['6+ months ago', '3-6 months ago', '1-3 months ago', 'This month', 'This week'],
  connections_tier: ['<50', '50-150', '150-500', '500+', '1000+'],
  work_mode: ['On-site', 'Hybrid', 'Remote'],
}

const numericFields = [
  { name: 'years_experience', label: 'Years of experience', max: 80, step: '0.1' },
  { name: 'certifications_count', label: 'Certifications count', max: 1000, step: '1' },
  { name: 'profile_completeness_pct', label: 'Profile completeness (%)', max: 100, step: '0.1' },
  { name: 'endorsement_count', label: 'Endorsement count', max: 10000000, step: '1' },
  { name: 'skill_count', label: 'Skill count', max: 10000, step: '1' },
  { name: 'estimated_annual_salary_lpa', label: 'Estimated annual salary (LPA)', min: '0.01', max: 100000, step: '0.01' },
]

function buildPayload(form) {
  return {
    ...form,
    years_experience: Number(form.years_experience),
    certifications_count: Number(form.certifications_count),
    profile_completeness_pct: Number(form.profile_completeness_pct),
    endorsement_count: Number(form.endorsement_count),
    skill_count: Number(form.skill_count),
    estimated_annual_salary_lpa: Number(form.estimated_annual_salary_lpa),
    in_demand_skill_flag: form.in_demand_skill_flag === 'true',
    open_to_work: form.open_to_work === 'true',
    uses_generative_ai_tools: form.uses_generative_ai_tools === 'true',
  }
}

export default function AnalyzeProfile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(initialProfile)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (event) => {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }))
    if (error) setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    setSubmitting(true)
    setError('')
    try {
      const result = await analyzeProfile(buildPayload(profile))
      sessionStorage.setItem('employai-analysis-result', JSON.stringify(result))
      navigate('/results', { state: { result } })
    } catch (requestError) {
      setError(requestError.message || 'The analysis could not be completed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const setField = (field) => <ProfileFormField key={field.name} {...field} value={profile[field.name]} onChange={update} />
  const setSelect = (name, label) => <ProfileFormField key={name} name={name} label={label} type="select" options={selectChoices[name]} value={profile[name]} onChange={update} />
  const setBoolean = (name, label) => <ProfileFormField key={name} name={name} label={label} type="boolean" value={profile[name]} onChange={update} />

  return <>
    <PageHeader eyebrow="Profile workspace" title="Analyze your profile" description="Enter the profile details used by the employment analysis models." />
    <div className="form-layout analyze-form-layout">
      <Card className="form-card profile-form-card">
        <div className="form-section-heading"><span className="form-section-number">01</span><div><h2>Experience and profile</h2><p>Use the values that describe the profile you want to analyze.</p></div></div>
        <form onSubmit={submit}>
          <div className="profile-fields-grid">
            {setField({ ...numericFields[0], type: 'number', min: '0' })}
            {setSelect('seniority_level', 'Seniority level')}
            {setField({ ...numericFields[1], type: 'number', min: '0' })}
            {setField({ ...numericFields[2], type: 'number', min: '0' })}
            {setField({ ...numericFields[3], type: 'number', min: '0' })}
            {setField({ ...numericFields[4], type: 'number', min: '0' })}
            {setSelect('education_level', 'Education level')}
            {setSelect('last_profile_update', 'Last profile update')}
            {setSelect('connections_tier', 'Connections tier')}
            {setSelect('work_mode', 'Work mode')}
            {setBoolean('in_demand_skill_flag', 'Has in-demand skills')}
            {setBoolean('open_to_work', 'Open to work')}
            {setBoolean('uses_generative_ai_tools', 'Uses generative AI tools')}
            {setField({ ...numericFields[5], type: 'number' })}
          </div>
          {error && <div className="api-error" role="alert"><span className="api-error-icon">!</span><div><strong>Analysis could not be completed</strong><p>{error}</p></div></div>}
          <div className="form-actions profile-form-actions"><button className="button" type="button" disabled={submitting} onClick={() => { setProfile(initialProfile); setError('') }}>Clear form</button><button className="button primary" type="submit" disabled={submitting}>{submitting ? <><span className="button-spinner"/>Analyzing profile…</> : <>Analyze profile <span aria-hidden="true">→</span></>}</button></div>
        </form>
      </Card>
      <Card className="info-panel profile-info-panel"><div className="insight-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1"/><circle cx="12" cy="12" r="4"/></svg></div><div className="eyebrow" style={{ marginTop: 15 }}>About this analysis</div><p>The form uses the profile inputs accepted by the analysis API. Categorical fields match the model’s training categories.</p><div className="info-list"><div><span className="check-mark">✓</span><span>All fields are required by the API</span></div><div><span className="check-mark">✓</span><span>Salary is entered in LPA</span></div><div><span className="check-mark">✓</span><span>Predictions are returned by the connected models</span></div></div><div className="api-status-note"><span className="status-dot"/> API endpoint <code>127.0.0.1:8000</code></div></Card>
    </div>
  </>
}
