import { z } from 'zod'

export const assetFormEntrySchema = z.object({
  name:     z.string().min(1, 'Asset name is required'),
  category: z.enum(['cash', 'stock', 'etf', 'crypto', 'retirement', 'real_estate', 'other']),
  value:    z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, {
    message: 'Value must be a positive number',
  }),
  currency: z.string().default('USD'),
})
