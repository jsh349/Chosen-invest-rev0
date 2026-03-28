import { MarketingHeader } from '@/components/layout/marketing-header'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-surface">
      <MarketingHeader />
      {children}
    </div>
  )
}
