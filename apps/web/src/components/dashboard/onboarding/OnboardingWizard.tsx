'use client'

import { User } from '@trakr/schemas'
import CreateOrgStep from './CreateOrgStep'
import CreateProjectStep from './CreateProjectStep'
import InviteTeamStep from './InviteTeamStep'
import { useOnboardingStore } from '@/stores/use-onboarding-store'
import { useEffect } from 'react'

export default function OnboardingWizard({ data }: { data: User }) {
  const { step, setStep, setOrgId, orgId } = useOnboardingStore()

  useEffect(() => {
    if (data.orgId) {
      setStep(2)
      if (!orgId) {
        setOrgId(data.orgId)
      }
    }
  }, [data.orgId, orgId, setOrgId, setStep])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {step === 1 && (
        <CreateOrgStep />
      )}

      {step === 2 && (
        <InviteTeamStep />
      )}

      {step === 3 && (
        <CreateProjectStep />
      )}
    </div>
  )
}
