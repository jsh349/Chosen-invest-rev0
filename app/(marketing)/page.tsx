import Link from 'next/link'
import { ArrowRight, BarChart2, Brain, ShieldCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'

const FEATURES = [
  {
    Icon: BarChart2,
    title: 'Clear Portfolio View',
    description:
      'See every asset, category, and allocation at a glance. No clutter, no confusion.',
  },
  {
    Icon: Brain,
    title: 'AI-Guided Insight',
    description:
      'Chosen AI reads your portfolio and explains what matters — in plain language.',
  },
  {
    Icon: ShieldCheck,
    title: 'Financial Health Signals',
    description:
      'Instant diagnosis of diversification, concentration, liquidity, and growth balance.',
  },
]

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Gradient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-brand-600/10 blur-3xl"
        />

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-900 bg-brand-950/60 px-3 py-1 text-xs text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              AI-powered financial clarity
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Understand your money.
              <br />
              <span className="text-brand-400">Act with confidence.</span>
            </h1>

            <p className="mb-10 text-lg leading-relaxed text-gray-400">
              ChosenInvest is a professional asset operating dashboard that turns your
              portfolio into clear, actionable intelligence — guided by AI, designed
              for real decisions.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href={ROUTES.login} className={cn(buttonVariants({ size: 'lg' }), 'gap-1')}>
                Get Started Free
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
              <Link href={ROUTES.login} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Sign In
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="border-t border-surface-border py-20">
        <Container>
          <div className="mx-auto mb-14 max-w-xl text-center">
            <h2 className="mb-3 text-2xl font-bold text-white">
              Built for financial clarity
            </h2>
            <p className="text-gray-400">
              Not a trading app. Not a budgeting tool. A professional operating layer
              for your entire financial picture.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-surface-border bg-surface-card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-950">
                  <Icon className="h-5 w-5 text-brand-400" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="border-t border-surface-border py-20">
        <Container>
          <div className="mx-auto max-w-lg text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Start with what you have
            </h2>
            <p className="mb-8 text-gray-400">
              Enter your assets manually in minutes. No bank link required.
              See your full financial picture immediately.
            </p>
            <Link href={ROUTES.login} className={cn(buttonVariants({ size: 'lg' }), 'gap-1')}>
              Open Your Dashboard
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      <footer className="border-t border-surface-border py-8">
        <Container>
          <p className="text-center text-xs text-gray-600">
            © 2026 ChosenInvest. For informational purposes only. Not financial advice.
          </p>
        </Container>
      </footer>
    </div>
  )
}
