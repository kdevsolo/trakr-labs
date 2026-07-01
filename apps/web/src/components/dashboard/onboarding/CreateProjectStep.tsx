'use client'

import { Loader2, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createProject } from '@/lib/api/projects'
import { useOnboardingStore } from '@/stores/use-onboarding-store'

import { OnboardingCard } from './OnboardingCard'
import { FieldLabel } from './FieldLabel'

export default function CreateProjectStep() {
  const router = useRouter()
  const { setProjectName, projectName, orgId } = useOnboardingStore()

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => createProject({ name: projectName }),
    onSuccess: () => {
      router.push('/dashboard')
    },
  })

  const canFinish = projectName.trim().length > 0 && orgId.length > 0

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
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to create project. Please try again.'}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="ghost" disabled={isPending} onClick={() => router.push('/dashboard')}>
          Skip &amp; Finish
        </Button>
        <Button
          className="font-semibold"
          disabled={!canFinish || isPending}
          onClick={() => mutate()}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              Finish &amp; Go to Dashboard
              <Rocket className="size-4" />
            </>
          )}
        </Button>
      </div>
    </OnboardingCard>
  )
}
