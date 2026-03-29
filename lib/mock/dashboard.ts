import type { AIAnalysisResult } from '@/lib/types/dashboard'
import type { FinancialHealthCard } from '@/lib/types/health-card'

export const MOCK_AI_ANALYSIS: AIAnalysisResult = {
  userId: 'user_demo_001',
  summaryText:
    'Your portfolio is well-diversified across real estate, retirement accounts, and market-based assets. Real estate is your largest position at 44%, providing a stable foundation. Your retirement savings are strong relative to your overall asset base. Crypto exposure is modest and within a reasonable range. Consider increasing liquid cash reserves slightly to improve near-term flexibility.',
  keyPoints: [
    'Strong retirement base at $120K',
    'Real estate anchors long-term stability',
    'Crypto is under 5% — manageable risk',
    'Cash coverage could be broader',
  ],
  suggestedActions: [
    { label: 'Increase cash reserves to 10%', href: '/portfolio/input' },
    { label: 'Review real estate concentration', href: '/portfolio/input' },
  ],
  inputSnapshot: {
    totalValue: 495000,
    assetCount: 6,
    topCategory: 'real_estate',
  },
  generatedAt: '2026-03-28T00:00:00Z',
}

export const MOCK_HEALTH_CARDS: FinancialHealthCard[] = [
  {
    key: 'diversification',
    title: 'Diversification',
    status: 'good',
    message: 'Assets spread across 5 categories. Solid foundation.',
    score: 82,
    generatedAt: '2026-03-28T00:00:00Z',
  },
  {
    key: 'concentration',
    title: 'Concentration Risk',
    status: 'warning',
    message: 'Real estate is 44% of total. Single-asset dominance to watch.',
    score: 58,
    generatedAt: '2026-03-28T00:00:00Z',
  },
  {
    key: 'liquidity',
    title: 'Liquidity',
    status: 'attention',
    message: 'Cash is only 5% of portfolio. Consider building emergency buffer.',
    score: 42,
    generatedAt: '2026-03-28T00:00:00Z',
  },
  {
    key: 'balance',
    title: 'Growth Balance',
    status: 'good',
    message: 'Mix of growth assets and stable holdings looks healthy.',
    score: 76,
    generatedAt: '2026-03-28T00:00:00Z',
  },
]
