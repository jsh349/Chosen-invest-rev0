import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from './session-provider'

export const metadata: Metadata = {
  title: 'ChosenInvest — AI-Guided Asset Dashboard',
  description: 'Take clear control of your financial future with intelligent portfolio guidance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
