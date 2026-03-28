'use client'

import { Search } from 'lucide-react'

interface MarketSearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function MarketSearchBar({ value, onChange, placeholder = 'Search symbol or name…' }: MarketSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-surface-border bg-surface-muted pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  )
}
