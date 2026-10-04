const ANALYZE_URL = 'http://localhost:8000/analyze'

export async function analyzeProfile(profile) {
  let response
  try {
    response = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
  } catch {
    throw new Error('Could not reach the analysis API. Check that FastAPI is running at http://localhost:8000.')
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = body?.detail
    const message = Array.isArray(detail)
      ? detail.map((issue) => `${issue.loc?.slice(-1)[0] ?? 'Input'}: ${issue.msg}`).join(' ')
      : detail || `Analysis failed with status ${response.status}.`
    throw new Error(message)
  }
  return body
}
