import { env } from '../../config/env.js'

export class NemotronProvider {
  async generateExplanation(input) {
    if (!env.nemotronBaseUrl || !env.nemotronModel) throw new Error('Nemotron is not configured')
    const response = await fetch(`${env.nemotronBaseUrl.replace(/\/$/, '')}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(env.nemotronApiKey ? { Authorization: `Bearer ${env.nemotronApiKey}` } : {}) }, body: JSON.stringify({ model: env.nemotronModel, temperature: 0, messages: [{ role: 'system', content: 'You are an explanation assistant. You MUST NOT determine, modify, infer, override, or recalculate scheme eligibility. Explain ONLY the supplied deterministic result. Return JSON with summary, why_this_scheme, eligibility_explanation, financial_explanation, verification_required, important_note.' }, { role: 'user', content: JSON.stringify(input) }] }), signal: AbortSignal.timeout(env.nemotronTimeoutMs) })
    if (!response.ok) throw new Error(`Nemotron request failed: ${response.status}`)
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Nemotron returned no explanation')
    const parsed = JSON.parse(content)
    if (typeof parsed.summary !== 'string' || !Array.isArray(parsed.why_this_scheme)) throw new Error('Malformed Nemotron explanation')
    return parsed
  }
}
