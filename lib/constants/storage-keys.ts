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
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]

/** All keys as an array — used by export/import */
export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS)
