import { InviteUserInput } from "@trakr/schemas";
export type TeamInvite = InviteUserInput

export type EnvironmentContext = 'production' | 'staging'

export type OnboardingData = {
  orgName: string
  orgSlug: string
  invites: TeamInvite[]
  projectName: string
  environment: EnvironmentContext
}
