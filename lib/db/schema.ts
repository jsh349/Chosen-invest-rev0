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
  value:     real('value').notNull(),
  currency:  text('currency').notNull().default('USD'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})
