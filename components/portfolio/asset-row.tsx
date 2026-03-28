'use client'

import { Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CategorySelect } from './category-select'
import type { AssetFormEntry } from '@/features/portfolio/types'
import type { AssetCategory } from '@/lib/types/asset'

interface AssetRowProps {
  index: number
  entry: AssetFormEntry
  onChange: (index: number, field: keyof AssetFormEntry, value: string) => void
  onRemove: (index: number) => void
  showRemove: boolean
}

export function AssetRow({ index, entry, onChange, onRemove, showRemove }: AssetRowProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-muted/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Asset {index + 1}
        </p>
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="h-7 w-7 text-gray-500 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor={`name-${index}`}>Asset Name</Label>
          <Input
            id={`name-${index}`}
            placeholder="e.g. Emergency Fund"
            value={entry.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`category-${index}`}>Category</Label>
          <CategorySelect
            value={entry.category}
            onChange={(v) => onChange(index, 'category', v as AssetCategory)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`value-${index}`}>Value (USD)</Label>
          <Input
            id={`value-${index}`}
            type="number"
            min="0"
            step="100"
            placeholder="0"
            value={entry.value}
            onChange={(e) => onChange(index, 'value', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
