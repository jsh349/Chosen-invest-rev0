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
            {analysis.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                {point}
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-gray-600">
          Generated {new Date(analysis.generatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
