import { z } from 'zod'
import { ASSET_CATEGORIES } from '@/lib/constants/asset-categories'
import { TRANSACTION_CATEGORIES } from '@/lib/types/transaction'

// ── Assets ────────────────────────────────────────────────────────────────────

// Derived from ASSET_CATEGORIES so adding a new category only requires
// updating the constant — no need to edit this file separately.
const ASSET_CATEGORY_KEYS = ASSET_CATEGORIES.map((c) => c.key) as [string, ...string[]]

const AssetSchema = z.object({
  id:        z.string().min(1).max(100),
  name:      z.string().min(1).max(200).trim(),
  category:  z.enum(ASSET_CATEGORY_KEYS),
  value:     z.number().finite().nonnegative(),
  currency:  z.enum(['USD', 'EUR', 'GBP', 'JPY', 'KRW']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // userId is resolved server-side from the session — not accepted from client
  userId:    z.string().optional(),
})

export const AssetsPayloadSchema = z.array(AssetSchema).max(500)

// ── Goals ─────────────────────────────────────────────────────────────────────

const GoalSchema = z.object({
  id:            z.string().min(1).max(100),
  name:          z.string().min(1).max(200).trim(),
  type:          z.enum(['savings', 'investment', 'retirement', 'purchase', 'debt', 'other']),
  targetAmount:  z.number().finite().nonnegative(),
  currentAmount: z.number().finite().nonnegative(),
  targetDate:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  shared:        z.boolean().optional(),
  createdAt:     z.string().datetime(),
  updatedAt:     z.string().datetime(),
}).refine((g) => g.currentAmount <= g.targetAmount, {
  message: 'currentAmount must not exceed targetAmount',
  path: ['currentAmount'],
})

export const GoalsPayloadSchema = z.array(GoalSchema).max(200)

// ── Transactions ──────────────────────────────────────────────────────────────

const TransactionSchema = z.object({
  id:          z.string().min(1).max(100),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1).max(500).trim(),
  // Positive = income, negative = expense (zero is meaningless)
  amount:      z.number().finite().refine((v) => v !== 0, { message: 'amount must not be zero' }),
  // Derived from TRANSACTION_CATEGORIES so adding a new category only requires
  // updating the constant — no need to edit this file separately.
  category:    z.enum(TRANSACTION_CATEGORIES as unknown as [string, ...string[]]),
  createdAt:   z.string().datetime(),
})

export const TransactionsPayloadSchema = z.array(TransactionSchema).max(2000)
