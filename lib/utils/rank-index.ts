import type { RankResult } from '@/lib/types/rank'

/**
 * Named index of a RankResult array by type.
 * Centralises all rank-type string literals so they appear in one place only.
 */
export type IndexedRanks = {
  overall:   RankResult | undefined
  ageBased:  RankResult | undefined
  ageGender: RankResult | undefined
  ret:       RankResult | undefined
}

/**
 * Indexes a RankResult array by type for convenient named access.
 * Eliminates repeated .find((r) => r.type === '...') calls in callers.
 */
export function indexRanks(ranks: RankResult[]): IndexedRanks {
  return {
    overall:   ranks.find((r) => r.type === 'overall_wealth'),
    ageBased:  ranks.find((r) => r.type === 'age_based'),
    ageGender: ranks.find((r) => r.type === 'age_gender'),
    ret:       ranks.find((r) => r.type === 'investment_return'),
  }
}
