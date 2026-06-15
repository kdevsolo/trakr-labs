'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, Plus } from 'lucide-react'
import { type InviteUserInput } from '@trakr/schemas'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { inviteOrgMember } from '@/lib/api/users'

import { OnboardingCard } from './OnboardingCard'
import { FieldLabel } from './FieldLabel'
import { useOnboardingStore } from '@/stores/use-onboarding-store'

// Invites are inherently organization-level: at onboarding no projects exist
// yet, so only org-scoped grants are meaningful here. Per-project access is
// granted later via "add member" once projects exist. The options below map
// directly to the backend's ORG_ALLOWED_GRANTS:
//   - USER: full CRUD (manage org members)
//   - PROJECT: CREATE only (ability to create new projects)
type OrgRole = 'admin' | 'project_creator' | 'member'

type LocalInvite = {
  name: string
  email: string
  orgRole: OrgRole
}

const DEFAULT_INVITE: LocalInvite = {
  name: '',
  email: '',
  orgRole: 'member',
}

const ORG_ROLE_GRANTS: Record<OrgRole, InviteUserInput['permissions']> = {
  admin: [
    { resource: 'USER', action: 'READ' },
    { resource: 'USER', action: 'CREATE' },
    { resource: 'USER', action: 'UPDATE' },
    { resource: 'USER', action: 'DELETE' },
    { resource: 'PROJECT', action: 'CREATE' },
  ],
  project_creator: [{ resource: 'PROJECT', action: 'CREATE' }],
  member: [],
}

const ORG_ROLE_OPTIONS: { value: OrgRole; label: string; hint: string }[] = [
  { value: 'admin', label: 'Admin', hint: 'Manage members & create projects' },
  { value: 'project_creator', label: 'Project creator', hint: 'Can create projects' },
  { value: 'member', label: 'Member', hint: 'Project access granted later' },
]

function derivePermissions(role: OrgRole): InviteUserInput['permissions'] {
  return ORG_ROLE_GRANTS[role]
}

export default function InviteTeamStep() {
  const { setInvites, setStep } = useOnboardingStore()
  const [localInvites, setLocalInvites] = useState<LocalInvite[]>([{ ...DEFAULT_INVITE }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateInvite<K extends keyof LocalInvite>(index: number, field: K, value: LocalInvite[K]) {
    setLocalInvites(prev =>
      prev.map((invite, i) => i === index ? { ...invite, [field]: value } : invite)
    )
  }

  async function handleContinue() {
    const validInvites: InviteUserInput[] = localInvites
      .filter(i => i.name.trim() && i.email.trim())
      .map(i => ({
        name: i.name,
        email: i.email,
        permissions: derivePermissions(i.orgRole),
      }))

    if (validInvites.length === 0) {
      setStep(3)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await Promise.all(validInvites.map(invite => inviteOrgMember(invite)))
      setInvites(validInvites)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invites. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleSkip() {
    setInvites([])
    setStep(3)
  }

  return (
    <OnboardingCard step={2}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Invite your team
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Collaboration is key. Add engineers, QA, and product managers to
          start triaging issues immediately.{' '}
          <span className="text-foreground/70">(Optional)</span>
        </p>
      </div>

      <div className="space-y-4">
        {localInvites.map((invite, index) => (
          <div key={index} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel>Name</FieldLabel>
              <Input
                type="text"
                placeholder="John Doe"
                value={invite.name}
                onChange={e => updateInvite(index, 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>Email Address</FieldLabel>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={invite.email}
                onChange={e => updateInvite(index, 'email', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <FieldLabel>Organization Access</FieldLabel>
              <Select
                value={invite.orgRole}
                onValueChange={value => updateInvite(index, 'orgRole', value as OrgRole)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  {ORG_ROLE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.hint}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setLocalInvites(prev => [...prev, { ...DEFAULT_INVITE }])}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          <Plus className="size-4" />
          Add another member
        </button>
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Button variant="ghost" onClick={handleSkip} disabled={loading}>
          Skip for now
        </Button>
        <Button className="font-semibold" onClick={handleContinue} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending Invites…
            </>
          ) : (
            <>
              Send Invites &amp; Continue
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </OnboardingCard>
  )
}
