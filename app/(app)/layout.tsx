import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AppShell } from '@/components/layout/app-shell'
import { AssetsProvider } from '@/lib/store/assets-store'
import { GoalsProvider } from '@/lib/store/goals-store'
import { ROUTES } from '@/lib/constants/routes'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect(ROUTES.login)

  return (
    <AssetsProvider>
      <GoalsProvider>
        <AppShell>{children}</AppShell>
      </GoalsProvider>
    </AssetsProvider>
  )
}
