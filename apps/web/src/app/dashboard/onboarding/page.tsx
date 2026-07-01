import { redirect } from 'next/navigation'

import OnboardingWizard from '@/components/dashboard/onboarding/OnboardingWizard'
import { getMe } from '../action'

export default async function OnboardingPage() {
  const data = await getMe();

  if (!data) {
    redirect('/auth/login');
  }

  if (data.orgId) {
    redirect('/dashboard');
  }

  return <OnboardingWizard data={data} />
}
