import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { AppShell } from '@/components/layout/app-shell'
import { ROUTES } from '@/lib/constants/routes'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (!session) redirect(ROUTES.login)

  return <AppShell>{children}</AppShell>
}
