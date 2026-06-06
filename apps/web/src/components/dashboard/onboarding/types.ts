export type TeamRole = 'Developer' | 'QA' | 'Product Manager' | 'Admin'

export type TeamInvite = {
  email: string
  role: TeamRole
}

export type EnvironmentContext = 'production' | 'staging'

export type OnboardingData = {
  orgName: string
  orgSlug: string
  invites: TeamInvite[]
  projectName: string
  environment: EnvironmentContext
}
