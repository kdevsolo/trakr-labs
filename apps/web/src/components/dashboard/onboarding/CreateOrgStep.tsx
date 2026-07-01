'use client'

import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { OnboardingCard } from './OnboardingCard'
import { FieldLabel } from './FieldLabel'
import { useMutation } from '@tanstack/react-query'
import { createOrganization } from '@/lib/api/organization'
import { useOnboardingStore } from '@/stores/use-onboarding-store'
import { CreateOrganizationInput } from '@trakr/schemas'

export default function CreateOrgStep() {
  const { orgName, setOrgName, setOrgId, setStep } = useOnboardingStore()
  const canContinue = orgName.trim().length > 0

  const { mutate: createOrg } = useMutation({
    mutationFn: (input: CreateOrganizationInput) => createOrganization(input),
    onSuccess: (data) => {
      setOrgId(data.id)
      setStep(2)
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const handleContinue = () => {
    createOrg({ name: orgName })
  }

  return (
    <OnboardingCard step={1}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create Organization
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Name your new workspace. This acts as the central hub for your team,
          projects, and billing.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <FieldLabel>Organization Name</FieldLabel>
          <Input
            placeholder="e.g. Acme Corp"
            value={orgName}
            onChange={(event) => setOrgName(event.target.value)}
          />
        </div>
      </div>

      <Button
        className="h-11 w-full text-sm font-semibold"
        size="lg"
        disabled={!canContinue}
        onClick={handleContinue}
      >
        Continue to Team
        <ArrowRight className="size-4" />
      </Button>
    </OnboardingCard>
  )
}
