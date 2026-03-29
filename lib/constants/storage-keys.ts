/** Central registry of all localStorage keys used by the app */
export const STORAGE_KEYS = {
  assets:         'chosen_assets_v1',
  goals:          'chosen_goals_v1',
  transactions:   'chosen_transactions_v1',
  household:      'chosen_household_v1',
  householdNotes: 'chosen_household_notes_v1',
  settings:       'chosen_settings_v1',
  dashboardPrefs: 'chosen_dashboard_prefs_v1',
  audit:          'chosen_audit_v1',
  rankSnapshots:    'chosen_rank_snapshots_v1',
  /** Active benchmark source preference ('default' | 'curated'). Scalar string. */
  benchmarkSource:  'chosen_benchmark_source_v1',
  /** Last-seen benchmark fingerprint for change alerts. Scalar string. */
  benchmarkSeen:    'chosen_benchmark_seen_v1',
  /** Staged BenchmarkFile awaiting application on next load. JSON object or absent. */
  benchmarkPending: 'chosen_benchmark_pending_v1',
  /** Metadata of the last successfully applied benchmark. JSON object or absent. */
  benchmarkApplied: 'chosen_benchmark_applied_v1',
  /** Last-dismissed rank review fingerprint. Scalar string. */
  rankReviewSeen:   'chosen_rank_review_seen_v1',
  /** Last-selected rank comparison mode ('individual' | 'household'). Scalar string. */
  rankComparisonMode: 'chosen_rank_mode_v1',
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

/** All keys as an array — used by export/import */
export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS)
