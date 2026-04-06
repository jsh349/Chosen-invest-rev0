import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id:          text('id').primaryKey(),
  email:       text('email').notNull().unique(),
  displayName: text('display_name'),
  createdAt:   text('created_at').notNull(),
  updatedAt:   text('updated_at').notNull(),
})

export const assets = sqliteTable('assets', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => users.id),
  name:       text('name').notNull(),
  category:   text('category').notNull(),
  // Stored as INTEGER minor units (e.g. USD cents) to avoid IEEE 754 float
  // rounding. Application layer converts: value_cents / 100 ↔ display number.
  // e.g. $1 234.56 is stored as 123456.
  valueCents: integer('value_cents').notNull(),
  currency:   text('currency').notNull().default('USD'),
  createdAt:  text('created_at').notNull(),
  updatedAt:  text('updated_at').notNull(),
})

export const goals = sqliteTable('goals', {
  id:                 text('id').primaryKey(),
  userId:             text('user_id').notNull().references(() => users.id),
  name:               text('name').notNull(),
  type:               text('type').notNull(),
  targetAmountCents:  integer('target_amount_cents').notNull(),
  currentAmountCents: integer('current_amount_cents').notNull().default(0),
  targetDate:         text('target_date'),
  shared:             integer('shared', { mode: 'boolean' }).default(false),
  createdAt:          text('created_at').notNull(),
  updatedAt:          text('updated_at').notNull(),
})

export const transactions = sqliteTable('transactions', {
  id:          text('id').primaryKey(),
  userId:      text('user_id').notNull().references(() => users.id),
  date:        text('date').notNull(),
  description: text('description').notNull(),
  // Positive = income, negative = expense. Stored as INTEGER cents.
  amountCents: integer('amount_cents').notNull(),
  category:    text('category').notNull(),
  createdAt:   text('created_at').notNull(),
})
