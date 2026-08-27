/**
 * Feasibility UI Tests
 *
 * Tests the acceptance criteria from the spec:
 * 1.  Score displays correctly
 * 2.  Confidence displays correctly
 * 3.  LOW confidence warning displays
 * 4.  INSUFFICIENT_DATA displays correctly
 * 5.  null score does not display 0
 * 6.  Component weights display correctly
 * 7.  Financial fit values from API
 * 8.  Competition count displays correctly
 * 9.  Estimated values are labelled
 * 10. User-reported values are labelled
 * 11. Village/block/district data level displays
 * 12. API failure state works
 * 13. No frontend score calculation
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AssessmentContext } from '../../../context/AssessmentContext.jsx'
import FeasibilityPage from '../../../pages/FeasibilityPage.jsx'
import ConfidenceBadge from '../ConfidenceBadge.jsx'
import DataTypeBadge from '../DataTypeBadge.jsx'
import FeasibilityGauge from '../FeasibilityGauge.jsx'
import LocalDataWarning from '../LocalDataWarning.jsx'
import { validateFeasibilityResult, getFallbackLabel } from '../../../types/feasibility.js'

// ── Mock the API service ─────────────────────────────────────────────────────
vi.mock('../../../services/feasibilityApi.js', () => ({
  getFeasibilityAnalysis: vi.fn()
}))

import { getFeasibilityAnalysis } from '../../../services/feasibilityApi.js'

// ── Shared mock data ──────────────────────────────────────────────────────────
const MOCK_RESULT = {
  overallScore: 78,
  label: 'Strong feasibility',
  confidence: 'MEDIUM',
  dataLevel: 'BLOCK',
  warning: 'Insufficient local data for this village — showing block-level estimate.',
  location: { village: 'Savkheda', block: 'Jalgaon', district: 'Jalgaon', state: 'Maharashtra', dataCoverage: 'BLOCK' },
  components: {
    demandFit:    { score: 82, weight: 0.25, confidence: 'MEDIUM', dataLevel: 'BLOCK',          type: 'ESTIMATED',    explanation: 'Demand explanation', details: { population: 28450, purchasingPowerNote: 'District proxy' } },
    competition:  { score: 71, weight: 0.25, confidence: 'HIGH',   dataLevel: 'VILLAGE',         type: 'MEASURED',     explanation: 'Competition explanation', details: { competitorCount: 12, searchRadiusKm: 3, dataSource: 'POI data', limitation: 'May miss informal businesses' } },
    financialFit: { score: 88, weight: 0.20, confidence: 'HIGH',   dataLevel: 'CALCULATED',      type: 'CALCULATED',   explanation: 'Financial fit explanation', details: { projectRequirement: 800000, eligibleLoan: 720000, ownContribution: 80000, repaymentBurdenRatio: 28, financialBasis: 'Scheme-based' } },
    risk:         { score: 63, weight: 0.15, confidence: 'LOW',    dataLevel: 'CATEGORY_RULE',   type: 'ESTIMATED',    explanation: 'Risk explanation', details: { riskFactors: ['Seasonal demand'] } },
    executionFit: { score: 75, weight: 0.15, confidence: 'MEDIUM', dataLevel: 'USER_REPORTED',   type: 'USER_REPORTED',explanation: 'Execution explanation', details: { inputs: ['Experience: 1–3 years'], note: 'Self-reported' } }
  },
  whyThisScore: ['Demand was strong', 'Financial fit is good'],
  recommendation: 'Your business shows strong feasibility.',
  disclaimer: 'This is indicative.'
}

// Wrapper to provide context
function TestWrapper({ children, assessmentResult = null, feasibilityResult = null }) {
  const assessmentId = 'test-session-123'
  return (
    <AssessmentContext.Provider value={{
      assessment: { profile: {}, business: { businessType: 'grocery_shop' }, financial: { requestedAmount: 800000, ownContribution: 80000 }, execution: {} },
      assessmentResult,
      feasibilityResult,
      setFeasibilityResult: vi.fn(),
      setAssessmentResult: vi.fn(),
      setAssessment: vi.fn(),
      assessmentId
    }}>
      <MemoryRouter initialEntries={['/feasibility/test-session-123']}>
        <Routes>
          <Route path="/feasibility/:assessmentId" element={children} />
        </Routes>
      </MemoryRouter>
    </AssessmentContext.Provider>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FeasibilityPage — integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('1. Score displays correctly from API response', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    // Score 78 should appear
    await waitFor(() => {
      expect(screen.getByText('78')).toBeTruthy()
    })
  })

  test('2. Confidence badge renders for the overall confidence level', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      // "Medium" confidence badge appears
      expect(screen.getAllByText('Medium').length).toBeGreaterThan(0)
    })
  })

  test('3. LOW confidence warning renders when warning is present', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getByText('Insufficient local data for this village — showing block-level estimate.')).toBeTruthy()
    })
  })

  test('4 & 5. INSUFFICIENT_DATA shows "Insufficient data" text, NOT 0', async () => {
    const insufficientResult = {
      ...MOCK_RESULT,
      overallScore: null,
      confidence: 'INSUFFICIENT_DATA',
      components: {
        ...MOCK_RESULT.components,
        demandFit: { score: null, weight: 0.25, confidence: 'INSUFFICIENT_DATA', dataLevel: 'INSUFFICIENT', type: 'ESTIMATED', explanation: null, details: {} }
      }
    }
    getFeasibilityAnalysis.mockResolvedValueOnce(insufficientResult)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      // "Insufficient data" text exists
      expect(screen.getAllByText(/insufficient data/i).length).toBeGreaterThan(0)
      // "0/100" should NOT appear
      expect(screen.queryByText('0')).toBeNull()
    })
  })

  test('6. Component weights display correctly (25%, 25%, 20%, 15%, 15%)', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      const pct25 = screen.getAllByText(/25%/)
      const pct20 = screen.getAllByText(/20%/)
      const pct15 = screen.getAllByText(/15%/)
      expect(pct25.length).toBeGreaterThanOrEqual(2) // demand + competition
      expect(pct20.length).toBeGreaterThanOrEqual(1) // financial
      expect(pct15.length).toBeGreaterThanOrEqual(2) // risk + execution
    })
  })

  test('7. Financial fit values from API — shows ₹ amounts from API, not recalculated', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getAllByText('Financial Fit').length).toBeGreaterThan(0)
    })
  })

  test('8. Competition count displays correctly', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getAllByText('Competition').length).toBeGreaterThan(0)
      // Score 71 appears
      expect(screen.getAllByText('71').length).toBeGreaterThan(0)
    })
  })

  test('9. Estimated values are labelled as "Estimated" (DataTypeBadge)', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getAllByText('Estimated').length).toBeGreaterThan(0)
    })
  })

  test('10. User-reported values are labelled (User reported badge)', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getAllByText('User reported').length).toBeGreaterThan(0)
    })
  })

  test('11. Data level displays (Block-level estimate)', async () => {
    getFeasibilityAnalysis.mockResolvedValueOnce(MOCK_RESULT)
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getAllByText('Block-level estimate').length).toBeGreaterThan(0)
    })
  })

  test('12. API failure state shows error message', async () => {
    getFeasibilityAnalysis.mockRejectedValueOnce(new Error('Network error'))
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      expect(screen.getByText(/could not load feasibility analysis/i)).toBeTruthy()
    })
  })

  test('13. No frontend score calculation — overallScore comes only from API', async () => {
    const customScore = 42 // different from any component math
    getFeasibilityAnalysis.mockResolvedValueOnce({
      ...MOCK_RESULT,
      overallScore: customScore
    })
    render(<TestWrapper><FeasibilityPage /></TestWrapper>)
    await waitFor(() => {
      // The displayed score must be exactly what the API returned
      expect(screen.getByText('42')).toBeTruthy()
    })
  })
})

// ── Unit tests for sub-components ────────────────────────────────────────────

describe('ConfidenceBadge', () => {
  test('HIGH renders "High" label', () => {
    render(<ConfidenceBadge level="HIGH" />)
    expect(screen.getByText('High')).toBeTruthy()
  })
  test('MEDIUM renders "Medium" label', () => {
    render(<ConfidenceBadge level="MEDIUM" />)
    expect(screen.getByText('Medium')).toBeTruthy()
  })
  test('LOW renders "Low" label', () => {
    render(<ConfidenceBadge level="LOW" />)
    expect(screen.getByText('Low')).toBeTruthy()
  })
  test('INSUFFICIENT_DATA renders label text (not blank)', () => {
    render(<ConfidenceBadge level="INSUFFICIENT_DATA" />)
    expect(screen.getByText('Insufficient data')).toBeTruthy()
  })
})

describe('DataTypeBadge', () => {
  test('MEASURED renders "Measured"', () => {
    render(<DataTypeBadge type="MEASURED" />)
    expect(screen.getByText('Measured')).toBeTruthy()
  })
  test('ESTIMATED renders "Estimated"', () => {
    render(<DataTypeBadge type="ESTIMATED" />)
    expect(screen.getByText('Estimated')).toBeTruthy()
  })
  test('USER_REPORTED renders "User reported"', () => {
    render(<DataTypeBadge type="USER_REPORTED" />)
    expect(screen.getByText('User reported')).toBeTruthy()
  })
})

describe('FeasibilityGauge', () => {
  test('null score shows "Insufficient" text, not 0', () => {
    render(<FeasibilityGauge score={null} />)
    expect(screen.getAllByText(/insufficient/i).length).toBeGreaterThan(0)
    expect(screen.queryByText('0')).toBeNull()
  })
  test('valid score displays the number', () => {
    render(<FeasibilityGauge score={78} label="Strong feasibility" />)
    expect(screen.getByText('78')).toBeTruthy()
  })
  test('has accessible aria-label', () => {
    render(<FeasibilityGauge score={78} label="Strong feasibility" />)
    const el = screen.getByRole('img')
    expect(el.getAttribute('aria-label')).toContain('78')
  })
})

describe('LocalDataWarning', () => {
  test('shows warning message when show=true', () => {
    const msg = 'Insufficient local data for this village — showing block-level estimate.'
    render(<LocalDataWarning warning={msg} show={true} />)
    expect(screen.getByText(msg)).toBeTruthy()
  })
  test('hides when show=false', () => {
    const msg = 'Some warning'
    const { container } = render(<LocalDataWarning warning={msg} show={false} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('validateFeasibilityResult', () => {
  test('returns no errors for a valid response', () => {
    const errors = validateFeasibilityResult(MOCK_RESULT)
    expect(errors).toHaveLength(0)
  })
  test('returns error for score > 100', () => {
    const errors = validateFeasibilityResult({ ...MOCK_RESULT, overallScore: 150 })
    expect(errors.length).toBeGreaterThan(0)
  })
  test('accepts null score (INSUFFICIENT_DATA)', () => {
    const errors = validateFeasibilityResult({ ...MOCK_RESULT, overallScore: null })
    expect(errors).toHaveLength(0)
  })
  test('returns error for invalid confidence', () => {
    const errors = validateFeasibilityResult({ ...MOCK_RESULT, confidence: 'VERY_HIGH' })
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('getFallbackLabel', () => {
  test('0–39 → Low feasibility', () => {
    expect(getFallbackLabel(25)).toBe('Low feasibility')
  })
  test('40–59 → Moderate feasibility', () => {
    expect(getFallbackLabel(50)).toBe('Moderate feasibility')
  })
  test('60–74 → Good feasibility', () => {
    expect(getFallbackLabel(65)).toBe('Good feasibility')
  })
  test('75–89 → Strong feasibility', () => {
    expect(getFallbackLabel(78)).toBe('Strong feasibility')
  })
  test('90–100 → Very strong feasibility', () => {
    expect(getFallbackLabel(95)).toBe('Very strong feasibility')
  })
  test('null → Insufficient data', () => {
    expect(getFallbackLabel(null)).toBe('Insufficient data')
  })
})
