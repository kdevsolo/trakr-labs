import OnboardingWizard from '@/components/dashboard/onboarding/OnboardingWizard'
import { getMe } from '../action'
import { User } from '@trakr/schemas';

export default async function OnboardingPage() {
  const data = await getMe();
  return <OnboardingWizard data={data as User} />
}
