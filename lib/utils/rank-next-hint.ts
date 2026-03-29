import { ROUTES } from '@/lib/constants/routes'

export type RankHint = {
  text: string
  href: string
}

/**
 * Returns the single most relevant next-step hint for improving rank completeness.
 * Priority order: age → gender → return estimate → null (all inputs present).
 *
 * @param profile.hasAge    - true when birth year is set in Settings
 * @param profile.hasGender - true when gender is set in Settings
 * @param profile.hasReturn - true when annual return estimate is set in Settings
 */
export function getNextRankHint(profile: {
  hasAge:    boolean
  hasGender: boolean
  hasReturn: boolean
}): RankHint | null {
  if (!profile.hasAge) {
    return {
      text: 'Add your birth year in Settings to unlock age-based rank comparison.',
      href: ROUTES.settings,
    }
  }
  if (!profile.hasGender) {
    return {
      text: 'Add your gender in Settings for a more detailed age and gender comparison.',
      href: ROUTES.settings,
    }
  }
  if (!profile.hasReturn) {
    return {
      text: 'Add an estimated annual return in Settings to unlock investment rank.',
      href: ROUTES.settings,
    }
  }
  return null
}
