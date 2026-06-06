'use client'

import CreateOrgStep from './CreateOrgStep'
import CreateProjectStep from './CreateProjectStep'
import InviteTeamStep from './InviteTeamStep'
import { useOnboardingStore } from '@/stores/use-onboarding-store'

export default function OnboardingWizard() {
  const { step } = useOnboardingStore()

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
