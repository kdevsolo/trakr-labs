import { cn } from '@/lib/utils'

type OnboardingProgressProps = {
  step: 1 | 2 | 3
}

export function OnboardingProgress({ step }: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Step {step} of 3
      </span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 w-8 rounded-full transition-colors',
              index <= step ? 'bg-primary' : 'bg-border',
            )}
          />
        ))}
      </div>
    </div>
  )
}
