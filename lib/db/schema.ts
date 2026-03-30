import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id:          text('id').primaryKey(),
  email:       text('email').notNull().unique(),
  displayName: text('display_name'),
  createdAt:   text('created_at').notNull(),
  updatedAt:   text('updated_at').notNull(),
})

export const assets = sqliteTable('assets', {
  id:        text('id').primaryKey(),
  userId:    text('user_id').notNull().references(() => users.id),
  name:      text('name').notNull(),
  category:  text('category').notNull(),
  // PRECISION NOTE (Phase 1 — acceptable for user-entered values up to ~$1B):
  //   `real` = SQLite REAL = IEEE 754 double (same as JS `number`).
  //   Risk: silent rounding errors for very large values (>10^15) or
  //   high-precision crypto amounts (e.g. 0.000012345678 BTC).
  //
  // MIGRATION REQUIRED before Phase 3 real-data persistence:
  //   Option A (recommended): store as INTEGER in minor units
  //     e.g. USD cents — value: integer('value_cents')
  //     Application layer converts: display = value_cents / 100
  //   Option B: store as TEXT decimal string, parse on read.
  //
  // Until migrated: treat `value` as an approximate number,
  // always round before display, never compare with === for equality.
  value:     real('value').notNull(),
  currency:  text('currency').notNull().default('USD'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
