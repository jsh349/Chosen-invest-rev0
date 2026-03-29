'use client'

import { ASSET_CATEGORIES } from '@/lib/constants/asset-categories'
import type { AssetCategory } from '@/lib/types/asset'
import { cn } from '@/lib/utils/cn'

interface CategorySelectProps {
  value: AssetCategory
  onChange: (value: AssetCategory) => void
  disabled?: boolean
}

export function CategorySelect({ value, onChange, disabled }: CategorySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as AssetCategory)}
      disabled={disabled}
      className={cn(
        'flex h-10 w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50',
        'appearance-none'
      )}
    >
      {ASSET_CATEGORIES.map((cat) => (
        <option key={cat.key} value={cat.key} className="bg-surface-card">
          {cat.label}
        </option>
      ))}
    </select>
  )
}
