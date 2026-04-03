import { cn } from '@/lib/utils/cn'
import type { FinancialHealthCard, HealthStatus } from '@/lib/types/health-card'

interface HealthCardsGridProps {
  cards: FinancialHealthCard[]
}

const statusConfig: Record<HealthStatus, { label: string; dotClass: string; textClass: string; cardBorderClass: string }> = {
  good:      { label: 'Good',      dotClass: 'bg-emerald-500', textClass: 'text-emerald-400', cardBorderClass: 'border-surface-border'  },
  warning:   { label: 'Watch',     dotClass: 'bg-amber-400',   textClass: 'text-amber-400',   cardBorderClass: 'border-surface-border'  },
  attention: { label: 'Attention', dotClass: 'bg-red-500',     textClass: 'text-red-400',     cardBorderClass: 'border-red-500/25'      },
}

function ScoreBar({ score }: { score: number }) {
  const width = `${Math.min(100, Math.max(0, score))}%`
  const color =
    score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500'
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-muted">
      <div
        className={cn('h-1.5 rounded-full transition-all', color)}
        style={{ width }}
      />
    </div>
  )
}

export function HealthCardsGrid({ cards }: HealthCardsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const cfg = statusConfig[card.status]
        return (
          <div
            key={card.key}
            className={cn('rounded-xl border bg-surface-card p-4 space-y-3', cfg.cardBorderClass)}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{card.title}</p>
              <span className={cn('flex items-center gap-1.5 text-xs font-medium', cfg.textClass)}>
                <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dotClass)} />
                {cfg.label}
              </span>
            </div>
            <ScoreBar score={card.score} />
            <p className="text-xs leading-relaxed text-gray-400">{card.message}</p>
          </div>
        )
      })}
    </div>
  )
}
