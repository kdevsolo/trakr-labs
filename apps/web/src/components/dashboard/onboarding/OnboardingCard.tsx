import { cn } from '@/lib/utils'

import { OnboardingProgress } from './OnboardingProgress'

type OnboardingCardProps = {
  step: 1 | 2 | 3
  children: React.ReactNode
  className?: string
}

export function OnboardingCard({ step, children, className }: OnboardingCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        className,
      )}
    >
      <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-orange-400" />
      <div className="space-y-8 p-8">
        <OnboardingProgress step={step} />
        {children}
      </div>
    </div>
  )
}
