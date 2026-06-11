'use client'

import { Rocket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { OnboardingCard } from './OnboardingCard'
import { FieldLabel } from './FieldLabel'
import { useOnboardingStore } from '@/stores/use-onboarding-store'
import { CreateProjectInput } from '@trakr/schemas'
import { useMutation } from '@tanstack/react-query'

export default function CreateProjectStep() {
  const { setProjectName, projectName } = useOnboardingStore()
  // const { mutate: createProject } = useMutation({
  //   mutationFn: (input: CreateProjectInput) => createProject(input),
  //   onSuccess: () => {
  //     // setStep(4)
  //   },
  //   onError: (error) => {
  //     console.error(error)
  //   },
  // })
  return (
    <OnboardingCard step={3}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Name your project
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Create your first workspace to start logging issues, tracking sprints,
          and collaborating. You can always rename this later.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <FieldLabel required>Project Name</FieldLabel>
          <Input
            placeholder="e.g. Backend API Rewrite"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </div>

        {/* <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Environment Context
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {environments.map(({ value, label, description, icon: Icon }) => {
              const selected = environment === value

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onEnvironmentChange(value)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                    selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-primary/30',
                  )}
                >
                  <div
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-md',
                      selected
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div>
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        selected ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div> */}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="ghost" onClick={() => {}}>
          Skip &amp; Finish
        </Button>
        <Button
          className="font-semibold"
          // disabled={!canFinish}
          // onClick={onFinish}
        >
          Finish &amp; Go to Dashboard
          <Rocket className="size-4" />
        </Button>
      </div>
    </OnboardingCard>
  )
}
