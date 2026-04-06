import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { AIAnalysisResult } from '@/lib/types/dashboard'

interface AISummaryCardProps {
  analysis: AIAnalysisResult
}

export function AISummaryCard({ analysis }: AISummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
        <span className="rounded-full bg-brand-950 px-2 py-0.5 text-xs text-brand-400 border border-brand-900">
          Chosen AI
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-gray-300">{analysis.summaryText}</p>

        {analysis.keyPoints.length > 0 && (
          <ul className="space-y-1.5">
            {analysis.keyPoints.map((point) => (
              <li key={point} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                {point}
              </li>
            ))}
          </ul>
        )}

        {analysis.suggestedActions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggested Actions</p>
            {analysis.suggestedActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-muted/40 px-3 py-2 text-xs text-gray-300 hover:border-brand-700 hover:text-white transition-colors"
              >
                {action.label}
                <ArrowRight className="h-3 w-3 shrink-0 text-gray-500" />
              </Link>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-600">
          Generated {new Date(analysis.generatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
